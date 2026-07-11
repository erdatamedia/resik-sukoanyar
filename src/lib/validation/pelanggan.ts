import { z } from "zod"

export const pelangganSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi").max(100),
  alamat: z.string().min(1, "Alamat wajib diisi").max(200),
  noHp: z
    .string()
    .min(1, "Nomor HP wajib diisi")
    .regex(/^(\+?62|0)8[0-9]{8,12}$/, "Format nomor HP tidak valid (contoh: 08123456789)"),
  desaId: z.string().min(1, "Desa wajib dipilih"),
  iuran: z.number({ error: "Iuran harus berupa angka" }).min(0, "Iuran tidak boleh negatif"),
  statusAktif: z.enum(["AKTIF", "NONAKTIF"]),
})

export type PelangganFormValues = z.infer<typeof pelangganSchema>
