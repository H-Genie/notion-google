import { NextResponse } from "next/server"
import { encryptAES } from "@/lib/crypto"

export const dynamic = "force-dynamic"

const URL = "https://h-genie.com/api/auth/login"

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: "사용자명과 비밀번호를 입력해주세요." },
        { status: 400 }
      )
    }

    const upstream = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password: encryptAES(password)
      })
    })

    const data = await upstream.json()
    const res = NextResponse.json(data, { status: upstream.status })

    for (const c of upstream.headers.getSetCookie?.() ?? []) {
      res.headers.append("Set-Cookie", c)
    }

    return res
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
