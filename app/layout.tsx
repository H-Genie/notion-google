import type { Metadata } from "next"
import { Nav } from "@/app/components/Nav"

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
          <Nav />
        </header>
        {children}
      </body>
    </html>
  )
}
