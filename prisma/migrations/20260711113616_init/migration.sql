-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PETUGAS_PENARIK', 'PETUGAS_SAMPAH');

-- CreateEnum
CREATE TYPE "StatusAktif" AS ENUM ('AKTIF', 'NONAKTIF');

-- CreateEnum
CREATE TYPE "VerifikasiStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED', 'OVERRIDE_MANUAL');

-- CreateEnum
CREATE TYPE "StatusPembayaran" AS ENUM ('LUNAS', 'BELUM');

-- CreateEnum
CREATE TYPE "JenisNotifikasi" AS ENUM ('REMINDER_TAGIHAN', 'KONFIRMASI_PEMBAYARAN');

-- CreateEnum
CREATE TYPE "StatusTerkirim" AS ENUM ('PENDING', 'TERKIRIM', 'GAGAL');

-- CreateTable
CREATE TABLE "desa" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "desa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "desaId" TEXT,
    "faceDescriptor" JSONB,
    "fotoReferensiUrl" TEXT,
    "faceConsentAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pelanggan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "desaId" TEXT NOT NULL,
    "statusAktif" "StatusAktif" NOT NULL DEFAULT 'AKTIF',
    "iuran" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pelanggan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "absensi" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3),
    "selfieUrl" TEXT,
    "verifikasiStatus" "VerifikasiStatus" NOT NULL DEFAULT 'PENDING',
    "overrideByAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "absensi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pembayaran" (
    "id" TEXT NOT NULL,
    "pelangganId" TEXT NOT NULL,
    "petugasId" TEXT NOT NULL,
    "nominal" DECIMAL(12,2) NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "status" "StatusPembayaran" NOT NULL DEFAULT 'BELUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pembayaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengeluaran" (
    "id" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "nominal" DECIMAL(12,2) NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pengeluaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operasional_sampah" (
    "id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "petugasId" TEXT NOT NULL,
    "jumlahRumahDilayani" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "operasional_sampah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifikasi_log" (
    "id" TEXT NOT NULL,
    "pelangganId" TEXT NOT NULL,
    "jenis" "JenisNotifikasi" NOT NULL,
    "pesan" TEXT NOT NULL,
    "statusTerkirim" "StatusTerkirim" NOT NULL DEFAULT 'PENDING',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifikasi_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "desa_nama_key" ON "desa"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "pelanggan_desaId_idx" ON "pelanggan"("desaId");

-- CreateIndex
CREATE INDEX "absensi_userId_idx" ON "absensi"("userId");

-- CreateIndex
CREATE INDEX "pembayaran_pelangganId_idx" ON "pembayaran"("pelangganId");

-- CreateIndex
CREATE INDEX "pembayaran_petugasId_idx" ON "pembayaran"("petugasId");

-- CreateIndex
CREATE INDEX "operasional_sampah_petugasId_idx" ON "operasional_sampah"("petugasId");

-- CreateIndex
CREATE INDEX "notifikasi_log_pelangganId_idx" ON "notifikasi_log"("pelangganId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_desaId_fkey" FOREIGN KEY ("desaId") REFERENCES "desa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pelanggan" ADD CONSTRAINT "pelanggan_desaId_fkey" FOREIGN KEY ("desaId") REFERENCES "desa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absensi" ADD CONSTRAINT "absensi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayaran" ADD CONSTRAINT "pembayaran_pelangganId_fkey" FOREIGN KEY ("pelangganId") REFERENCES "pelanggan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayaran" ADD CONSTRAINT "pembayaran_petugasId_fkey" FOREIGN KEY ("petugasId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operasional_sampah" ADD CONSTRAINT "operasional_sampah_petugasId_fkey" FOREIGN KEY ("petugasId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifikasi_log" ADD CONSTRAINT "notifikasi_log_pelangganId_fkey" FOREIGN KEY ("pelangganId") REFERENCES "pelanggan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
