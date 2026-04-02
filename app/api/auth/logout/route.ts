import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

const LOGOUT_URL = "https://h-genie.com/api/auth/logout"

export async function POST() {
  try {
    const cookieStore = cookies()
    const cookieHeader = cookieStore
      .getAll()
      .map(c => `${c.name}=${c.value}`)
      .join("; ")

    try {
      await fetch(LOGOUT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader
        }
      })
    } catch {
      // 상위 로그아웃 실패해도 로컬 쿠키는 제거
    }

    cookieStore.delete("admin_auth")
    cookieStore.delete("admin_username")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json(
      { error: "로그아웃 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
