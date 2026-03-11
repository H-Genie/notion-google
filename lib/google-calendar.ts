import { calendar } from "@googleapis/calendar";
import { JWT } from "google-auth-library";

const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events";

function getAuthClient(): JWT | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw || raw.trim() === "") return null;

  try {
    const key = JSON.parse(raw) as {
      client_email?: string;
      private_key?: string;
    };
    if (!key.client_email || !key.private_key) return null;

    return new JWT({
      email: key.client_email,
      key: key.private_key.replace(/\\n/g, "\n"),
      scopes: [CALENDAR_SCOPE],
    });
  } catch {
    return null;
  }
}

export function isGoogleCalendarConfigured(): boolean {
  return getAuthClient() !== null && Boolean(process.env.GOOGLE_CALENDAR_ID);
}

/**
 * 캘린더에 이벤트 추가
 * @param title 제목
 * @param date ISO 날짜 또는 날짜시간 (예: 2026-03-15 또는 2026-03-15T14:00:00)
 * @param description 설명(선택, 예: Notion 링크)
 */
export async function addEventToCalendar(
  title: string,
  date: string,
  description?: string
): Promise<{ id: string; htmlLink: string | null }> {
  const auth = getAuthClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID ?? "primary";

  if (!auth) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON이 설정되지 않았습니다. .env.local에 추가하세요."
    );
  }

  const cal = calendar({ version: "v3", auth });
  const timeZone = process.env.TZ ?? "Asia/Seoul";

  // date가 날짜만(YYYY-MM-DD)이면 종일 이벤트, 시간 포함이면 dateTime 사용
  const isAllDay = /^\d{4}-\d{2}-\d{2}$/.test(date.trim());
  const startDate = new Date(date);
  const endDate = new Date(startDate);

  if (isAllDay) {
    endDate.setDate(endDate.getDate() + 1);
  } else {
    // 시간이 있으면 1시간 기본 길이
    endDate.setHours(endDate.getHours() + 1);
  }

  const eventBody: import("@googleapis/calendar/build/v3").calendar_v3.Schema$Event =
    isAllDay
      ? {
          summary: title,
          description: description ?? undefined,
          start: {
            date: startDate.toISOString().slice(0, 10),
            timeZone,
          },
          end: {
            date: endDate.toISOString().slice(0, 10),
            timeZone,
          },
        }
      : {
          summary: title,
          description: description ?? undefined,
          start: {
            dateTime: startDate.toISOString(),
            timeZone,
          },
          end: {
            dateTime: endDate.toISOString(),
            timeZone,
          },
        };

  const res = await cal.events.insert({
    calendarId,
    requestBody: eventBody,
  });

  const data = res.data;
  if (!data.id) {
    throw new Error("캘린더 이벤트 생성 후 ID를 받지 못했습니다.");
  }

  return {
    id: data.id,
    htmlLink: data.htmlLink ?? null,
  };
}
