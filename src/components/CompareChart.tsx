import { formatRupiah } from "@/lib/format";
import type { Debt } from "@/types/debt";

/**
 * Bar chart sederhana pakai SVG murni (gak nambah dependency chart library
 * cuma buat 2 bar) buat bandingin total dihutang vs hutang, termasuk yang
 * sudah lunas biar kelihatan gambaran besarnya.
 */
export function CompareChart({ debts }: { debts: Debt[] }) {
  const owedToMe = debts
    .filter((d) => d.type === "owed_to_me")
    .reduce((sum, d) => sum + d.amount, 0);
  const iOwe = debts
    .filter((d) => d.type === "i_owe")
    .reduce((sum, d) => sum + d.amount, 0);

  const max = Math.max(owedToMe, iOwe, 1);
  const bars = [
    { label: "Dihutang ke saya", value: owedToMe, color: "#10b981" },
    { label: "Saya hutang", value: iOwe, color: "#ef4444" },
  ];

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-200">
      <h3 className="text-sm font-medium text-neutral-500">Perbandingan total (semua entry)</h3>
      <div className="mt-4 space-y-3">
        {bars.map((bar) => (
          <div key={bar.label}>
            <div className="mb-1 flex items-center justify-between text-xs text-neutral-500">
              <span>{bar.label}</span>
              <span className="font-medium text-neutral-700">{formatRupiah(bar.value)}</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(bar.value / max) * 100}%`,
                  backgroundColor: bar.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
