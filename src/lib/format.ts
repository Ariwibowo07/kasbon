/**
 * Format angka jadi Rupiah sesuai locale id-ID: "Rp 1.234.000".
 * Pakai Intl.NumberFormat bawaan browser/Node, bukan string manipulation manual,
 * supaya separator ribuan selalu konsisten dan tidak salah locale.
 */
export function formatRupiah(amount: number): string {
  const formatted = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
  return `Rp ${formatted}`;
}

/**
 * Relative time ala Bahasa Indonesia casual: "3 hari lalu", "kemarin", "baru saja".
 */
export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  if (diffSec < 60) return "baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHour < 24) return `${diffHour} jam lalu`;
  if (diffDay === 1) return "kemarin";
  if (diffDay < 7) return `${diffDay} hari lalu`;
  if (diffDay < 30) {
    const weeks = Math.round(diffDay / 7);
    return `${weeks} minggu lalu`;
  }
  if (diffDay < 365) {
    const months = Math.round(diffDay / 30);
    return `${months} bulan lalu`;
  }
  const years = Math.round(diffDay / 365);
  return `${years} tahun lalu`;
}

export function formatDateID(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
