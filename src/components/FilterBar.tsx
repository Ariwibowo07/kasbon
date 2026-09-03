"use client";

import { Plus, Search } from "lucide-react";
import type { SortDir, SortKey, StatusFilter, TypeFilter } from "@/types/debt";

interface FilterBarProps {
  status: StatusFilter;
  type: TypeFilter;
  search: string;
  sort: SortKey;
  dir: SortDir;
  onStatusChange: (v: StatusFilter) => void;
  onTypeChange: (v: TypeFilter) => void;
  onSearchChange: (v: string) => void;
  onSortChange: (sort: SortKey, dir: SortDir) => void;
  onAddClick: () => void;
}

export function FilterBar({
  status,
  type,
  search,
  sort,
  dir,
  onStatusChange,
  onTypeChange,
  onSearchChange,
  onSortChange,
  onAddClick,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-[220px]">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari nama orang..."
            className="w-full rounded-lg border border-neutral-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
          />
        </div>

        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
        >
          <option value="all">Semua status</option>
          <option value="unpaid">Belum lunas</option>
          <option value="settled">Lunas</option>
        </select>

        <select
          value={type}
          onChange={(e) => onTypeChange(e.target.value as TypeFilter)}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
        >
          <option value="all">Semua tipe</option>
          <option value="owed_to_me">Dihutang</option>
          <option value="i_owe">Hutang</option>
        </select>

        <select
          value={`${sort}:${dir}`}
          onChange={(e) => {
            const [s, d] = e.target.value.split(":") as [SortKey, SortDir];
            onSortChange(s, d);
          }}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
        >
          <option value="created_at:desc">Terbaru</option>
          <option value="created_at:asc">Terlama</option>
          <option value="amount:desc">Jumlah terbesar</option>
          <option value="amount:asc">Jumlah terkecil</option>
          <option value="due_date:asc">Jatuh tempo terdekat</option>
        </select>
      </div>

      <button
        onClick={onAddClick}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
      >
        <Plus size={16} />
        Catat baru
      </button>
    </div>
  );
}
