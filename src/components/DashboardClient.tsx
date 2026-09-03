"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SummaryCards } from "@/components/SummaryCards";
import { CompareChart } from "@/components/CompareChart";
import { FilterBar } from "@/components/FilterBar";
import { DebtItem } from "@/components/DebtItem";
import { DebtFormModal } from "@/components/DebtFormModal";
import { EmptyState, ErrorState, LoadingState } from "@/components/StatesRow";
import type {
  Debt,
  DebtInput,
  SortDir,
  SortKey,
  StatusFilter,
  TypeFilter,
} from "@/types/debt";

async function fetchDebts(params: Record<string, string>): Promise<Debt[]> {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`/api/debts?${query}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Gagal memuat data.");
  return json.data as Debt[];
}

export function DashboardClient() {
  // Data buat summary card & chart selalu dari keseluruhan entry (tanpa filter).
  const [allDebts, setAllDebts] = useState<Debt[] | null>(null);

  // Data buat list, dipengaruhi filter/search/sort.
  const [listDebts, setListDebts] = useState<Debt[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  const [status, setStatus] = useState<StatusFilter>("all");
  const [type, setType] = useState<TypeFilter>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("created_at");
  const [dir, setDir] = useState<SortDir>("desc");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const refreshSummary = useCallback(async () => {
    try {
      const data = await fetchDebts({});
      setAllDebts(data);
    } catch {
      // Summary gagal load bukan blocker fatal - list utama tetap jalan.
      setAllDebts([]);
    }
  }, []);

  const refreshList = useCallback(async () => {
    setListError(null);
    try {
      const data = await fetchDebts({
        status,
        type,
        search: debouncedSearch,
        sort,
        dir,
      });
      setListDebts(data);
    } catch (e) {
      setListError(e instanceof Error ? e.message : "Gagal memuat catatan.");
    }
  }, [status, type, debouncedSearch, sort, dir]);

  useEffect(() => {
    // Fetch on mount and whenever the underlying data may have changed
    // (mutations call refreshSummary() directly, not through this effect).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshSummary();
  }, [refreshSummary]);

  useEffect(() => {
    // Re-fetch the filtered list whenever filter/sort/search state changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshList();
  }, [refreshList]);

  const hasActiveFilters =
    status !== "all" || type !== "all" || debouncedSearch.trim() !== "";

  function openCreateModal() {
    setEditingDebt(null);
    setModalOpen(true);
  }

  function openEditModal(debt: Debt) {
    setEditingDebt(debt);
    setModalOpen(true);
  }

  async function handleFormSubmit(input: DebtInput): Promise<string | null> {
    const isEdit = Boolean(editingDebt);
    const res = await fetch(isEdit ? `/api/debts/${editingDebt!.id}` : "/api/debts", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const json = await res.json();
    if (!res.ok) return json.error ?? "Gagal menyimpan catatan.";

    await Promise.all([refreshSummary(), refreshList()]);
    return null;
  }

  async function handleToggleSettled(debt: Debt) {
    const res = await fetch(`/api/debts/${debt.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settled: !debt.settled_at }),
    });
    if (res.ok) {
      await Promise.all([refreshSummary(), refreshList()]);
    }
  }

  async function handleDelete(debt: Debt) {
    const res = await fetch(`/api/debts/${debt.id}`, { method: "DELETE" });
    if (res.ok) {
      await Promise.all([refreshSummary(), refreshList()]);
    }
  }

  const summaryDebts = useMemo(() => allDebts ?? [], [allDebts]);

  return (
    <div className="space-y-6">
      <SummaryCards debts={summaryDebts} />

      {allDebts && allDebts.length > 0 && <CompareChart debts={summaryDebts} />}

      <FilterBar
        status={status}
        type={type}
        search={search}
        sort={sort}
        dir={dir}
        onStatusChange={setStatus}
        onTypeChange={setType}
        onSearchChange={setSearch}
        onSortChange={(s, d) => {
          setSort(s);
          setDir(d);
        }}
        onAddClick={openCreateModal}
      />

      {listError ? (
        <ErrorState message={listError} onRetry={refreshList} />
      ) : listDebts === null ? (
        <LoadingState />
      ) : listDebts.length === 0 ? (
        <EmptyState hasFilters={hasActiveFilters} />
      ) : (
        <ul className="space-y-3">
          {listDebts.map((debt) => (
            <DebtItem
              key={debt.id}
              debt={debt}
              onToggleSettled={handleToggleSettled}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}

      <DebtFormModal
        open={modalOpen}
        initialDebt={editingDebt}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
