"use client";

import { useEffect, useState } from "react";
import ScheduleForm from "@/components/ScheduleForm";
import type { Schedule } from "@/lib/types";

export default function EditSchedulePage({
  params,
}: {
  params: { id: string };
}) {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/schedules/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setSchedule(data.schedule);
      })
      .catch((e) => setError(e.message));
  }, [params.id]);

  if (error) {
    return <p className="rounded-xl2 bg-red-50 p-3 text-sm text-red-500">{error}</p>;
  }
  if (!schedule) {
    return <div className="h-40 animate-pulse rounded-card bg-sand-100" />;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">일정 수정</h1>
      <ScheduleForm initial={schedule} scheduleId={schedule.id} />
    </div>
  );
}
