# 일정관리 · 고객관리 웹앱 (v2 테스트 버전)

시공 서비스(에어컨청소·보일러설치·커튼블라인드설치·시스템행거설치)를 운영하는 1인 사업자를 위한 개인용 웹앱입니다. 고객 정보와 방문 일정을 한 곳에서 관리하고, 전화 걸기·지도 내비게이션·구글 캘린더 자동 등록까지 이어집니다.

> ⚠️ 이 버전은 기존 운영 중인 `schedule-crm-app`을 그대로 복사해서 새 기능을 추가한 **테스트용 확장판**입니다. 원본 프로젝트는 건드리지 않았고, 이 폴더 내용을 **별도 GitHub 저장소(또는 브랜치) + 별도 Vercel 프로젝트**로 배포해서 먼저 확인해보시라고 만들었습니다. 마음에 들면 그때 기존 운영 앱에 반영하면 됩니다.

## 기능 (v1에서 추가된 것)
- 고객 상태 태그(가망·가완·재연락·부재중·거절)
- 에어컨청소 고객 재방문 알림 (기본 2년 주기, 고객별 1년으로 조정 가능) — 홈 화면에 도래 고객 표시
- 일정에 시공 전·후 사진 링크(구글 드라이브), 견적금액, A/S·하자보증 만료일 기록
- 커튼블라인드·시스템행거 일정에 계약서·도면 링크 필드
- 에어컨청소 일정 상세에서 예약확정 문자 문구 자동 생성 + 복사 (자동 발송은 하지 않음)
- 시스템행거 전용 원가 계산기 (`/tools/hanger-estimate`): 실측(mm) → 자 환산 → 자재원가 자동 계산

## 원래 있던 기능
- 고객 등록/수정/삭제, 전화번호 탭 → 바로 전화 연결, 주소 탭 → 카카오맵 길찾기 연결
- 일정 등록/수정/삭제, 캘린더 뷰 · 리스트 뷰, 저장 시 구글 캘린더에 자동 등록/수정/삭제
- 고객명·전화번호·주소·메모 통합 검색
- 모바일 우선의 편안한 카드형 디자인

## 기술 스택
Next.js(App Router) · TypeScript · Tailwind CSS · Google Sheets API(서비스 계정) · Google Calendar API(OAuth) · Vercel 배포

---

## 처음 설정하는 방법 (본인이 직접 해야 하는 단계)

### 1. 구글 스프레드시트 만들기

**테스트용으로는 기존에 쓰던 시트를 그대로 복제(사본 만들기)해서 사용하는 걸 추천합니다.** 그래야 실제 운영 데이터에 영향 없이 안전하게 테스트할 수 있어요.

1. [Google Drive](https://drive.google.com)에서 기존 시트를 열고 "파일 > 사본 만들기"로 복제합니다 (예: `일정관리_고객관리_DB_테스트`). 새로 만드는 경우엔 아래 두 시트(탭)를 만들고, 1행에 헤더를 정확히 아래 순서대로 입력합니다.

**Customers 탭** (v2: `status`, `last_service_date`, `reminder_interval_years` 3개 컬럼 추가)
```
id | name | phone | address | service_type | memo | created_at | status | last_service_date | reminder_interval_years
```

**Schedules 탭** (v2: `photo_urls`, `estimate_amount`, `warranty_until`, `contract_file_url` 4개 컬럼 추가)
```
id | customer_id | datetime | service_type | address | status | memo | created_at | google_event_id | photo_urls | estimate_amount | warranty_until | contract_file_url
```

기존 시트를 복제했다면, 헤더 행 끝에 위 새 컬럼들만 추가로 입력하면 됩니다.

2. 스프레드시트 URL에서 ID를 복사해둡니다. (`https://docs.google.com/spreadsheets/d/`**`이 부분`**`/edit`)

### 2. Google Cloud 프로젝트 & 서비스 계정 (시트 접근용)
1. [Google Cloud Console](https://console.cloud.google.com)에서 새 프로젝트를 만듭니다.
2. "API 및 서비스 > 라이브러리"에서 **Google Sheets API**와 **Google Calendar API**를 모두 활성화합니다.
3. "API 및 서비스 > 사용자 인증 정보 > 사용자 인증 정보 만들기 > 서비스 계정"으로 서비스 계정을 만듭니다.
4. 만든 서비스 계정에서 "키 추가 > 새 키 만들기 > JSON"을 눌러 키 파일을 다운로드합니다. 이 파일 안의 `client_email`과 `private_key` 값을 나중에 씁니다.
5. 1단계에서 만든 스프레드시트를 열고, "공유" 버튼으로 서비스 계정 이메일(`...iam.gserviceaccount.com`)을 **편집자**로 추가합니다.

### 3. OAuth 클라이언트 (구글 캘린더 자동 등록용)
1. 같은 Google Cloud 프로젝트의 "사용자 인증 정보 만들기 > OAuth 클라이언트 ID"를 선택합니다.
2. 애플리케이션 유형은 **웹 애플리케이션**으로 선택합니다.
3. "승인된 리디렉션 URI"에 `https://<배포된 주소>/api/auth/google/callback` 을 등록합니다. (배포 전이라면 임시로 나중에 다시 등록해도 됩니다.)
4. 클라이언트 ID와 클라이언트 보안 비밀번호를 복사해둡니다.
5. OAuth 동의 화면이 "테스트" 상태라면, 테스트 사용자로 본인 구글 계정을 추가해야 로그인할 수 있습니다.

### 4. GitHub & Vercel

**테스트 버전이므로, 기존 `schedule-crm-app` 저장소와는 별개의 새 저장소로 올리는 걸 추천합니다.** (예: `schedule-crm-app-test`) 이렇게 하면 지금 운영 중인 배포는 전혀 건드리지 않고, 새 주소에서 안전하게 눌러볼 수 있어요.

1. GitHub에 새 저장소(`schedule-crm-app-test` 등)를 만들고 이 폴더 내용을 올립니다.
2. [Vercel](https://vercel.com)에서 해당 새 GitHub 저장소를 Import 합니다 (기존 프로젝트와 다른, 새 Vercel 프로젝트가 됩니다).
3. Vercel 프로젝트의 "Settings > Environment Variables"에서 아래 값을 등록합니다 (`.env.example` 참고).

```
GOOGLE_SHEETS_SPREADSHEET_ID
GOOGLE_SERVICE_ACCOUNT_EMAIL
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY   ← JSON 키 파일의 private_key 값 그대로 붙여넣기 (줄바꿈 포함 가능)
GOOGLE_OAUTH_CLIENT_ID
GOOGLE_OAUTH_CLIENT_SECRET
GOOGLE_OAUTH_REDIRECT_URI            ← https://<배포된 주소>/api/auth/google/callback
GOOGLE_CALENDAR_ID                   ← 보통 primary
```

4. 배포합니다. (`GOOGLE_OAUTH_REFRESH_TOKEN`은 아직 비워둔 채로 1차 배포)

### 5. 구글 캘린더 최초 1회 연동
1. 배포된 주소로 `/api/auth/google` 페이지에 접속합니다. (예: `https://your-app.vercel.app/api/auth/google`)
2. 구글 로그인 후 캘린더 접근을 승인합니다.
3. 안내 화면에 표시되는 **refresh token** 값을 복사합니다.
4. Vercel 환경 변수 `GOOGLE_OAUTH_REFRESH_TOKEN`에 붙여넣고 다시 배포합니다.
5. 이후로는 일정을 등록/수정/삭제할 때마다 자동으로 구글 캘린더에 반영됩니다.

---

## 로컬에서 실행하기
```bash
npm install
cp .env.example .env.local   # 값 채우기
npm run dev
```

## 폴더 구조
```
src/
  app/                     고객/일정/검색 화면과 API 라우트
  app/tools/hanger-estimate  시스템행거 원가 계산기 (신규)
  components/               공용 UI 컴포넌트
  lib/                      Google Sheets·Calendar 연동, 타입, 유틸 함수
```

## 이 테스트 버전에서 확인해보실 것
- 고객 등록 시 "에어컨청소"를 선택하면 마지막 청소일·재방문 주기 입력란이 나오는지
- 재방문일이 지난 고객이 홈 화면 상단 "재방문 알림"에 뜨는지
- 에어컨청소 일정 상세에서 "예약확정 문자 문구 만들기" 버튼으로 실제 문구가 만들어지고 복사되는지
- `/tools/hanger-estimate`에서 mm 입력 시 자·원가가 정확히 계산되는지 (예: 1,850mm → 6.2자 → 161,200원)
- 커튼블라인드·시스템행거 일정에서 계약서·도면 링크 입력란이 보이는지

## 아직 정해지지 않은 부분
- 지도 앱은 카카오맵을 기본으로 연결해두었습니다. 네이버지도/Google지도로 바꾸고 싶다면 `src/lib/utils.ts`의 `toKakaoMapHref` 함수만 바꾸면 됩니다.
- 여러 사람이 함께 쓰는 기능(로그인/권한)은 아직 없습니다.
