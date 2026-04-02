"use client"

import dayjs from "dayjs"
import type { CalendarEvent } from "@/app/google/page"

type GoogleTableProps = {
  events: CalendarEvent[]
  loading: boolean
  error: string | null
  deletingId: string | null
  onDeleteEvent: (eventId: string) => void
}

function formatEventDate(value: string | null, isAllDay: boolean): string {
  if (!value) return "—"
  const d = dayjs(value)
  return isAllDay ? d.format("YYYY-MM-DD") : d.format("YYYY-MM-DD HH:mm")
}

export function GoogleTable({
  events,
  loading,
  error,
  deletingId,
  onDeleteEvent
}: GoogleTableProps) {
  return (
    <main
      style={{
        maxWidth: 960,
        margin: "2rem auto",
        padding: "0 1rem",
        fontSize: "0.9rem"
      }}
    >
      <h1 style={{ fontSize: "1.4rem", marginBottom: "1rem" }}>구글 캘린더</h1>
      <p style={{ color: "#666", marginBottom: "0.75rem" }}>
        현재 등록된 캘린더 이벤트를 최대 50건까지 보여줍니다.
      </p>

      {error && (
        <div style={{ color: "crimson", marginBottom: "0.75rem" }}>{error}</div>
      )}

      {loading ? (
        <div>불러오는 중…</div>
      ) : events.length === 0 ? (
        <div style={{ color: "#888" }}>등록된 이벤트가 없습니다.</div>
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
                  시작
                </th>
                <th
                  style={{
                    padding: "0.6rem 0.75rem",
                    textAlign: "left",
                    borderBottom: "1px solid #e0e0e0",
                    whiteSpace: "nowrap"
                  }}
                >
                  종료
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
                    textAlign: "center",
                    borderBottom: "1px solid #e0e0e0",
                    whiteSpace: "nowrap"
                  }}
                >
                  링크
                </th>
                <th
                  style={{
                    padding: "0.6rem 0.75rem",
                    textAlign: "center",
                    borderBottom: "1px solid #e0e0e0",
                    whiteSpace: "nowrap"
                  }}
                >
                  삭제
                </th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td
                    style={{
                      padding: "0.55rem 0.75rem",
                      verticalAlign: "top",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {formatEventDate(event.start, event.isAllDay)}
                  </td>
                  <td
                    style={{
                      padding: "0.55rem 0.75rem",
                      verticalAlign: "top",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {formatEventDate(event.end, event.isAllDay)}
                  </td>
                  <td
                    style={{
                      padding: "0.55rem 0.75rem",
                      verticalAlign: "top"
                    }}
                  >
                    {event.title}
                  </td>
                  <td
                    style={{
                      padding: "0.55rem 0.75rem",
                      verticalAlign: "top",
                      textAlign: "center",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {event.htmlLink ? (
                      <a
                        href={event.htmlLink}
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
                  <td
                    style={{
                      padding: "0.55rem 0.75rem",
                      verticalAlign: "top",
                      textAlign: "center",
                      whiteSpace: "nowrap"
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => onDeleteEvent(event.id)}
                      disabled={deletingId !== null}
                      style={{
                        padding: "0.35rem 0.6rem",
                        fontSize: "0.8rem",
                        cursor: deletingId !== null ? "not-allowed" : "pointer",
                        border: "1px solid #ddd",
                        borderRadius: 4,
                        background: "#fff",
                        color: "#c23b3b",
                        opacity: deletingId === event.id ? 0.7 : 1
                      }}
                    >
                      {deletingId === event.id ? "삭제 중…" : "삭제"}
                    </button>
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
