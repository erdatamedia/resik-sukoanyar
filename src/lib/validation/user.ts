import { z } from "zod"

export const userSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi").max(100),
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  role: z.enum(["ADMIN", "PETUGAS_PENARIK", "PETUGAS_SAMPAH"]),
  desaId: z.string().optional(),
  password: z
    .string()
    .min(6, "Password minimal 6 karakter")
    .optional()
    .or(z.literal("")),
})

export type UserFormValues = z.infer<typeof userSchema>
