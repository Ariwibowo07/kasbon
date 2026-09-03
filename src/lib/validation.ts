import { z } from "zod";

/**
 * Skema validasi input debt. Dipakai di client (form) dan server (API route)
 * supaya aturan validasi cuma didefinisikan sekali.
 */
export const debtInputSchema = z.object({
  type: z.enum(["owed_to_me", "i_owe"], {
    message: "Tipe harus 'owed_to_me' atau 'i_owe'",
  }),
  counterpart_name: z
    .string()
    .trim()
    .min(1, "Nama orang wajib diisi")
    .max(120, "Nama orang maksimal 120 karakter"),
  amount: z
    .number({ message: "Jumlah wajib berupa angka" })
    .int("Jumlah harus bilangan bulat (Rupiah tanpa desimal)")
    .positive("Jumlah harus lebih dari 0"),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD")
    .nullable()
    .optional(),
  note: z
    .string()
    .trim()
    .max(200, "Catatan maksimal 200 karakter")
    .nullable()
    .optional(),
});

export const debtUpdateSchema = debtInputSchema.partial().extend({
  settled: z.boolean().optional(),
});

export const listQuerySchema = z.object({
  status: z.enum(["all", "unpaid", "settled"]).default("all"),
  type: z.enum(["all", "owed_to_me", "i_owe"]).default("all"),
  search: z.string().trim().max(120).optional(),
  sort: z.enum(["created_at", "amount", "due_date"]).default("created_at"),
  dir: z.enum(["asc", "desc"]).default("desc"),
});
