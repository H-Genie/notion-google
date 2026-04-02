"use client"

import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const username = String(fd.get("username") ?? "")
    const password = String(fd.get("password") ?? "")
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    })
    if (res.ok) {
      router.push("/")
      router.refresh()
    }
  }

  return (
    <main
      style={{
        maxWidth: 360,
        margin: "2rem auto",
        padding: "0 1rem",
        fontFamily: "system-ui, sans-serif"
      }}
    >
      <h1 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
        로그인
      </h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.75rem" }}>
        <label style={{ display: "grid", gap: "0.25rem", fontSize: "0.875rem" }}>
          사용자명
          <input
            name="username"
            type="text"
            autoComplete="username"
            required
            style={{
              padding: "0.5rem 0.65rem",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              fontSize: "1rem"
            }}
          />
        </label>
        <label style={{ display: "grid", gap: "0.25rem", fontSize: "0.875rem" }}>
          비밀번호
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            style={{
              padding: "0.5rem 0.65rem",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              fontSize: "1rem"
            }}
          />
        </label>
        <button
          type="submit"
          style={{
            marginTop: "0.25rem",
            padding: "0.55rem 1rem",
            background: "#1f2937",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontSize: "0.95rem",
            cursor: "pointer"
          }}
        >
          로그인
        </button>
      </form>
    </main>
  )
}
