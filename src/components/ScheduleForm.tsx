"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CONTRACT_SERVICE_TYPES, SERVICE_TYPES } from "@/lib/types";
import type { Customer, Schedule } from "@/lib/types";
import { isoToLocalInput, localInputToIso } from "@/lib/utils";

export default function ScheduleForm({
  initial,
  scheduleId,
  defaultCustomerId,
}: {
  initial?: Partial<Schedule>;
  scheduleId?: string;
  defaultCustomerId?: string;
}) {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState({
    customerId: initial?.customerId ?? defaultCustomerId ?? "",
    datetime: isoToLocalInput(initial?.datetime ?? ""),
    serviceType: initial?.serviceType ?? "",
    address: initial?.address ?? "",
    status: initial?.status ?? "예정",
    memo: initial?.memo ?? "",
    photoUrls: initial?.photoUrls ?? "",
    estimateAmount: initial?.estimateAmount ?? "",
    warrantyUntil: initial?.warrantyUntil ?? "",
    contractFileUrl: initial?.contractFileUrl ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isContractType = CONTRACT_SERVICE_TYPES.includes(form.serviceType as any);

  useEffect(() => {
    fetch("/api/customers")
      .then((res) => res.json())
      .then((data) => setCustomers(data.customers ?? []));
  }, []);

  // 고객 선택 시 주소/시공종류 자동 채움 (신규 등록이고 아직 비어있을 때만)
  useEffect(() => {
    if (scheduleId) return;
    const c = customers.find((c) => c.id === form.customerId);
    if (c) {
      setForm((f) => ({
        ...f,
        address: f.address || c.address,
        serviceType: f.serviceType || c.serviceType,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.customerId, customers]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customerId || !form.datetime) {
      setError("고객과 방문 일시는 꼭 선택해주세요.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const url = scheduleId ? `/api/schedules/${scheduleId}` : "/api/schedules";
      const method = scheduleId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          datetime: localInputToIso(form.datetime),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "저장에 실패했어요.");
      const id = scheduleId ?? data.schedule.id;
      router.push(`/schedules/${id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="고객 *">
        <select
          value={form.customerId}
          onChange={(e) => setForm({ ...form, customerId: e.target.value })}
          className="input"
          disabled={Boolean(scheduleId)}
        >
          <option value="">고객을 선택하세요</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.phone})
            </option>
          ))}
        </select>
        {customers.length === 0 && (
          <p className="mt-1 text-xs text-muted">
            등록된 고객이 없어요.{" "}
            <a href="/customers/new" className="text-peach-500 underline">
              고객을 먼저 등록
            </a>
            해주세요.
          </p>
        )}
      </Field>

      <Field label="방문 일시 *">
        <input
          type="datetime-local"
          value={form.datetime}
          onChange={(e) => setForm({ ...form, datetime: e.target.value })}
          className="input"
        />
      </Field>

      <Field label="시공 종류">
        <select
          value={form.serviceType}
          onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
          className="input"
        >
          <option value="">선택 안 함</option>
          {SERVICE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </Field>

      <Field label="장소">
        <input
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          placeholder="고객 주소가 자동으로 채워집니다"
          className="input"
        />
      </Field>

      {scheduleId && (
        <Field label="상태">
          <select
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as Schedule["status"] })
            }
            className="input"
          >
            <option value="예정">예정</option>
            <option value="완료">완료</option>
            <option value="취소">취소</option>
          </select>
        </Field>
      )}

      <Field label="메모">
        <textarea
          value={form.memo}
          onChange={(e) => setForm({ ...form, memo: e.target.value })}
          rows={3}
          placeholder="예: 부품 A/S 포함"
          className="input resize-none"
        />
      </Field>

      <Field label="견적금액">
        <input
          value={form.estimateAmount}
          onChange={(e) => setForm({ ...form, estimateAmount: e.target.value })}
          placeholder="예: 150,000원"
          className="input"
        />
        {form.serviceType === "시스템행거" && (
          <p className="mt-1 text-xs text-muted">
            <a href="/tools/hanger-estimate" target="_blank" className="text-peach-500 underline">
              원가 계산기 열기
            </a>
            에서 자재원가를 계산해보고 시공비를 더해 입력하세요.
          </p>
        )}
      </Field>

      <Field label="시공 전·후 사진 링크">
        <input
          value={form.photoUrls}
          onChange={(e) => setForm({ ...form, photoUrls: e.target.value })}
          placeholder="구글 드라이브 공유 링크 (여러 개는 쉼표로 구분)"
          className="input"
        />
      </Field>

      <Field label="A/S·하자보증 만료일">
        <input
          type="date"
          value={form.warrantyUntil}
          onChange={(e) => setForm({ ...form, warrantyUntil: e.target.value })}
          className="input"
        />
      </Field>

      {isContractType && (
        <Field label="계약서·도면 링크">
          <input
            value={form.contractFileUrl}
            onChange={(e) => setForm({ ...form, contractFileUrl: e.target.value })}
            placeholder="구글 드라이브 계약서/도면 공유 링크"
            className="input"
          />
        </Field>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl2 bg-peach-500 py-3 text-sm font-semibold text-white shadow-card active:bg-peach-600 disabled:opacity-60"
      >
        {saving ? "저장 중..." : "저장하고 캘린더에 등록"}
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
        .input:disabled {
          opacity: 0.6;
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
