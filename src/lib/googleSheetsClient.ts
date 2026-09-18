import { google } from "googleapis";

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID ?? "";

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!email || !rawKey) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY 환경 변수가 설정되어 있지 않습니다."
    );
  }

  // .env 에는 개행이 \n 문자열로 저장되므로 실제 개행으로 되돌린다.
  const privateKey = rawKey.replace(/\\n/g, "\n");

  return new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export function getSheetsClient() {
  if (!SPREADSHEET_ID) {
    throw new Error("GOOGLE_SHEETS_SPREADSHEET_ID 환경 변수가 설정되어 있지 않습니다.");
  }
  const auth = getAuth();
  return google.sheets({ version: "v4", auth });
}

export { SPREADSHEET_ID };

let sheetIdCache: Record<string, number> = {};

/** 시트(탭) 이름으로 내부 gid(숫자 ID)를 찾는다. 행 삭제(batchUpdate)에 필요하다. */
export async function getSheetGid(sheetName: string): Promise<number> {
  if (sheetIdCache[sheetName] !== undefined) return sheetIdCache[sheetName];

  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const found = res.data.sheets?.find(
    (s) => s.properties?.title === sheetName
  );
  if (!found || found.properties?.sheetId == null) {
    throw new Error(`"${sheetName}" 시트를 찾을 수 없습니다. 시트 이름을 확인해주세요.`);
  }
  sheetIdCache[sheetName] = found.properties.sheetId;
  return found.properties.sheetId;
}

/** 시트 전체 행(헤더 제외)을 2차원 배열로 읽어온다. */
export async function readRows(sheetName: string): Promise<string[][]> {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A2:Z`,
  });
  return (res.data.values as string[][]) ?? [];
}

/** 맨 아래에 새 행을 추가한다. */
export async function appendRow(sheetName: string, row: string[]): Promise<void> {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A2`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
}

/** id(첫 컬럼) 기준으로 행을 찾아 0-based 행 인덱스(헤더 제외)를 반환한다. 없으면 -1. */
export async function findRowIndexById(
  sheetName: string,
  id: string
): Promise<{ index: number; rows: string[][] }> {
  const rows = await readRows(sheetName);
  const index = rows.findIndex((row) => row[0] === id);
  return { index, rows };
}

/** 특정 행(헤더 제외, 0-based) 전체를 덮어쓴다. */
export async function updateRow(
  sheetName: string,
  rowIndex0: number,
  row: string[]
): Promise<void> {
  const sheets = getSheetsClient();
  const rowNumber = rowIndex0 + 2; // 헤더가 1행이므로 +2
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
}

/** 특정 행(헤더 제외, 0-based)을 시트에서 완전히 삭제한다. */
export async function deleteRow(sheetName: string, rowIndex0: number): Promise<void> {
  const sheets = getSheetsClient();
  const gid = await getSheetGid(sheetName);
  const rowNumber = rowIndex0 + 1; // 헤더가 index 0 이므로, 실제 데이터는 index (rowIndex0+1)부터 시작
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: gid,
              dimension: "ROWS",
              startIndex: rowNumber,
              endIndex: rowNumber + 1,
            },
          },
        },
      ],
    },
  });
}
