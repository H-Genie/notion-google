import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Notion to Google"
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, background: "#fff" }}>
        <header
          style={{
            borderBottom: "1px solid #e5e5e5",
            position: "sticky",
            top: 0,
            background: "#fff",
            zIndex: 10
          }}
        >
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
          </nav>
        </header>
        {children}
      </body>
    </html>
  )
}
