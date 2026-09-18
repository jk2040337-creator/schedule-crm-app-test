"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import MonthCalendar from "@/components/MonthCalendar";
import ScheduleCard from "@/components/ScheduleCard";
import SearchBar from "@/components/SearchBar";
import type { ScheduleWithCustomer } from "@/lib/types";
import { classNames, toDateKey, todayKey } from "@/lib/utils";

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<ScheduleWithCustomer[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "calendar">("list");

  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selectedDate, setSelectedDate] = useState(todayKey());

  useEffect(() => {
    fetch("/api/schedules")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setSchedules(data.schedules);
      })
      .catch((e) => setError(e.message));
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, ScheduleWithCustomer[]>();
    (schedules ?? [])
      .filter((s) => s.status !== "취소")
      .forEach((s) => {
        const key = toDateKey(s.datetime);
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(s);
      });
    return [...map.entries()].sort(([a], [b]) => (a < b ? -1 : 1));
  }, [schedules]);

  const countsByDate = useMemo(() => {
    const counts: Record<string, number> = {};
    (schedules ?? [])
      .filter((s) => s.status !== "취소")
      .forEach((s) => {
        const key = toDateKey(s.datetime);
        counts[key] = (counts[key] ?? 0) + 1;
      });
    return counts;
  }, [schedules]);

  const selectedDaySchedules = (schedules ?? []).filter(
    (s) => toDateKey(s.datetime) === selectedDate
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">일정</h1>
        <Link
          href="/schedules/new"
          className="rounded-full bg-peach-500 px-4 py-2 text-sm font-semibold text-white active:bg-peach-600"
        >
          + 등록
        </Link>
      </div>

      <SearchBar placeholder="고객명, 메모로 일정 검색" />

      <div className="flex gap-2 rounded-full bg-sand-100 p-1 text-sm">
        {(["list", "calendar"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={classNames(
              "flex-1 rounded-full py-1.5 font-semibold transition",
              view === v ? "bg-paper text-peach-600 shadow-soft" : "text-muted"
            )}
          >
            {v === "list" ? "리스트" : "캘린더"}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-xl2 bg-red-50 p-3 text-sm text-red-500">
          데이터를 불러오지 못했어요: {error}
        </p>
      )}

      {schedules === null ? (
        <div className="h-40 animate-pulse rounded-card bg-sand-100" />
      ) : view === "list" ? (
        grouped.length === 0 ? (
          <div className="rounded-card border border-dashed border-sand-200 bg-paper/60 p-8 text-center text-sm text-muted">
            등록된 일정이 없어요.
          </div>
        ) : (
          <div className="space-y-5">
            {grouped.map(([date, items]) => (
              <div key={date}>
                <p className="mb-2 text-xs font-semibold text-muted">{date}</p>
                <div className="space-y-2">
                  {items.map((s) => (
                    <ScheduleCard key={s.id} schedule={s} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="space-y-4">
          <MonthCalendar
            year={cursor.year}
            month={cursor.month}
            countsByDate={countsByDate}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onPrevMonth={() =>
              setCursor((c) =>
                c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 }
              )
            }
            onNextMonth={() =>
              setCursor((c) =>
                c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 }
              )
            }
          />
          <div>
            <p className="mb-2 text-xs font-semibold text-muted">{selectedDate} 일정</p>
            {selectedDaySchedules.length === 0 ? (
              <div className="rounded-card border border-dashed border-sand-200 bg-paper/60 p-6 text-center text-sm text-muted">
                이 날은 일정이 없어요.
              </div>
            ) : (
              <div className="space-y-2">
                {selectedDaySchedules.map((s) => (
                  <ScheduleCard key={s.id} schedule={s} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
