export const IMPORT_HEADERS = ["Nama", "Alamat", "No HP", "Desa", "Iuran", "Status Aktif"] as const

export type ImportRawRow = {
  Nama?: unknown
  Alamat?: unknown
  "No HP"?: unknown
  Desa?: unknown
  Iuran?: unknown
  "Status Aktif"?: unknown
}

export type ParsedImportRow = {
  rowNumber: number
  nama: string
  alamat: string
  noHp: string
  desaNama: string
  iuran: number
  statusAktif: "AKTIF" | "NONAKTIF"
  errors: string[]
}

const PHONE_REGEX = /^(\+?62|0)8[0-9]{8,12}$/

export function parseImportRow(
  raw: ImportRawRow,
  rowNumber: number,
  desaNamaSet: Set<string>
): ParsedImportRow {
  const errors: string[] = []

  const nama = String(raw["Nama"] ?? "").trim()
  if (!nama) errors.push("Nama kosong")

  const alamat = String(raw["Alamat"] ?? "").trim()
  if (!alamat) errors.push("Alamat kosong")

  let noHp = String(raw["No HP"] ?? "").trim().replace(/[^0-9+]/g, "")
  // Excel/CSV sering membaca kolom No HP sebagai angka dan membuang angka 0
  // di depan (mis. "081234500001" jadi 81234500001) — pulihkan otomatis.
  if (/^8[0-9]{8,12}$/.test(noHp)) {
    noHp = `0${noHp}`
  }
  if (!noHp) {
    errors.push("No HP kosong")
  } else if (!PHONE_REGEX.test(noHp)) {
    errors.push("Format No HP tidak valid")
  }

  const desaNama = String(raw["Desa"] ?? "").trim()
  if (!desaNama) {
    errors.push("Desa kosong")
  } else if (!desaNamaSet.has(desaNama)) {
    errors.push(`Desa "${desaNama}" tidak ditemukan`)
  }

  const iuranRaw = raw["Iuran"]
  const iuran = Number(iuranRaw)
  if (iuranRaw === undefined || iuranRaw === null || iuranRaw === "" || Number.isNaN(iuran)) {
    errors.push("Iuran harus berupa angka")
  } else if (iuran < 0) {
    errors.push("Iuran tidak boleh negatif")
  }

  const statusRaw = String(raw["Status Aktif"] ?? "AKTIF")
    .trim()
    .toUpperCase()
  const statusAktif: "AKTIF" | "NONAKTIF" = statusRaw === "NONAKTIF" ? "NONAKTIF" : "AKTIF"

  return {
    rowNumber,
    nama,
    alamat,
    noHp,
    desaNama,
    iuran: Number.isNaN(iuran) ? 0 : iuran,
    statusAktif,
    errors,
  }
}
