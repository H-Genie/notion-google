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
  const rawDate = date.trim();

  // date가 날짜만(YYYY-MM-DD)이면 종일 이벤트, 시간 포함이면 dateTime 사용
  const isAllDay = /^\d{4}-\d{2}-\d{2}$/.test(rawDate);

  if (isAllDay) {
    const [y, m, d] = rawDate.split("-").map(Number);
    const next = new Date(Date.UTC(y, m - 1, d + 1));
    const endDate = `${next.getUTCFullYear()}-${String(
      next.getUTCMonth() + 1
    ).padStart(2, "0")}-${String(next.getUTCDate()).padStart(2, "0")}`;

    const eventBody: import("@googleapis/calendar/build/v3").calendar_v3.Schema$Event =
      {
        summary: title,
        description: description ?? undefined,
        location: location ?? undefined,
        start: {
          date: rawDate,
        },
        end: {
          date: endDate,
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

  const startDate = new Date(rawDate);
  if (Number.isNaN(startDate.getTime())) {
    throw new Error("date 형식이 올바르지 않습니다.");
  }
  const endDate = new Date(startDate);

  // durationMinutes가 지정된 경우 해당 분만큼, 아니면 기본 1시간(60분)
  const minutes = durationMinutes && durationMinutes > 0 ? durationMinutes : 60;
  endDate.setTime(endDate.getTime() + minutes * 60 * 1000);

  // 입력에 오프셋/Z가 있으면 dateTime만 전송, 없으면 timeZone과 함께 로컬 datetime 전송
  const hasOffset = /(?:[zZ]|[+-]\d{2}:\d{2})$/.test(rawDate);
  const toLocalDateTime = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;

  const eventBody: import("@googleapis/calendar/build/v3").calendar_v3.Schema$Event =
    hasOffset
      ? {
          summary: title,
          description: description ?? undefined,
          location: location ?? undefined,
          start: {
            dateTime: startDate.toISOString(),
          },
          end: {
            dateTime: endDate.toISOString(),
          },
          reminders: { useDefault: false, overrides: [] },
        }
      : {
          summary: title,
          description: description ?? undefined,
          location: location ?? undefined,
          start: {
            dateTime: toLocalDateTime(startDate),
            timeZone,
          },
          end: {
            dateTime: toLocalDateTime(endDate),
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

    // Google all-day events use end.date as "exclusive".
    // For example, a one-day event on 2026-04-02 comes as:
    //   start.date = 2026-04-02, end.date = 2026-04-03
    // We convert it to inclusive for our UI: end.date -> 2026-04-02
    const convertEndForAllDay = () => {
      if (!isAllDay) return endRaw;
      if (!startRaw || !endRaw) return endRaw;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(startRaw)) return endRaw;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(endRaw)) return endRaw;

      // endRaw is exclusive for all-day events.
      const [ey, em, ed] = endRaw.split("-").map(Number);
      const dt = new Date(Date.UTC(ey, em - 1, ed));
      dt.setUTCDate(dt.getUTCDate() - 1);
      return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
    };

    const adjustedEnd = convertEndForAllDay();

    return {
      id: item.id ?? "",
      title: item.summary ?? "(제목 없음)",
      start: startRaw,
      end: adjustedEnd,
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
