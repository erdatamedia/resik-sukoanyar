import { getRumahDilayaniHariIni } from "@/lib/queries/pengambilan-sampah"
import { RumahClient } from "./rumah-client"

export default async function RumahPage() {
  const rows = await getRumahDilayaniHariIni()

  return <RumahClient rows={rows} />
}
