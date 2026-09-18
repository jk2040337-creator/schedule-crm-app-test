"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PhoneLink from "@/components/PhoneLink";
import AddressLink from "@/components/AddressLink";
import StatusBadge from "@/components/StatusBadge";
import CustomerStatusBadge from "@/components/CustomerStatusBadge";
import type { Customer, Schedule } from "@/lib/types";
import { calcNextReminderDate, daysUntil, formatDateTime } from "@/lib/utils";

export default function CustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/customers/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          setCustomer(data.customer);
          setSchedules(data.schedules);
        }
      })
      .catch((e) => setError(e.message));
  }, [params.id]);

  async function handleDelete() {
    if (!confirm("이 고객 정보를 삭제할까요? 연결된 일정은 남아있습니다.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/customers/${params.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("삭제에 실패했어요.");
      router.push("/customers");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setDeleting(false);
    }
  }

  if (error) {
    return <p className="rounded-xl2 bg-red-50 p-3 text-sm text-red-500">{error}</p>;
  }

  if (!customer) {
    return <div className="h-40 animate-pulse rounded-card bg-sand-100" />;
  }

  return (
    <div className="space-y-5">
      <div className="rounded-card bg-paper p-5 shadow-card">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-bold">{customer.name}</h1>
              <CustomerStatusBadge status={customer.status} />
            </div>
            <p className="mt-1 text-xs text-muted">{customer.serviceType}</p>
          </div>
          <Link
            href={`/customers/${customer.id}/edit`}
            className="rounded-full border border-sand-200 px-3 py-1.5 text-xs font-semibold text-muted active:bg-sand-50"
          >
            수정
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <PhoneLink phone={customer.phone} />
          <AddressLink address={customer.address} />
        </div>

        {customer.memo && (
          <p className="mt-4 whitespace-pre-wrap rounded-xl2 bg-sand-50 p-3 text-sm text-ink">
            {customer.memo}
          </p>
        )}

        {customer.serviceType === "에어컨청소" && customer.lastServiceDate && (
          <ReminderInfo
            lastServiceDate={customer.lastServiceDate}
            intervalYears={customer.reminderIntervalYears}
          />
        )}
      </div>

      <div className="flex gap-2">
        <Link
          href={`/schedules/new?customerId=${customer.id}`}
          className="flex-1 rounded-xl2 bg-peach-500 py-2.5 text-center text-sm font-semibold text-white active:bg-peach-600"
        >
          + 일정 등록
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-xl2 border border-sand-200 px-4 py-2.5 text-sm font-semibold text-muted active:bg-sand-50 disabled:opacity-60"
        >
          삭제
        </button>
      </div>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-muted">시공 이력</h2>
        {schedules.length === 0 ? (
          <div className="rounded-card border border-dashed border-sand-200 bg-paper/60 p-6 text-center text-sm text-muted">
            아직 등록된 일정이 없어요.
          </div>
        ) : (
          <div className="space-y-2">
            {schedules.map((s) => (
              <Link
                key={s.id}
                href={`/schedules/${s.id}`}
                className="flex items-center justify-between rounded-card bg-paper p-4 shadow-soft"
              >
                <div>
                  <p className="text-sm font-medium">{formatDateTime(s.datetime)}</p>
                  <p className="mt-0.5 text-xs text-muted">{s.serviceType}</p>
                </div>
                <StatusBadge status={s.status} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ReminderInfo({
  lastServiceDate,
  intervalYears,
}: {
  lastServiceDate: string;
  intervalYears: string;
}) {
  const nextDate = calcNextReminderDate(lastServiceDate, intervalYears);
  const remain = daysUntil(nextDate);
  const due = remain <= 0;
  return (
    <div
      className={`mt-4 rounded-xl2 p-3 text-sm ${
        due ? "bg-peach-100 text-peach-600" : "bg-sky-50 text-sky-600"
      }`}
    >
      {due
        ? `재방문 알림 도래 — 다음 청소 예정일 ${nextDate}`
        : `다음 재방문 알림 예정일: ${nextDate} (약 ${remain}일 남음)`}
      <span className="ml-1 text-xs text-muted">· {intervalYears || "2"}년 주기</span>
    </div>
  );
}
