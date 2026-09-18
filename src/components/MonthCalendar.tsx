"use client";

import { classNames, toDateKey, todayKey } from "@/lib/utils";

export default function MonthCalendar({
  year,
  month, // 0-based
  countsByDate,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: {
  year: number;
  month: number;
  countsByDate: Record<string, number>;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}) {
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay(); // 0=일
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = todayKey();

  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="rounded-card bg-paper p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={onPrevMonth}
          className="h-8 w-8 rounded-full text-muted active:bg-sand-50"
        >
          ‹
        </button>
        <p className="text-sm font-semibold">
          {year}년 {month + 1}월
        </p>
        <button
          onClick={onNextMonth}
          className="h-8 w-8 rounded-full text-muted active:bg-sand-50"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-xs text-muted">
        {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(
            day
          ).padStart(2, "0")}`;
          const count = countsByDate[dateKey] ?? 0;
          const isToday = dateKey === today;
          const isSelected = dateKey === selectedDate;
          return (
            <button
              key={i}
              onClick={() => onSelectDate(dateKey)}
              className={classNames(
                "mx-auto flex h-9 w-9 flex-col items-center justify-center rounded-full text-sm",
                isSelected
                  ? "bg-peach-500 text-white font-semibold"
                  : isToday
                  ? "border border-peach-400 text-peach-600 font-semibold"
                  : "text-ink"
              )}
            >
              {day}
              {count > 0 && !isSelected && (
                <span className="-mt-1 h-1 w-1 rounded-full bg-peach-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
