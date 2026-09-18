"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import CustomerCard from "@/components/CustomerCard";
import ScheduleCard from "@/components/ScheduleCard";
import type { Customer, ScheduleWithCustomer } from "@/lib/types";

function SearchInner() {
  const params = useSearchParams();
  const q = (params.get("q") ?? "").trim().toLowerCase();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [schedules, setSchedules] = useState<ScheduleWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/customers").then((r) => r.json()),
      fetch("/api/schedules").then((r) => r.json()),
    ])
      .then(([c, s]) => {
        setCustomers(c.customers ?? []);
        setSchedules(s.schedules ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const matchedCustomers = useMemo(() => {
    if (!q) return [];
    return customers.filter((c) =>
      [c.name, c.phone, c.address, c.memo, c.serviceType]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [customers, q]);

  const matchedSchedules = useMemo(() => {
    if (!q) return [];
    return schedules.filter((s) =>
      [s.customerName, s.customerPhone, s.address, s.memo, s.serviceType]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [schedules, q]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">검색</h1>
      <SearchBar defaultValue={params.get("q") ?? ""} autoFocus />

      {!q ? (
        <p className="pt-8 text-center text-sm text-muted">
          고객명, 전화번호, 주소, 메모로 검색해보세요.
        </p>
      ) : loading ? (
        <div className="h-32 animate-pulse rounded-card bg-sand-100" />
      ) : matchedCustomers.length === 0 && matchedSchedules.length === 0 ? (
        <p className="pt-8 text-center text-sm text-muted">
          &ldquo;{params.get("q")}&rdquo;에 대한 검색 결과가 없어요.
        </p>
      ) : (
        <div className="space-y-6">
          {matchedCustomers.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold text-muted">
                고객 ({matchedCustomers.length})
              </h2>
              <div className="space-y-2">
                {matchedCustomers.map((c) => (
                  <CustomerCard key={c.id} customer={c} />
                ))}
              </div>
            </section>
          )}
          {matchedSchedules.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold text-muted">
                일정 ({matchedSchedules.length})
              </h2>
              <div className="space-y-2">
                {matchedSchedules.map((s) => (
                  <ScheduleCard key={s.id} schedule={s} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-card bg-sand-100" />}>
      <SearchInner />
    </Suspense>
  );
}
