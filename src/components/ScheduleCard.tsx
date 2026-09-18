import Link from "next/link";
import type { ScheduleWithCustomer } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import StatusBadge from "./StatusBadge";

export default function ScheduleCard({
  schedule,
}: {
  schedule: ScheduleWithCustomer;
}) {
  return (
    <Link
      href={`/schedules/${schedule.id}`}
      className="block rounded-card bg-paper p-4 shadow-soft transition active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-muted">
            {formatDateTime(schedule.datetime)}
          </p>
          <p className="mt-1 text-base font-semibold">
            {schedule.customerName}{" "}
            <span className="font-normal text-muted">· {schedule.serviceType}</span>
          </p>
        </div>
        <StatusBadge status={schedule.status} />
      </div>
      {schedule.address && (
        <p className="mt-2 truncate text-xs text-muted">📍 {schedule.address}</p>
      )}
    </Link>
  );
}
