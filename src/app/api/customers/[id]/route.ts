import { NextRequest, NextResponse } from "next/server";
import { deleteCustomer, getCustomer, updateCustomer } from "@/lib/customers";
import { listSchedules } from "@/lib/schedules";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await getCustomer(params.id);
    if (!customer) {
      return NextResponse.json({ error: "고객을 찾을 수 없습니다." }, { status: 404 });
    }
    const allSchedules = await listSchedules();
    const schedules = allSchedules
      .filter((s) => s.customerId === params.id)
      .sort((a, b) => (a.datetime < b.datetime ? 1 : -1));
    return NextResponse.json({ customer, schedules });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const customer = await updateCustomer(params.id, {
      name: body.name,
      phone: body.phone,
      address: body.address,
      serviceType: body.serviceType,
      memo: body.memo,
      status: body.status,
      lastServiceDate: body.lastServiceDate,
      reminderIntervalYears: body.reminderIntervalYears,
    });
    return NextResponse.json({ customer });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteCustomer(params.id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
