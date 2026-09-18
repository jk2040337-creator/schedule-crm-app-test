import Link from "next/link";
import type { Customer } from "@/lib/types";
import PhoneLink from "./PhoneLink";
import CustomerStatusBadge from "./CustomerStatusBadge";

export default function CustomerCard({ customer }: { customer: Customer }) {
  return (
    <Link
      href={`/customers/${customer.id}`}
      className="block rounded-card bg-paper p-4 shadow-soft transition active:scale-[0.99]"
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-base font-semibold">{customer.name}</p>
            <CustomerStatusBadge status={customer.status} />
          </div>
          <p className="mt-0.5 text-xs text-muted">{customer.serviceType}</p>
        </div>
        <PhoneLink phone={customer.phone} />
      </div>
      {customer.address && (
        <p className="mt-2 truncate text-xs text-muted">📍 {customer.address}</p>
      )}
    </Link>
  );
}
