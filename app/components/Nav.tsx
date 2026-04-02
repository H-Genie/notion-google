"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function Nav() {
  const router = useRouter()
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch("/api/auth/check")
        const data = await res.json()
        setLoggedIn(!!data.authenticated)
      } catch {
        setLoggedIn(false)
      }
    })()
  }, [])

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } finally {
      setLoggedIn(false)
      router.push("/login")
    }
  }

  return (
    <nav
      style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: "0.85rem 1rem",
        display: "flex",
        gap: "0.75rem",
        alignItems: "center"
      }}
    >
      <Link href="/" style={{ color: "#1f2937", textDecoration: "none" }}>
        노션
      </Link>
      <span style={{ color: "#bbb" }}>|</span>
      <Link
        href="/google"
        style={{ color: "#1f2937", textDecoration: "none" }}
      >
        구글
      </Link>
      {loggedIn && (
        <button
          type="button"
          onClick={handleLogout}
          style={{
            marginLeft: "auto",
            padding: "0.35rem 0.75rem",
            fontSize: "0.875rem",
            color: "#374151",
            background: "#fff",
            border: "1px solid #d1d5db",
            borderRadius: 6,
            cursor: "pointer"
          }}
        >
          로그아웃
        </button>
      )}
    </nav>
  )
}
