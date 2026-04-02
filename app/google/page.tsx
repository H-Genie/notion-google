"use client"

import { useEffect, useState } from "react"
import { GoogleTable } from "@/app/components/GoogleTable"

export type CalendarEvent = {
  id: string
  title: string
  start: string | null
  end: string | null
  isAllDay: boolean
  htmlLink: string | null
  description: string | null
}

export default function GoogleCalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/google/events")
        const data = await res.json()
        if (!res.ok) {
          setError(data.error ?? "이벤트 조회에 실패했습니다.")
          setEvents([])
          return
        }
        setEvents(data.events ?? [])
      } catch {
        setError("요청 중 오류가 발생했습니다.")
        setEvents([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleDeleteEvent(eventId: string) {
    const ok = window.confirm("이 이벤트를 삭제할까요?")
    if (!ok) return

    setDeletingId(eventId)
    setError(null)
    try {
      const res = await fetch("/api/google/delete-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "이벤트 삭제에 실패했습니다.")
        return
      }
      setEvents(prev => prev.filter(event => event.id !== eventId))
    } catch {
      setError("요청 중 오류가 발생했습니다.")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <GoogleTable
      events={events}
      loading={loading}
      error={error}
      deletingId={deletingId}
      onDeleteEvent={handleDeleteEvent}
    />
  )
}
