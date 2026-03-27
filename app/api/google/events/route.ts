import { NextRequest, NextResponse } from "next/server";
import {
  listCalendarEvents,
  isGoogleCalendarConfigured,
} from "@/lib/google-calendar";

/**
 * GET /api/google/events?timeMin=ISO&timeMax=ISO&maxResults=50
 */
export async function GET(request: NextRequest) {
  if (!isGoogleCalendarConfigured()) {
    return NextResponse.json(
      {
        error:
          "구글 캘린더가 설정되지 않았습니다. .env.local에 GOOGLE_SERVICE_ACCOUNT_JSON, GOOGLE_CALENDAR_ID를 추가하세요.",
      },
      { status: 503 }
    );
  }

  const { searchParams } = request.nextUrl;
  const timeMin = searchParams.get("timeMin") ?? undefined;
  const timeMax = searchParams.get("timeMax") ?? undefined;
  const maxResults = searchParams.get("maxResults")
    ? Number(searchParams.get("maxResults"))
    : undefined;

  try {
    const events = await listCalendarEvents({ timeMin, timeMax, maxResults });
    return NextResponse.json({ events });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "캘린더 이벤트 조회 중 오류가 발생했습니다: " + message },
      { status: 500 }
    );
  }
}
