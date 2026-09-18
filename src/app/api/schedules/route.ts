import { NextRequest, NextResponse } from "next/server";
import { createSchedule, listSchedules, updateSchedule } from "@/lib/schedules";
import { getCustomer, listCustomers } from "@/lib/customers";
import { createCalendarEvent } from "@/lib/googleCalendarClient";
import type { ScheduleWithCustomer } from "@/lib/types";

export async function GET() {
  try {
    const [schedules, customers] = await Promise.all([
      listSchedules(),
      listCustomers(),
    ]);
    const customerMap = new Map(customers.map((c) => [c.id, c]));
    const result: ScheduleWithCustomer[] = schedules
      .map((s) => ({
        ...s,
        customerName: customerMap.get(s.customerId)?.name ?? "(알 수 없음)",
        customerPhone: customerMap.get(s.customerId)?.phone ?? "",
      }))
      .sort((a, b) => (a.datetime < b.datetime ? -1 : 1));
    return NextResponse.json({ schedules: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.customerId || !body.datetime) {
      return NextResponse.json(
        { error: "고객과 방문 일시는 필수입니다." },
        { status: 400 }
      );
    }
    const customer = await getCustomer(body.customerId);
    if (!customer) {
      return NextResponse.json({ error: "고객을 찾을 수 없습니다." }, { status: 400 });
    }

    const input = {
      customerId: body.customerId,
      datetime: body.datetime,
      serviceType: body.serviceType || customer.serviceType || "기타",
      address: body.address || customer.address,
      status: (body.status as any) || "예정",
      memo: body.memo ?? "",
      photoUrls: body.photoUrls ?? "",
      estimateAmount: body.estimateAmount ?? "",
      warrantyUntil: body.warrantyUntil ?? "",
      contractFileUrl: body.contractFileUrl ?? "",
    };

    const schedule = await createSchedule(input);

    // 구글 캘린더 자동 등록 (실패해도 시트 저장은 이미 성공한 상태로 유지)
    const eventId = await createCalendarEvent(input, customer.name);
    if (eventId) {
      await updateSchedule(schedule.id, { googleEventId: eventId });
      schedule.googleEventId = eventId;
    }

    return NextResponse.json(
      { schedule, calendarSynced: Boolean(eventId) },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
