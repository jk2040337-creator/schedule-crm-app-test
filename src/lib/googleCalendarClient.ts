import { google } from "googleapis";
import type { Schedule } from "./types";

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || "primary";

export function getOAuthClient() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET / GOOGLE_OAUTH_REDIRECT_URI 환경 변수가 필요합니다."
    );
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/** 리프레시 토큰이 설정되어 있는지 (즉, 캘린더 연동이 준비되었는지) 여부 */
export function isCalendarConfigured(): boolean {
  return Boolean(process.env.GOOGLE_OAUTH_REFRESH_TOKEN);
}

function getCalendarApi() {
  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
  });
  return google.calendar({ version: "v3", auth: oauth2Client });
}

function buildEventBody(
  schedule: Omit<Schedule, "id" | "createdAt" | "googleEventId">,
  customerName: string
) {
  const start = new Date(schedule.datetime);
  const end = new Date(start.getTime() + 60 * 60 * 1000); // 기본 1시간 일정

  return {
    summary: `${customerName} - ${schedule.serviceType}`,
    location: schedule.address,
    description: schedule.memo || undefined,
    start: { dateTime: start.toISOString(), timeZone: "Asia/Seoul" },
    end: { dateTime: end.toISOString(), timeZone: "Asia/Seoul" },
    reminders: {
      useDefault: false,
      overrides: [{ method: "popup", minutes: 60 }],
    },
  };
}

/** 일정을 구글 캘린더에 새로 등록하고 이벤트 ID를 반환한다. */
export async function createCalendarEvent(
  schedule: Omit<Schedule, "id" | "createdAt" | "googleEventId">,
  customerName: string
): Promise<string | null> {
  if (!isCalendarConfigured()) return null;
  try {
    const calendar = getCalendarApi();
    const res = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: buildEventBody(schedule, customerName),
    });
    return res.data.id ?? null;
  } catch (err) {
    console.error("[calendar] 이벤트 생성 실패", err);
    return null;
  }
}

/** 기존 캘린더 이벤트를 최신 일정 내용으로 갱신한다. */
export async function updateCalendarEvent(
  googleEventId: string,
  schedule: Omit<Schedule, "id" | "createdAt" | "googleEventId">,
  customerName: string
): Promise<boolean> {
  if (!isCalendarConfigured() || !googleEventId) return false;
  try {
    const calendar = getCalendarApi();
    await calendar.events.update({
      calendarId: CALENDAR_ID,
      eventId: googleEventId,
      requestBody: buildEventBody(schedule, customerName),
    });
    return true;
  } catch (err) {
    console.error("[calendar] 이벤트 수정 실패", err);
    return false;
  }
}

/** 캘린더 이벤트를 삭제한다 (일정 취소/삭제 시). */
export async function deleteCalendarEvent(googleEventId: string): Promise<boolean> {
  if (!isCalendarConfigured() || !googleEventId) return false;
  try {
    const calendar = getCalendarApi();
    await calendar.events.delete({
      calendarId: CALENDAR_ID,
      eventId: googleEventId,
    });
    return true;
  } catch (err) {
    console.error("[calendar] 이벤트 삭제 실패", err);
    return false;
  }
}

export function buildCalendarEventLink(googleEventId: string): string | null {
  if (!googleEventId) return null;
  // event id 를 base64 유사 형식으로 인코딩해야 정확히 열리지만,
  // 대부분의 경우 아래 형태로도 구글 캘린더 앱/웹에서 검색 결과로 연결된다.
  return `https://calendar.google.com/calendar/u/0/r/eventedit/${googleEventId}`;
}
