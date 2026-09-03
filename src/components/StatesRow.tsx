import { AlertCircle, Inbox, Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-neutral-200 bg-white py-16 text-neutral-400">
      <Loader2 size={28} className="animate-spin" />
      <p className="text-sm">Memuat catatan...</p>
    </div>
  );
}

export function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-200 bg-white py-16 text-center">
      <Inbox size={28} className="text-neutral-300" />
      <p className="text-sm font-medium text-neutral-600">
        {hasFilters ? "Gak ada catatan yang cocok" : "Belum ada catatan"}
      </p>
      <p className="max-w-xs text-sm text-neutral-400">
        {hasFilters
          ? "Coba ubah filter atau kata kunci pencarian kamu."
          : "Klik \"Catat baru\" buat mulai nyatat utang piutang kamu."}
      </p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-red-200 bg-red-50 py-16 text-center">
      <AlertCircle size={28} className="text-red-400" />
      <p className="text-sm font-medium text-red-600">{message}</p>
      <button
        onClick={onRetry}
        className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
      >
        Coba lagi
      </button>
    </div>
  );
}
