import { NextRequest, NextResponse } from "next/server"

// Endpoint diagnostik sementara untuk melacak kenapa redirect Auth.js
// (mis. setelah logout) mengarah ke localhost:3006 alih-alih domain asli.
// Hapus setelah masalah host/origin ini selesai didiagnosis.
export async function GET(request: NextRequest) {
  return NextResponse.json({
    host: request.headers.get("host"),
    xForwardedHost: request.headers.get("x-forwarded-host"),
    xForwardedProto: request.headers.get("x-forwarded-proto"),
    nextUrlOrigin: request.nextUrl.origin,
    url: request.url,
    authUrlEnv: process.env.AUTH_URL ?? null,
    nextauthUrlEnv: process.env.NEXTAUTH_URL ?? null,
  })
}
