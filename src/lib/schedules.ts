import { v4 as uuidv4 } from "uuid";
import {
  appendRow,
  deleteRow,
  findRowIndexById,
  readRows,
  updateRow,
} from "./googleSheetsClient";
import type { Schedule } from "./types";

const SHEET = "Schedules";

function rowToSchedule(row: string[]): Schedule {
  return {
    id: row[0] ?? "",
    customerId: row[1] ?? "",
    datetime: row[2] ?? "",
    serviceType: row[3] ?? "",
    address: row[4] ?? "",
    status: (row[5] as Schedule["status"]) || "예정",
    memo: row[6] ?? "",
    createdAt: row[7] ?? "",
    googleEventId: row[8] ?? "",
    photoUrls: row[9] ?? "",
    estimateAmount: row[10] ?? "",
    warrantyUntil: row[11] ?? "",
    contractFileUrl: row[12] ?? "",
  };
}

function scheduleToRow(schedule: Schedule): string[] {
  return [
    schedule.id,
    schedule.customerId,
    schedule.datetime,
    schedule.serviceType,
    schedule.address,
    schedule.status,
    schedule.memo,
    schedule.createdAt,
    schedule.googleEventId,
    schedule.photoUrls,
    schedule.estimateAmount,
    schedule.warrantyUntil,
    schedule.contractFileUrl,
  ];
}

export async function listSchedules(): Promise<Schedule[]> {
  const rows = await readRows(SHEET);
  return rows.filter((r) => r[0]).map(rowToSchedule);
}

export async function getSchedule(id: string): Promise<Schedule | null> {
  const { index, rows } = await findRowIndexById(SHEET, id);
  if (index === -1) return null;
  return rowToSchedule(rows[index]);
}

export async function createSchedule(
  input: Omit<Schedule, "id" | "createdAt" | "googleEventId">
): Promise<Schedule> {
  const schedule: Schedule = {
    ...input,
    id: `s-${uuidv4().slice(0, 8)}`,
    createdAt: new Date().toISOString(),
    googleEventId: "",
  };
  await appendRow(SHEET, scheduleToRow(schedule));
  return schedule;
}

export async function updateSchedule(
  id: string,
  input: Partial<Omit<Schedule, "id" | "createdAt">>
): Promise<Schedule> {
  const { index, rows } = await findRowIndexById(SHEET, id);
  if (index === -1) throw new Error("일정을 찾을 수 없습니다.");
  const existing = rowToSchedule(rows[index]);
  const updated: Schedule = { ...existing, ...input, id: existing.id };
  await updateRow(SHEET, index, scheduleToRow(updated));
  return updated;
}

export async function deleteSchedule(id: string): Promise<void> {
  const { index } = await findRowIndexById(SHEET, id);
  if (index === -1) return;
  await deleteRow(SHEET, index);
}
