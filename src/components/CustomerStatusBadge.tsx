import { classNames } from "@/lib/utils";
import type { CustomerStatus } from "@/lib/types";

const styles: Record<CustomerStatus, string> = {
  가망: "bg-sky-100 text-sky-600",
  가완: "bg-sage-100 text-sage-500",
  재연락: "bg-peach-100 text-peach-600",
  부재중: "bg-sand-100 text-muted",
  거절: "bg-sand-100 text-muted line-through",
};

export default function CustomerStatusBadge({
  status,
}: {
  status: CustomerStatus | string;
}) {
  const style = styles[status as CustomerStatus] ?? "bg-sand-100 text-muted";
  return (
    <span className={classNames("rounded-full px-2.5 py-1 text-xs font-semibold", style)}>
      {status || "가망"}
    </span>
  );
}
