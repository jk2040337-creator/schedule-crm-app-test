import { NextRequest, NextResponse } from "next/server";
import { createCustomer, listCustomers } from "@/lib/customers";

export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const customers = await listCustomers();
    // 최근 등록순으로 정렬
    customers.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return NextResponse.json({ customers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.phone) {
      return NextResponse.json(
        { error: "이름과 전화번호는 필수입니다." },
        { status: 400 }
      );
    }
    const customer = await createCustomer({
      name: body.name,
      phone: body.phone,
      address: body.address ?? "",
      serviceType: body.serviceType ?? "기타",
      memo: body.memo ?? "",
      status: body.status ?? "가망",
      lastServiceDate: body.lastServiceDate ?? "",
      reminderIntervalYears: body.reminderIntervalYears ?? "2",
    });
    return NextResponse.json({ customer }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
