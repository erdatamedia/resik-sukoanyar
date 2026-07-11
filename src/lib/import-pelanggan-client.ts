"use client"

import * as XLSX from "xlsx"
import { IMPORT_HEADERS, type ImportRawRow } from "./import-pelanggan"

export function downloadImportTemplate(desaNames: string[]) {
  const contoh: ImportRawRow = {
    Nama: "Budi Santoso",
    Alamat: "Jl. Mawar No. 12, RT 03/RW 01",
    "No HP": "081234567890",
    Desa: desaNames[0] ?? "",
    Iuran: 20000,
    "Status Aktif": "AKTIF",
  }

  const sheet = XLSX.utils.json_to_sheet([contoh], { header: [...IMPORT_HEADERS] })
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, "Pelanggan")

  if (desaNames.length > 0) {
    const desaSheet = XLSX.utils.aoa_to_sheet([["Desa yang tersedia"], ...desaNames.map((d) => [d])])
    XLSX.utils.book_append_sheet(workbook, desaSheet, "Daftar Desa")
  }

  XLSX.writeFile(workbook, "template-impor-pelanggan.xlsx")
}

export async function parseImportFile(file: File): Promise<ImportRawRow[]> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: "array" })
  const firstSheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[firstSheetName]
  return XLSX.utils.sheet_to_json<ImportRawRow>(sheet, { defval: "" })
}
