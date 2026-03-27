"use client"

import { useEffect, useState } from "react"
import { NotionTable } from "./NotionTable"

const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID

export type SimpleRow = {
  id: string
  title: string
  date: string | null
  lastEdited: string | null
  url: string | null
  location: string | null
}

export default function TestPage() {
  const [rows, setRows] = useState<SimpleRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `/api/notion?databaseId=${DATABASE_ID}&after=today`
        )
        const data = await res.json()
        console.log("Notion DB raw data:", data)

        if (!res.ok) {
          setError(data.error ?? "조회에 실패했습니다.")
          setRows([])
          return
        }

        const db: any = data.database ?? {}
        const props: any = db.properties ?? {}
        const entries = Object.entries(props) as [string, any][]

        const titleProp =
          entries.find(([, p]) => p?.type === "title")?.[0] ?? null
        const dateProp =
          entries.find(([, p]) => p?.type === "date")?.[0] ?? null
        const simpleRows: SimpleRow[] = (data.rows ?? []).map((row: any) => {
          const properties = row.properties ?? {}
          const titleVal = titleProp ? (properties as any)[titleProp] : null
          const dateVal = dateProp ? (properties as any)[dateProp] : null

          const title =
            titleVal &&
            Array.isArray(titleVal.title) &&
            titleVal.title.length > 0
              ? (titleVal.title[0]?.plain_text ?? "제목 없음")
              : "제목 없음"

          const date: string | null =
            dateVal && dateVal.date ? (dateVal.date.start ?? null) : null

          const lastEdited: string | null =
            (row as any).last_edited_time ?? null

          const url: string | null = (row as any).url ?? null

          const location: string | null =
            (properties as any)[
              "장소"
            ]?.rich_text?.[0]?.text?.content?.trim() || null

          return {
            id: row.id,
            title,
            date,
            lastEdited,
            url,
            location
          }
        })

        setRows(simpleRows)
      } catch (err) {
        console.error("Notion DB fetch error:", err)
        setError("요청 중 오류가 발생했습니다.")
        setRows([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return <NotionTable rows={rows} loading={loading} error={error} />
}
