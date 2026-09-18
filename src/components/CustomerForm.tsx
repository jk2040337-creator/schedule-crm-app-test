"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CUSTOMER_STATUSES, SERVICE_TYPES } from "@/lib/types";
import type { Customer } from "@/lib/types";

export default function CustomerForm({
  initial,
  customerId,
}: {
  initial?: Partial<Customer>;
  customerId?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    phone: initial?.phone ?? "",
    address: initial?.address ?? "",
    serviceType: initial?.serviceType ?? SERVICE_TYPES[0],
    memo: initial?.memo ?? "",
    status: initial?.status ?? "가망",
    lastServiceDate: initial?.lastServiceDate ?? "",
    reminderIntervalYears: initial?.reminderIntervalYears ?? "2",
  });
  const isAc = form.serviceType === "에어컨청소";
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError("이름과 전화번호는 꼭 입력해주세요.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const url = customerId ? `/api/customers/${customerId}` : "/api/customers";
      const method = customerId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "저장에 실패했어요.");
      const id = customerId ?? data.customer.id;
      router.push(`/customers/${id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="이름 *">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="홍길동"
          className="input"
        />
      </Field>
      <Field label="전화번호 *">
        <input
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="010-1234-5678"
          inputMode="tel"
          className="input"
        />
      </Field>
      <Field label="주소">
        <input
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          placeholder="부산광역시 해운대구 ..."
          className="input"
        />
      </Field>
      <Field label="시공 종류">
        <select
          value={form.serviceType}
          onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
          className="input"
        >
          {SERVICE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </Field>
      <Field label="고객 상태">
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          className="input"
        >
          {CUSTOMER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </Field>
      {isAc && (
        <>
          <Field label="마지막 청소일 (재방문 알림 기준)">
            <input
              type="date"
              value={form.lastServiceDate}
              onChange={(e) => setForm({ ...form, lastServiceDate: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="재방문 주기">
            <select
              value={form.reminderIntervalYears}
              onChange={(e) =>
                setForm({ ...form, reminderIntervalYears: e.target.value })
              }
              className="input"
            >
              <option value="2">2년 (기본, 제조사 권장)</option>
              <option value="1">1년 (신생아·곰팡이 관리 등)</option>
            </select>
          </Field>
        </>
      )}
      <Field label="메모">
        <textarea
          value={form.memo}
          onChange={(e) => setForm({ ...form, memo: e.target.value })}
          placeholder="예: 반려동물 있음, 오전 방문 선호"
          rows={3}
          className="input resize-none"
        />
      </Field>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl2 bg-peach-500 py-3 text-sm font-semibold text-white shadow-card active:bg-peach-600 disabled:opacity-60"
      >
        {saving ? "저장 중..." : "저장하기"}
      </button>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.875rem;
          border: 1px solid #e2d2b8;
          background: #fff;
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
          outline: none;
        }
        .input:focus {
          border-color: #ffa35c;
        }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted">{label}</span>
      {children}
    </label>
  );
}
