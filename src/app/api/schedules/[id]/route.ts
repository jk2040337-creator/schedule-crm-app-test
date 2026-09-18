import { NextRequest, NextResponse } from "next/server";
import { deleteSchedule, getSchedule, updateSchedule } from "@/lib/schedules";
import { getCustomer } from "@/lib/customers";
import {
    deleteCalendarEvent,
    updateCalendarEvent,
} from "@/lib/googleCalendarClient";

export async function GET(
    _req: NextRequest,
  { params }: { params: { id: string } }
  ) {
    try {
          const schedule = await getSchedule(params.id);
          if (!schedule) {
                  return NextResponse.json({ error: "일정을 찾을 수 없습니다." }, { status: 404 });
          }
          const customer = await getCustomer(schedule.customerId);
          return NextResponse.json({ schedule, customer });
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
          const existing = await getSchedule(params.id);
          if (!existing) {
                  return NextResponse.json({ error: "일정을 찾을 수 없습니다." }, { status: 404 });
          }
          const customer = await getCustomer(existing.customerId);

      const updated = await updateSchedule(params.id, {
              datetime: body.datetime ?? existing.datetime,
              serviceType: body.serviceType ?? existing.serviceType,
              address: body.address ?? existing.address,
              status: body.status ?? existing.status,
              memo: body.memo ?? existing.memo,
              photoUrls: body.photoUrls ?? existing.photoUrls,
              estimateAmount: body.estimateAmount ?? existing.estimateAmount,
              warrantyUntil: body.warrantyUntil ?? existing.warrantyUntil,
              contractFileUrl: body.contractFileUrl ?? existing.contractFileUrl,
      });

      const isCancelled = updated.status === "취소";

      if (isCancelled && updated.googleEventId) {
              await deleteCalendarEvent(updated.googleEventId);
              await updateSchedule(params.id, { googleEventId: "" });
              updated.googleEventId = "";
      } else if (!isCancelled && customer) {
              const scheduleInput = {
                        customerId: updated.customerId,
                        datetime: updated.datetime,
                        serviceType: updated.serviceType,
                        address: updated.address,
                        status: updated.status,
                        memo: updated.memo,
                        photoUrls: updated.photoUrls,
                        estimateAmount: updated.estimateAmount,
                        warrantyUntil: updated.warrantyUntil,
                        contractFileUrl: updated.contractFileUrl,
              };
              if (updated.googleEventId) {
                        await updateCalendarEvent(updated.googleEventId, scheduleInput, customer.name);
              } else {
                        const { createCalendarEvent } = await import("@/lib/googleCalendarClient");
                        const eventId = await createCalendarEvent(scheduleInput, customer.name);
                        if (eventId) {
                                    await updateSchedule(params.id, { googleEventId: eventId });
                                    updated.googleEventId = eventId;
                        }
              }
      }

      return NextResponse.json({ schedule: updated });
    } catch (err: any) {
          return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(
    _req: NextRequest,
  { params }: { params: { id: string } }
  ) {
    try {
          const existing = await getSchedule(params.id);
          if (existing?.googleEventId) {
                  await deleteCalendarEvent(existing.googleEventId);
          }
          await deleteSchedule(params.id);
          return NextResponse.json({ ok: true });
    } catch (err: any) {
          return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
