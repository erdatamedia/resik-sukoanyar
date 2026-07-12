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
let latestQr: string | null = null

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: "./.wwebjs_auth" }),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
})

client.on("qr", (qr) => {
  latestQr = qr
  console.log("\nScan QR code berikut dengan WhatsApp di HP (nomor khusus, bukan pribadi):\n")
  qrcode.generate(qr, { small: true })
})

client.on("ready", () => {
  ready = true
  latestQr = null
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

// whatsapp-web.js/Puppeteer kadang melempar exception saat re-inject script
// ke halaman yang belum bersih ditutup (mis. setelah LOGOUT). Tanpa handler
// ini, Node akan exit dan PM2 langsung restart proses sebelum Chromium lama
// selesai dilepas, sehingga QR baru gagal muncul berulang-ulang.
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception pada WhatsApp client (diabaikan agar tidak crash-loop):", err)
})

// Event "disconnected" tidak selalu terpicu saat sesi di-unlink dari HP
// secara remote — flag `ready` bisa nyangkut true padahal sesi sudah mati.
// Cek ulang status asli tiap 30 detik sebagai jaring pengaman, bukan cuma
// mengandalkan event pasif dari whatsapp-web.js.
setInterval(async () => {
  try {
    const state = await client.getState()
    const isReady = state === "CONNECTED"
    if (ready !== isReady) {
      console.log(`Status WhatsApp berubah lewat pengecekan berkala: ${state} (ready=${isReady})`)
      ready = isReady
      if (isReady) latestQr = null
    }
  } catch {
    // client belum siap dievaluasi (mis. masih boot/re-auth) — abaikan,
    // event listener yang menangani transisi state pada kondisi ini
  }
}, 30000)

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

app.get("/status", (_req, res) => {
  res.json({ ready, qr: latestQr })
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
    // whatsapp-web.js melempar error internal yang membingungkan (mis.
    // "Cannot read properties of undefined (reading 'getChat')") kalau
    // langsung sendMessage ke nomor yang tidak terdaftar di WhatsApp —
    // cek dulu di sini supaya errornya jelas & tidak dianggap sesi rusak.
    const numberId = await client.getNumberId(to)
    if (!numberId) {
      res.status(400).json({ success: false, error: "Nomor tidak terdaftar di WhatsApp" })
      return
    }

    await client.sendMessage(numberId._serialized, message)
    res.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    res.status(500).json({ success: false, error: message })

    // Sesi kadang "terlihat" tersambung (getState() masih CONNECTED) tapi
    // objek page Puppeteer-nya sudah rusak — biasanya baru ketahuan saat
    // benar-benar coba kirim pesan. Tidak bisa dipulihkan tanpa restart
    // proses, dan restart proses sendiri (bukan crash-loop, hanya sekali)
    // aman karena sesi disimpan di .wwebjs_auth dan otomatis dipakai lagi,
    // tanpa perlu scan QR ulang.
    if (isUnrecoverableClientError(message)) {
      console.error(
        `Sesi WhatsApp rusak (${message}), restart proses agar PM2 hidupkan ulang otomatis...`
      )
      ready = false
      process.exit(1)
    }
  }
})

function isUnrecoverableClientError(message: string) {
  return (
    message.includes("detached Frame") ||
    message.includes("Execution context was destroyed") ||
    message.includes("Target closed") ||
    message.includes("Session closed")
  )
}

app.listen(PORT, () => {
  console.log(`RESIK WhatsApp service berjalan di port ${PORT}`)
})
