import "dotenv/config"
import express from "express"
import qrcode from "qrcode-terminal"
import pkg from "whatsapp-web.js"

const { Client, LocalAuth } = pkg

const PORT = process.env.PORT ?? 4001
const SERVICE_TOKEN = process.env.SERVICE_TOKEN

if (!SERVICE_TOKEN) {
  console.error("SERVICE_TOKEN wajib diisi di .env — hentikan proses.")
  process.exit(1)
}

let ready = false

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: "./.wwebjs_auth" }),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
})

client.on("qr", (qr) => {
  console.log("\nScan QR code berikut dengan WhatsApp di HP (nomor khusus, bukan pribadi):\n")
  qrcode.generate(qr, { small: true })
})

client.on("ready", () => {
  ready = true
  console.log("WhatsApp client siap menerima permintaan kirim pesan.")
})

client.on("disconnected", (reason) => {
  ready = false
  console.error("WhatsApp client terputus:", reason)
})

client.on("auth_failure", (message) => {
  ready = false
  console.error("Autentikasi WhatsApp gagal:", message)
})

client.initialize()

const app = express()
app.use(express.json())

app.use((req, res, next) => {
  const auth = req.headers.authorization
  if (auth !== `Bearer ${SERVICE_TOKEN}`) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }
  next()
})

app.get("/health", (_req, res) => {
  res.json({ ready })
})

app.post("/send", async (req, res) => {
  if (!ready) {
    res.status(503).json({ success: false, error: "WhatsApp client belum siap" })
    return
  }

  const { to, message } = req.body ?? {}
  if (typeof to !== "string" || typeof message !== "string" || !to || !message) {
    res.status(400).json({ success: false, error: "Field 'to' dan 'message' wajib diisi" })
    return
  }

  try {
    const chatId = `${to}@c.us`
    await client.sendMessage(chatId, message)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : String(err) })
  }
})

app.listen(PORT, () => {
  console.log(`RESIK WhatsApp service berjalan di port ${PORT}`)
})
