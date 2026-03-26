import { calendar } from "@googleapis/calendar";
import { JWT } from "google-auth-library";

const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar";

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
  description?: string,
  durationMinutes?: number,
  location?: string
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
    // durationMinutes가 지정된 경우 해당 분만큼, 아니면 기본 1시간(60분)
    const minutes = durationMinutes && durationMinutes > 0 ? durationMinutes : 60;
    endDate.setTime(endDate.getTime() + minutes * 60 * 1000);
  }

  const eventBody: import("@googleapis/calendar/build/v3").calendar_v3.Schema$Event =
    isAllDay
      ? {
          summary: title,
          description: description ?? undefined,
          location: location ?? undefined,
          start: {
            date: startDate.toISOString().slice(0, 10),
            timeZone,
          },
          end: {
            date: endDate.toISOString().slice(0, 10),
            timeZone,
          },
          reminders: { useDefault: false, overrides: [] },
        }
      : {
          summary: title,
          description: description ?? undefined,
          location: location ?? undefined,
          start: {
            dateTime: startDate.toISOString(),
            timeZone,
          },
          end: {
            dateTime: endDate.toISOString(),
            timeZone,
          },
          reminders: { useDefault: false, overrides: [] },
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

export type CalendarEvent = {
  id: string;
  title: string;
  start: string | null;
  end: string | null;
  isAllDay: boolean;
  htmlLink: string | null;
  description: string | null;
  location: string | null;
};

/**
 * 캘린더에서 이벤트 목록 조회
 * @param options timeMin/timeMax: ISO 날짜시간 문자열, maxResults: 최대 조회 건수
 */
export async function listCalendarEvents(options?: {
  timeMin?: string;
  timeMax?: string;
  maxResults?: number;
}): Promise<CalendarEvent[]> {
  const auth = getAuthClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID ?? "primary";

  if (!auth) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON이 설정되지 않았습니다. .env.local에 추가하세요."
    );
  }

  const cal = calendar({ version: "v3", auth });

  const res = await cal.events.list({
    calendarId,
    timeMin: options?.timeMin ?? new Date().toISOString(),
    maxResults: options?.maxResults ?? 50,
    singleEvents: true,
    orderBy: "startTime",
    ...(options?.timeMax ? { timeMax: options.timeMax } : {}),
  });

  const items = res.data.items ?? [];

  return items.map((item) => {
    const startRaw = item.start?.dateTime ?? item.start?.date ?? null;
    const endRaw = item.end?.dateTime ?? item.end?.date ?? null;
    const isAllDay = Boolean(item.start?.date && !item.start?.dateTime);

    return {
      id: item.id ?? "",
      title: item.summary ?? "(제목 없음)",
      start: startRaw,
      end: endRaw,
      isAllDay,
      htmlLink: item.htmlLink ?? null,
      description: item.description ?? null,
      location: item.location ?? null,
    };
  });
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const auth = getAuthClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID ?? "primary";

  if (!auth) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON이 설정되지 않았습니다. .env.local에 추가하세요."
    );
  }
  if (!eventId || eventId.trim() === "") {
    throw new Error("삭제할 eventId가 필요합니다.");
  }

  const cal = calendar({ version: "v3", auth });
  await cal.events.delete({
    calendarId,
    eventId: eventId.trim(),
  });
}
