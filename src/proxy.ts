import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { ROLE_HOME } from "@/lib/roles"

const ROLE_PREFIXES: Record<string, string> = {
  "/admin": "ADMIN",
  "/petugas-penarik": "PETUGAS_PENARIK",
  "/petugas-sampah": "PETUGAS_SAMPAH",
}

export default auth((req) => {
  const { pathname } = req.nextUrl
  const user = req.auth?.user

  if (pathname === "/login") {
    if (user) {
      return NextResponse.redirect(new URL(ROLE_HOME[user.role] ?? "/login", req.url))
    }
    return NextResponse.next()
  }

  if (!user) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  const matchedPrefix = Object.keys(ROLE_PREFIXES).find((prefix) =>
    pathname.startsWith(prefix)
  )

  if (matchedPrefix && ROLE_PREFIXES[matchedPrefix] !== user.role) {
    return NextResponse.redirect(new URL(ROLE_HOME[user.role] ?? "/login", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*", "/petugas-penarik/:path*", "/petugas-sampah/:path*", "/login"],
}
