import { NextRequest, NextResponse } from "next/server";
import { getOAuthClient } from "@/lib/googleCalendarClient";

/**
 * 구글 동의 화면 이후 리다이렉트되는 콜백.
 * 발급받은 refresh_token 을 화면에 보여준다 — 이 값을
 * Vercel 환경 변수 GOOGLE_OAUTH_REFRESH_TOKEN 에 등록하면 설정이 끝난다.
 * (이 화면은 최초 설정 시 1회만 사용하고, 이후에는 다시 열 필요 없음)
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return new NextResponse("인가 코드가 없습니다. /api/auth/google 에서 다시 시도해주세요.", {
      status: 400,
    });
  }

  try {
    const oauth2Client = getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      return new NextResponse(
        "refresh_token이 발급되지 않았습니다. 구글 계정 설정에서 이 앱의 접근 권한을 제거한 뒤 /api/auth/google 로 다시 시도해주세요 (prompt=consent 로 다시 동의 화면이 뜹니다).",
        { status: 400 }
      );
    }

    const html = `
      <html>
        <head><meta charset="utf-8" /><title>구글 캘린더 연동 완료</title></head>
        <body style="font-family: sans-serif; padding: 40px; line-height:1.6;">
          <h2>✅ 구글 캘린더 연동을 위한 refresh token이 발급되었습니다</h2>
          <p>아래 값을 복사해서 Vercel 프로젝트의 환경 변수
          <code>GOOGLE_OAUTH_REFRESH_TOKEN</code> 에 등록한 뒤 재배포하세요.</p>
          <textarea style="width:100%; height:100px; font-size:14px;" readonly>${tokens.refresh_token}</textarea>
          <p style="color:#b45309;">이 값은 비밀번호와 같으니 외부에 공유하지 마세요.</p>
        </body>
      </html>
    `;
    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err: any) {
    return new NextResponse(`토큰 발급 실패: ${err.message}`, { status: 500 });
  }
}
