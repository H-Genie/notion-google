import { NextRequest, NextResponse } from "next/server";
import {
  deleteCalendarEvent,
  isGoogleCalendarConfigured,
} from "@/lib/google-calendar";

/**
 * POST /api/google/delete-event
 * Body: { eventId: string }
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

  let body: { eventId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "요청 본문이 올바른 JSON이 아닙니다." },
      { status: 400 }
    );
  }

  const eventId = body.eventId;
  if (!eventId || typeof eventId !== "string" || eventId.trim() === "") {
    return NextResponse.json(
      { error: "eventId가 필요합니다." },
      { status: 400 }
    );
  }

  try {
    await deleteCalendarEvent(eventId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "캘린더 이벤트 삭제 중 오류가 발생했습니다: " + message },
      { status: 500 }
    );
  }
}
