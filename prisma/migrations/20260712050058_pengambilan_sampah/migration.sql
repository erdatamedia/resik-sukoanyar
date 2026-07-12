/*
  Warnings:

  - You are about to drop the `operasional_sampah` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "operasional_sampah" DROP CONSTRAINT "operasional_sampah_petugasId_fkey";

-- DropTable
DROP TABLE "operasional_sampah";

-- CreateTable
CREATE TABLE "pengambilan_sampah" (
    "id" TEXT NOT NULL,
    "pelangganId" TEXT NOT NULL,
    "petugasId" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pengambilan_sampah_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pengambilan_sampah_pelangganId_idx" ON "pengambilan_sampah"("pelangganId");

-- CreateIndex
CREATE INDEX "pengambilan_sampah_petugasId_idx" ON "pengambilan_sampah"("petugasId");

-- AddForeignKey
ALTER TABLE "pengambilan_sampah" ADD CONSTRAINT "pengambilan_sampah_pelangganId_fkey" FOREIGN KEY ("pelangganId") REFERENCES "pelanggan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengambilan_sampah" ADD CONSTRAINT "pengambilan_sampah_petugasId_fkey" FOREIGN KEY ("petugasId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
