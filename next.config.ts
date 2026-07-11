import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  experimental: {
    // Default 1MB terlalu kecil untuk foto selfie asli dari kamera HP
    // (absensi check-in & registrasi wajah mengirim file lewat FormData
    // ke server action) — tanpa ini request ditolak dan client cuma
    // dapat "An unexpected response was received from the server."
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
