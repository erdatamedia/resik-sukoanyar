import bcrypt from "bcryptjs"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client.ts"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const desaNames = ["Sukoanyar", "Kidangbang", "Sukolilo"]

  const desaRecords: Record<string, string> = {}
  for (const nama of desaNames) {
    const desa = await prisma.desa.upsert({
      where: { nama },
      update: {},
      create: { nama },
    })
    desaRecords[nama] = desa.id
  }

  const defaultPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin123"
  const passwordHash = await bcrypt.hash(defaultPassword, 10)

  const seedUsers = [
    { nama: "Admin RESIK", email: "admin@resik.local", role: "ADMIN" as const },
    { nama: "Budi Penarik", email: "penarik@resik.local", role: "PETUGAS_PENARIK" as const },
    { nama: "Sari Pengambil", email: "sampah@resik.local", role: "PETUGAS_SAMPAH" as const },
  ]

  for (const u of seedUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { nama: u.nama, email: u.email, passwordHash, role: u.role },
    })
  }

  const seedPelanggan = [
    { nama: "Budi Santoso", alamat: "Jl. Mawar No. 12, RT 03/RW 01", desa: "Sukoanyar", iuran: 20000, noHp: "6281234567001" },
    { nama: "Siti Aminah", alamat: "Jl. Melati No. 5, RT 01/RW 02", desa: "Sukoanyar", iuran: 20000, noHp: "6281234567002" },
    { nama: "Joko Widodo", alamat: "Jl. Kenanga No. 8, RT 02/RW 01", desa: "Kidangbang", iuran: 25000, noHp: "6281234567003" },
    { nama: "Dewi Lestari", alamat: "Jl. Anggrek No. 3, RT 04/RW 03", desa: "Sukolilo", iuran: 20000, noHp: "6281234567004" },
  ]

  for (const p of seedPelanggan) {
    const existing = await prisma.pelanggan.findFirst({ where: { nama: p.nama } })
    if (!existing) {
      await prisma.pelanggan.create({
        data: {
          nama: p.nama,
          alamat: p.alamat,
          noHp: p.noHp,
          desaId: desaRecords[p.desa],
          iuran: p.iuran,
          statusAktif: "AKTIF",
        },
      })
    }
  }

  console.log("Seed selesai: 3 desa + 3 user (admin/penarik/sampah)@resik.local + 4 pelanggan contoh, password:", defaultPassword)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
