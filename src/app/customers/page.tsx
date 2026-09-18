"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CustomerCard from "@/components/CustomerCard";
import SearchBar from "@/components/SearchBar";
import type { Customer } from "@/lib/types";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/customers")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setCustomers(data.customers);
      })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">고객</h1>
        <Link
          href="/customers/new"
          className="rounded-full bg-peach-500 px-4 py-2 text-sm font-semibold text-white active:bg-peach-600"
        >
          + 등록
        </Link>
      </div>

      <SearchBar placeholder="고객명, 전화번호, 주소로 검색" />

      {error && (
        <p className="rounded-xl2 bg-red-50 p-3 text-sm text-red-500">
          데이터를 불러오지 못했어요: {error}
        </p>
      )}

      {customers === null ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-card bg-sand-100" />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <div className="rounded-card border border-dashed border-sand-200 bg-paper/60 p-8 text-center text-sm text-muted">
          아직 등록된 고객이 없어요.
          <br />
          우측 상단의 + 등록 버튼으로 첫 고객을 추가해보세요.
        </div>
      ) : (
        <div className="space-y-2">
          {customers.map((c) => (
            <CustomerCard key={c.id} customer={c} />
          ))}
        </div>
      )}
    </div>
  );
}
