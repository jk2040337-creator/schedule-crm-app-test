/** 전화번호에서 숫자만 남긴다 (tel: 링크용) */
export function toTelHref(phone: string): string {
  return `tel:${phone.replace(/[^0-9+]/g, "")}`;
}

/** 주소를 카카오맵 검색(길찾기) 링크로 변환한다. */
export function toKakaoMapHref(address: string): string {
  return `https://map.kakao.com/link/search/${encodeURIComponent(address)}`;
}

/** ISO datetime 문자열을 "9월 20일(일) 오후 2:00" 형태로 표시한다. */
export function formatDateTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const month = d.getMonth() + 1;
  const date = d.getDate();
  const day = days[d.getDay()];
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours < 12 ? "오전" : "오후";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  const minuteStr = minutes.toString().padStart(2, "0");
  return `${month}월 ${date}일(${day}) ${ampm} ${hour12}:${minuteStr}`;
}

/** ISO datetime 문자열을 "2026-09-20" 형태(날짜만)로 반환한다. */
export function toDateKey(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayKey(): string {
  return toDateKey(new Date().toISOString());
}

/** datetime-local input 값(로컬 기준, timezone 없음)을 서버에 저장할 ISO 문자열로 변환 */
export function localInputToIso(localValue: string): string {
  if (!localValue) return "";
  // localValue 예: "2026-09-20T14:00" — 브라우저 로컬(한국) 기준이라고 가정하고 +09:00 부여
  return `${localValue}:00+09:00`;
}

/** ISO 문자열을 datetime-local input 이 요구하는 "YYYY-MM-DDTHH:mm" 형태로 변환 */
export function isoToLocalInput(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  const h = d.getHours().toString().padStart(2, "0");
  const min = d.getMinutes().toString().padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

export function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

/** 마지막 시공일 + 주기(년)로 다음 재방문 알림일(YYYY-MM-DD)을 계산한다. */
export function calcNextReminderDate(
  lastServiceDate: string,
  intervalYears: string | number
): string {
  if (!lastServiceDate) return "";
  const years = Number(intervalYears) || 2;
  const d = new Date(`${lastServiceDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  d.setFullYear(d.getFullYear() + years);
  return toDateKey(d.toISOString());
}

/** 다음 재방문일까지 남은 일수 (음수면 이미 도래한 것) */
export function daysUntil(dateKey: string): number {
  if (!dateKey) return Infinity;
  const target = new Date(`${dateKey}T00:00:00`).getTime();
  const today = new Date(`${todayKey()}T00:00:00`).getTime();
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

/** mm 실측 길이를 "자"(300mm)로 환산 후 소수점 첫째 자리까지 반올림 */
export function mmToJa(mm: number): number {
  return Math.round((mm / 300) * 10) / 10;
}

/** 시스템행거 자재원가 = 자(반올림 전 실제 환산값) × 26,000원 */
export function hangerMaterialCost(mm: number): number {
  return Math.round((mm / 300) * 26000);
}

/** 원 단위 숫자를 "104,000원" 형태 문자열로 */
export function formatWon(amount: number): string {
  return `${Math.round(amount).toLocaleString("ko-KR")}원`;
}

/** 예약확정 문자 문구를 채워서 반환한다. (에어컨청소 전용 템플릿) */
export function buildAcConfirmMessage(params: {
  datetime: string;
  address: string;
  unitCount: string;
  amount: string;
}): string {
  const { datetime, address, unitCount, amount } = params;
  const d = datetime ? new Date(datetime) : null;
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  let visitLine = "{방문일시}";
  if (d && !Number.isNaN(d.getTime())) {
    const month = d.getMonth() + 1;
    const date = d.getDate();
    const day = days[d.getDay()];
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours < 12 ? "오전" : "오후";
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;
    const minuteStr = minutes === 0 ? "" : ` ${minutes}분`;
    visitLine = `${month}월/${date}일(${day}) ${ampm} ${hour12}시${minuteStr}경`;
  }
  return `안녕하세요
에어컨 청소업체 올바로 홈케어입니다.

${visitLine}

${address || "{방문주소}"}

시스템에어컨 청소 ${unitCount || "{대수}"}대
${amount || "{금액}"}에 진행하도록 하겠습니다


원활한 세척을 위해서
1.차단기(두꺼비집) 위치 파악해주세요

2.에어컨 리모컨 챙겨주세요(오랫만에 가동을 하다보니 배터리가 없는 경우도 종종 있습니다. 배터리도 같이 챙겨주세요)

3. 도로교통 상황으로 시간 변동 발생시 연락드리겠습니다

맡겨주신만큼 청결함으로 보답하겠습니다.

당일 출발전 도착시간 확인하고 연락드리겠습니다. 감사합니다.`;
}
