import { formatRupiah } from "@/lib/format";
import type { Debt } from "@/types/debt";
import { ArrowDownCircle, ArrowUpCircle, Scale } from "lucide-react";

export function SummaryCards({ debts }: { debts: Debt[] }) {
  const totalOwedToMe = debts
    .filter((d) => d.type === "owed_to_me" && !d.settled_at)
    .reduce((sum, d) => sum + d.amount, 0);

  const totalIOwe = debts
    .filter((d) => d.type === "i_owe" && !d.settled_at)
    .reduce((sum, d) => sum + d.amount, 0);

  const net = totalOwedToMe - totalIOwe;
  const netPositive = net >= 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-200">
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-500">
          <ArrowDownCircle size={16} className="text-emerald-500" />
          Total dihutang ke saya
        </div>
        <p className="mt-2 text-2xl font-semibold text-neutral-900">
          {formatRupiah(totalOwedToMe)}
        </p>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-200">
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-500">
          <ArrowUpCircle size={16} className="text-red-500" />
          Total saya hutang
        </div>
        <p className="mt-2 text-2xl font-semibold text-neutral-900">
          {formatRupiah(totalIOwe)}
        </p>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-200">
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-500">
          <Scale size={16} className={netPositive ? "text-emerald-500" : "text-red-500"} />
          Net
        </div>
        <p
          className={`mt-2 text-2xl font-semibold ${
            netPositive ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {netPositive ? "+" : "-"}
          {formatRupiah(Math.abs(net))}
        </p>
      </div>
    </div>
  );
}
