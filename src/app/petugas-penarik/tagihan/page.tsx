import { getTagihanBulanIni } from "@/lib/queries/pembayaran"
import { TagihanClient } from "./tagihan-client"

export default async function TagihanPage() {
  const rows = await getTagihanBulanIni()

  return <TagihanClient rows={rows} />
}
