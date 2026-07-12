const QR_PREFIX = "resik:pelanggan:"

export function encodePelangganQr(pelangganId: string) {
  return `${QR_PREFIX}${pelangganId}`
}

export function decodePelangganQr(raw: string): string | null {
  if (!raw.startsWith(QR_PREFIX)) return null
  const id = raw.slice(QR_PREFIX.length)
  return id.length > 0 ? id : null
}
