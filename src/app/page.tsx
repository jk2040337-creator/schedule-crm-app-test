"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ScheduleCard from "@/components/ScheduleCard";
import SearchBar from "@/components/SearchBar";
import PhoneLink from "@/components/PhoneLink";
import type { Customer, ScheduleWithCustomer } from "@/lib/types";
import { calcNextReminderDate, daysUntil, todayKey, toDateKey } from "@/lib/utils";

function startOfWeekKey(): string {
  const d = new Date();
  const day = d.getDay();
  const diffToMonday = (day + 6) % 7;
  d.setDate(d.getDate() - diffToMonday);
  return toDateKey(d.toISOString());
}

function endOfWeekKey(): string {
  const d = new Date();
  const day = d.getDay();
  const diffToSunday = 7 - ((day + 6) % 7) - 1;
  d.setDate(d.getDate() + diffToSunday);
  return toDateKey(d.toISOString());
}

export default function HomePage() {
  const [schedules, setSchedules] = useState<ScheduleWithCustomer[] | null>(null);
  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/schedules")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setSchedules(data.schedules);
      })
      .catch((e) => setError(e.message));
    fetch("/api/customers")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setCustomers(data.customers);
      })
      .catch(() => {});
  }, []);

  const today = todayKey();
  const weekStart = startOfWeekKey();
  const weekEnd = endOfWeekKey();

  const upcoming = (schedules ?? []).filter((s) => s.status === "예정");
  const todaySchedules = upcoming.filter((s) => toDateKey(s.datetime) === today);
  const thisWeekSchedules = upcoming.filter((s) => {
    const key = toDateKey(s.datetime);
    return key > today && key >= weekStart && key <= weekEnd;
  });

  const dueReminders = (customers ?? [])
    .filter((c) => c.serviceType === "에어컨청소" && c.lastServiceDate)
    .map((c) => ({
      customer: c,
      nextDate: calcNextReminderDate(c.lastServiceDate, c.reminderIntervalYears),
    }))
    .filter((x) => x.nextDate && daysUntil(x.nextDate) <= 0);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-muted">오늘도 좋은 하루예요 🌤️</p>
        <h1 className="mt-1 text-2xl font-bold">일정관리 · 고객관리</h1>
      </header>

      <SearchBar />

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/schedules/new"
          className="rounded-card bg-peach-500 px-4 py-3 text-center text-sm font-semibold text-white shadow-card active:bg-peach-600"
        >
          + 일정 등록
        </Link>
        <Link
          href="/customers/new"
          className="rounded-card border border-peach-200 bg-paper px-4 py-3 text-center text-sm font-semibold text-peach-600 shadow-soft active:bg-peach-50"
        >
          + 고객 등록
        </Link>
      </div>

      {error && (
        <p className="rounded-xl2 bg-red-50 p-3 text-sm text-red-500">
          데이터를 불러오지 못했어요: {error}
        </p>
      )}

      {dueReminders.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-muted">
            🔔 재방문 알림 ({dueReminders.length})
          </h2>
          <div className="space-y-2">
            {dueReminders.map(({ customer, nextDate }) => (
              <Link
                key={customer.id}
                href={`/customers/${customer.id}`}
                className="flex items-center justify-between rounded-card bg-peach-50 p-4 shadow-soft"
              >
                <div>
                  <p className="text-sm font-medium">{customer.name}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    에어컨청소 재방문 예정일 {nextDate} 도래
                  </p>
                </div>
                <PhoneLink phone={customer.phone} />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-sm font-semibold text-muted">오늘 일정</h2>
        {schedules === null ? (
          <SkeletonList />
        ) : todaySchedules.length === 0 ? (
          <EmptyCard text="오늘 예정된 일정이 없어요." />
        ) : (
          <div className="space-y-2">
            {todaySchedules.map((s) => (
              <ScheduleCard key={s.id} schedule={s} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-muted">이번주 예정</h2>
        {schedules === null ? (
          <SkeletonList />
        ) : thisWeekSchedules.length === 0 ? (
          <EmptyCard text="이번주 남은 일정이 없어요." />
        ) : (
          <div className="space-y-2">
            {thisWeekSchedules.map((s) => (
              <ScheduleCard key={s.id} schedule={s} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <div className="rounded-card border border-dashed border-sand-200 bg-paper/60 p-6 text-center text-sm text-muted">
      {text}
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-2">
      {[0, 1].map((i) => (
        <div key={i} className="h-20 animate-pulse rounded-card bg-sand-100" />
      ))}
    </div>
  );
}
