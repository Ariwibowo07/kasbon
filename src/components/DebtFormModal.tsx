"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Debt, DebtInput, DebtType } from "@/types/debt";

interface DebtFormModalProps {
  open: boolean;
  initialDebt: Debt | null;
  onClose: () => void;
  onSubmit: (input: DebtInput) => Promise<string | null>; // returns error message or null
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function DebtFormModal({ open, initialDebt, onClose, onSubmit }: DebtFormModalProps) {
  const [type, setType] = useState<DebtType>("owed_to_me");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (initialDebt) {
      // Sync form fields to the debt being edited whenever the modal opens.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setType(initialDebt.type);
      setName(initialDebt.counterpart_name);
      setAmount(String(initialDebt.amount));
      setDate(initialDebt.due_date ?? todayISO());
      setNote(initialDebt.note ?? "");
    } else {
      setType("owed_to_me");
      setName("");
      setAmount("");
      setDate(todayISO());
      setNote("");
    }
    setErrors({});
    setFormError(null);
  }, [open, initialDebt]);

  if (!open) return null;

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = "Nama orang wajib diisi";
    const amountNum = Number(amount);
    if (!amount || Number.isNaN(amountNum) || amountNum <= 0) {
      nextErrors.amount = "Jumlah harus angka lebih dari 0";
    }
    if (note.length > 200) nextErrors.note = "Catatan maksimal 200 karakter";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    const err = await onSubmit({
      type,
      counterpart_name: name.trim(),
      amount: Math.round(Number(amount)),
      due_date: date || null,
      note: note.trim() || null,
    });
    setSubmitting(false);

    if (err) {
      setFormError(err);
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">
            {initialDebt ? "Edit catatan" : "Catat baru"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <span className="block text-sm font-medium text-neutral-700">Tipe</span>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <label
                className={`flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  type === "owed_to_me"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-neutral-300 text-neutral-600"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  className="sr-only"
                  checked={type === "owed_to_me"}
                  onChange={() => setType("owed_to_me")}
                />
                Saya dihutang
              </label>
              <label
                className={`flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  type === "i_owe"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-neutral-300 text-neutral-600"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  className="sr-only"
                  checked={type === "i_owe"}
                  onChange={() => setType("i_owe")}
                />
                Saya hutang
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
              Nama orang
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              placeholder="Budi"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-neutral-700">
              Jumlah (Rp)
            </label>
            <input
              id="amount"
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              placeholder="100000"
            />
            {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount}</p>}
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-neutral-700">
              Tanggal
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div>
            <label htmlFor="note" className="block text-sm font-medium text-neutral-700">
              Catatan <span className="text-neutral-400">(opsional)</span>
            </label>
            <textarea
              id="note"
              value={note}
              maxLength={200}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              placeholder="Buat modal jajan"
            />
            <div className="mt-1 flex justify-between text-xs text-neutral-400">
              <span>{errors.note}</span>
              <span>{note.length}/200</span>
            </div>
          </div>

          {formError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
          >
            {submitting ? "Menyimpan..." : initialDebt ? "Simpan perubahan" : "Simpan catatan"}
          </button>
        </form>
      </div>
    </div>
  );
}
