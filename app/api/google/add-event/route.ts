import { NextRequest, NextResponse } from "next/server";
import {
  addEventToCalendar,
  isGoogleCalendarConfigured,
} from "@/lib/google-calendar";

/**
 * POST /api/google/add-event
 * Body: { title: string, date: string, description?: string }
 * - date: YYYY-MM-DD 또는 ISO 날짜시간
 */
export async function POST(request: NextRequest) {
  if (!isGoogleCalendarConfigured()) {
    return NextResponse.json(
      {
        error:
          "구글 캘린더가 설정되지 않았습니다. .env.local에 GOOGLE_SERVICE_ACCOUNT_JSON, GOOGLE_CALENDAR_ID를 추가하세요.",
      },
      { status: 503 }
    );
  }

  let body: {
    title?: string;
    date?: string;
    description?: string;
    durationMinutes?: number;
    location?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "요청 본문이 올바른 JSON이 아닙니다." },
      { status: 400 }
    );
  }

  const { title, date, description, durationMinutes, location } = body;
  if (!title || typeof title !== "string" || title.trim() === "") {
    return NextResponse.json(
      { error: "title(제목)이 필요합니다." },
      { status: 400 }
    );
  }
  if (!date || typeof date !== "string" || date.trim() === "") {
    return NextResponse.json(
      { error: "date(날짜)가 필요합니다." },
      { status: 400 }
    );
  }

  try {
    const result = await addEventToCalendar(
      title.trim(),
      date.trim(),
      typeof description === "string" ? description.trim() || undefined : undefined,
      typeof durationMinutes === "number" && durationMinutes > 0 ? durationMinutes : undefined,
      typeof location === "string" ? location.trim() || undefined : undefined
    );
    return NextResponse.json({
      ok: true,
      eventId: result.id,
      htmlLink: result.htmlLink,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "캘린더에 추가하는 중 오류가 발생했습니다: " + message },
      { status: 500 }
    );
  }
}
