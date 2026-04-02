import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

const CHECK_URL = "https://h-genie.com/api/auth/check"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    const cookieHeader = allCookies.map((c) => `${c.name}=${c.value}`).join("; ")

    const upstream = await fetch(CHECK_URL, {
      method: "GET",
      headers: { Cookie: cookieHeader }
    })

    const data = await upstream.json()

    if (!data.authenticated) {
      cookieStore.delete("admin_auth")
      cookieStore.delete("admin_username")
    }

    return NextResponse.json(data, { status: upstream.status })
  } catch (error) {
    console.error("Auth check error:", error)
    const cookieStore = await cookies()
    cookieStore.delete("admin_auth")
    cookieStore.delete("admin_username")
    return NextResponse.json({ authenticated: false })
  }
}
