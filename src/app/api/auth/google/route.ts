import { NextResponse } from "next/server";
import { getOAuthClient } from "@/lib/googleCalendarClient";

/**
 * 최초 1회만 방문하는 엔드포인트.
 * 구글 로그인 → 동의 화면에서 캘린더 접근을 승인하면
 * /api/auth/google/callback 으로 리다이렉트되어 리프레시 토큰을 발급받는다.
 */
export const dynamic = "force-dynamic";
export async function GET() {
  const oauth2Client = getOAuthClient();
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent", // 항상 refresh_token 을 받기 위해 매번 동의 화면을 띄움
    scope: ["https://www.googleapis.com/auth/calendar"],
  });
  return NextResponse.redirect(url);
}
