import { z } from "zod"

export const pengeluaranSchema = z.object({
  kategori: z.string().min(1, "Kategori wajib diisi").max(100),
  nominal: z.number({ error: "Nominal harus berupa angka" }).min(0, "Nominal tidak boleh negatif"),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
})

export type PengeluaranFormValues = z.infer<typeof pengeluaranSchema>
