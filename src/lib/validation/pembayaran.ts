import { z } from "zod"

export const pembayaranSchema = z.object({
  pelangganId: z.string().min(1, "Pelanggan wajib dipilih"),
  nominal: z.number({ error: "Nominal harus berupa angka" }).min(0, "Nominal tidak boleh negatif"),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  status: z.enum(["LUNAS", "BELUM"]),
})

export type PembayaranFormValues = z.infer<typeof pembayaranSchema>
