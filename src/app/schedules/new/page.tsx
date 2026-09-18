"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ScheduleForm from "@/components/ScheduleForm";

function NewScheduleInner() {
  const params = useSearchParams();
  const customerId = params.get("customerId") ?? undefined;
  return <ScheduleForm defaultCustomerId={customerId} />;
}

export default function NewSchedulePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">일정 등록</h1>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-card bg-sand-100" />}>
        <NewScheduleInner />
      </Suspense>
    </div>
  );
}
