import { NextRequest, NextResponse } from "next/server"

const PROTECTED = ["/", "/google"]
const CHECK_URL = "https://h-genie.com/api/auth/check"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (!PROTECTED.includes(pathname)) return NextResponse.next()

  const cookieHeader = req.headers.get("cookie") ?? ""
  const loginUrl = new URL("/login", req.url)

  // 쿠키 자체가 없으면 바로 리다이렉트
  if (!cookieHeader.includes("admin_auth")) {
    return NextResponse.redirect(loginUrl)
  }

  try {
    const res = await fetch(CHECK_URL, {
      method: "GET",
      headers: { Cookie: cookieHeader }
    })

    const data = await res.json()

    if (!data.authenticated) {
      return NextResponse.redirect(loginUrl)
    }
  } catch {
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/google"]
}
