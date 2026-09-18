import { v4 as uuidv4 } from "uuid";
import {
  appendRow,
  deleteRow,
  findRowIndexById,
  readRows,
  updateRow,
} from "./googleSheetsClient";
import type { Customer } from "./types";

const SHEET = "Customers";

function rowToCustomer(row: string[]): Customer {
  return {
    id: row[0] ?? "",
    name: row[1] ?? "",
    phone: row[2] ?? "",
    address: row[3] ?? "",
    serviceType: row[4] ?? "",
    memo: row[5] ?? "",
    createdAt: row[6] ?? "",
    status: row[7] ?? "가망",
    lastServiceDate: row[8] ?? "",
    reminderIntervalYears: row[9] ?? "2",
  };
}

function customerToRow(customer: Customer): string[] {
  return [
    customer.id,
    customer.name,
    customer.phone,
    customer.address,
    customer.serviceType,
    customer.memo,
    customer.createdAt,
    customer.status,
    customer.lastServiceDate,
    customer.reminderIntervalYears,
  ];
}

export async function listCustomers(): Promise<Customer[]> {
  const rows = await readRows(SHEET);
  return rows.filter((r) => r[0]).map(rowToCustomer);
}

export async function getCustomer(id: string): Promise<Customer | null> {
  const { index, rows } = await findRowIndexById(SHEET, id);
  if (index === -1) return null;
  return rowToCustomer(rows[index]);
}

export async function createCustomer(
  input: Omit<Customer, "id" | "createdAt">
): Promise<Customer> {
  const customer: Customer = {
    ...input,
    id: `c-${uuidv4().slice(0, 8)}`,
    createdAt: new Date().toISOString(),
  };
  await appendRow(SHEET, customerToRow(customer));
  return customer;
}

export async function updateCustomer(
  id: string,
  input: Partial<Omit<Customer, "id" | "createdAt">>
): Promise<Customer> {
  const { index, rows } = await findRowIndexById(SHEET, id);
  if (index === -1) throw new Error("고객을 찾을 수 없습니다.");
  const existing = rowToCustomer(rows[index]);
  const updated: Customer = { ...existing, ...input, id: existing.id };
  await updateRow(SHEET, index, customerToRow(updated));
  return updated;
}

export async function deleteCustomer(id: string): Promise<void> {
  const { index } = await findRowIndexById(SHEET, id);
  if (index === -1) return;
  await deleteRow(SHEET, index);
}
