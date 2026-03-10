import dayjs from "dayjs"
import type { SimpleRow } from "./page"

function formatDateWithOptionalTime(
  value: string | null | undefined
): string {
  if (value == null) return "—"
  const d = dayjs(value)
  const hasTime =
    d.hour() !== 0 || d.minute() !== 0 || d.second() !== 0
  return hasTime
    ? d.format("YYYY-MM-DD HH:mm")
    : d.format("YYYY-MM-DD")
}

type TestTableProps = {
  rows: SimpleRow[]
  loading: boolean
  error: string | null
}

export function TestTable({ rows, loading, error }: TestTableProps) {
  return (
    <main
      style={{
        maxWidth: 960,
        margin: "2rem auto",
        padding: "0 1rem",
        fontSize: "0.9rem"
      }}
    >
      <h1 style={{ fontSize: "1.4rem", marginBottom: "1rem" }}>
        Notion DB 테스트
      </h1>
      <p style={{ color: "#666", marginBottom: "0.75rem" }}>
        오늘 날짜 이후 데이터만 간단한 표로 보여줍니다.
      </p>

      {error && (
        <div style={{ color: "crimson", marginBottom: "0.75rem" }}>{error}</div>
      )}

      {loading ? (
        <div>불러오는 중…</div>
      ) : rows.length === 0 ? (
        <div style={{ color: "#888" }}>표시할 행이 없습니다.</div>
      ) : (
        <div
          style={{
            overflowX: "auto",
            border: "1px solid #e0e0e0",
            borderRadius: 8
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: 640
            }}
          >
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th
                  style={{
                    padding: "0.6rem 0.75rem",
                    textAlign: "left",
                    borderBottom: "1px solid #e0e0e0",
                    whiteSpace: "nowrap"
                  }}
                >
                  날짜
                </th>
                <th
                  style={{
                    padding: "0.6rem 0.75rem",
                    textAlign: "left",
                    borderBottom: "1px solid #e0e0e0"
                  }}
                >
                  제목
                </th>
                <th
                  style={{
                    padding: "0.6rem 0.75rem",
                    textAlign: "left",
                    borderBottom: "1px solid #e0e0e0",
                    whiteSpace: "nowrap"
                  }}
                >
                  수정일자
                </th>
                <th
                  style={{
                    padding: "0.6rem 0.75rem",
                    textAlign: "left",
                    borderBottom: "1px solid #e0e0e0",
                    whiteSpace: "nowrap"
                  }}
                >
                  링크
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td
                    style={{
                      padding: "0.55rem 0.75rem",
                      verticalAlign: "top",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {formatDateWithOptionalTime(row.date)}
                  </td>
                  <td
                    style={{
                      padding: "0.55rem 0.75rem",
                      verticalAlign: "top"
                    }}
                  >
                    {row.title}
                  </td>
                  <td
                    style={{
                      padding: "0.55rem 0.75rem",
                      verticalAlign: "top",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {formatDateWithOptionalTime(row.lastEdited)}
                  </td>
                  <td
                    style={{
                      padding: "0.55rem 0.75rem",
                      verticalAlign: "top",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {row.url ? (
                      <a
                        href={row.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#2383e2",
                          textDecoration: "underline"
                        }}
                      >
                        열기
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
