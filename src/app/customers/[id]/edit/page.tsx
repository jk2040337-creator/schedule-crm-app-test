"use client";

import { useEffect, useState } from "react";
import CustomerForm from "@/components/CustomerForm";
import type { Customer } from "@/lib/types";

export default function EditCustomerPage({
  params,
}: {
  params: { id: string };
}) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/customers/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setCustomer(data.customer);
      })
      .catch((e) => setError(e.message));
  }, [params.id]);

  if (error) {
    return <p className="rounded-xl2 bg-red-50 p-3 text-sm text-red-500">{error}</p>;
  }
  if (!customer) {
    return <div className="h-40 animate-pulse rounded-card bg-sand-100" />;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">고객 정보 수정</h1>
      <CustomerForm initial={customer} customerId={customer.id} />
    </div>
  );
}
