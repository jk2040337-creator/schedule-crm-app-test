import { classNames } from "@/lib/utils";
import type { ScheduleStatus } from "@/lib/types";

const styles: Record<ScheduleStatus, string> = {
  예정: "bg-peach-100 text-peach-600",
  완료: "bg-sage-100 text-sage-500",
  취소: "bg-sand-100 text-muted line-through",
};

export default function StatusBadge({ status }: { status: ScheduleStatus | string }) {
  const style = styles[status as ScheduleStatus] ?? "bg-sand-100 text-muted";
  return (
    <span className={classNames("rounded-full px-2.5 py-1 text-xs font-semibold", style)}>
      {status}
    </span>
  );
}
