"use client";

import { useState } from "react";
import { Check, Pencil, Trash2 } from "lucide-react";
import type { Debt } from "@/types/debt";
import { formatDateID, formatRelativeTime, formatRupiah } from "@/lib/format";

interface DebtItemProps {
  debt: Debt;
  onToggleSettled: (debt: Debt) => Promise<void>;
  onEdit: (debt: Debt) => void;
  onDelete: (debt: Debt) => Promise<void>;
}

export function DebtItem({ debt, onToggleSettled, onEdit, onDelete }: DebtItemProps) {
  const [busy, setBusy] = useState<"toggle" | "delete" | null>(null);
  const isSettled = Boolean(debt.settled_at);
  const isOwedToMe = debt.type === "owed_to_me";

  async function handleToggle() {
    setBusy("toggle");
    try {
      await onToggleSettled(debt);
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete() {
    if (!confirm(`Hapus catatan "${debt.counterpart_name}"? Ini gak bisa dibatalin.`)) return;
    setBusy("delete");
    try {
      await onDelete(debt);
    } finally {
      setBusy(null);
    }
  }

  return (
    <li className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-200 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 inline-flex h-2.5 w-2.5 shrink-0 rounded-full ${
            isOwedToMe ? "bg-emerald-500" : "bg-red-500"
          }`}
          aria-hidden
        />
        <div>
          <p className="font-medium text-neutral-900">{debt.counterpart_name}</p>
          <p className="text-sm text-neutral-500">
            {isOwedToMe ? "Dihutang ke saya" : "Saya hutang"} ·{" "}
            <span className={isOwedToMe ? "text-emerald-600" : "text-red-600"}>
              {formatRupiah(debt.amount)}
            </span>
          </p>
          <p className="mt-0.5 text-xs text-neutral-400">
            {formatRelativeTime(debt.created_at)}
            {debt.due_date && ` · Jatuh tempo ${formatDateID(debt.due_date)}`}
            {debt.note && ` · ${debt.note}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:ml-4">
        <span
          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
            isSettled ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
          }`}
        >
          {isSettled ? "Lunas" : "Belum lunas"}
        </span>

        <div className="flex items-center gap-1">
          {!isSettled && (
            <button
              onClick={handleToggle}
              disabled={busy !== null}
              title="Tandai lunas"
              className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
            >
              <Check size={16} />
            </button>
          )}
          <button
            onClick={() => onEdit(debt)}
            disabled={busy !== null}
            title="Edit"
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 disabled:opacity-50"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={handleDelete}
            disabled={busy !== null}
            title="Hapus"
            className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </li>
  );
}
