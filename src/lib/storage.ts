import { randomUUID } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads")

export async function saveUploadedImage(file: File, subdir: string): Promise<string> {
  const ext = file.type === "image/png" ? "png" : "jpg"
  const filename = `${randomUUID()}.${ext}`
  const dir = path.join(UPLOAD_ROOT, subdir)

  await mkdir(dir, { recursive: true })

  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(path.join(dir, filename), buffer)

  return `/uploads/${subdir}/${filename}`
}
