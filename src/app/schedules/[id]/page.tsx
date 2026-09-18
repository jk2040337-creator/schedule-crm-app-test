"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PhoneLink from "@/components/PhoneLink";
import AddressLink from "@/components/AddressLink";
import StatusBadge from "@/components/StatusBadge";
import AcConfirmMessageBox from "@/components/AcConfirmMessageBox";
import type { Customer, Schedule } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export default function ScheduleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/schedules/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          setSchedule(data.schedule);
          setCustomer(data.customer);
        }
      })
      .catch((e) => setError(e.message));
  }, [params.id]);

  async function handleDelete() {
    if (!confirm("이 일정을 삭제할까요? 연동된 구글 캘린더 일정도 함께 삭제됩니다.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/schedules/${params.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("삭제에 실패했어요.");
      router.push("/schedules");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  }

  async function handleMarkDone() {
    setBusy(true);
    try {
      const res = await fetch(`/api/schedules/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "완료" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "변경에 실패했어요.");
      setSchedule(data.schedule);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (error) {
    return <p className="rounded-xl2 bg-red-50 p-3 text-sm text-red-500">{error}</p>;
  }
  if (!schedule) {
    return <div className="h-40 animate-pulse rounded-card bg-sand-100" />;
  }

  return (
    <div className="space-y-5">
      <div className="rounded-card bg-paper p-5 shadow-card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted">{formatDateTime(schedule.datetime)}</p>
            <h1 className="mt-1 text-xl font-bold">{customer?.name ?? "고객 정보 없음"}</h1>
            <p className="mt-0.5 text-xs text-muted">{schedule.serviceType}</p>
          </div>
          <StatusBadge status={schedule.status} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {customer && <PhoneLink phone={customer.phone} />}
          <AddressLink address={schedule.address} />
        </div>

        {schedule.memo && (
          <p className="mt-4 whitespace-pre-wrap rounded-xl2 bg-sand-50 p-3 text-sm text-ink">
            {schedule.memo}
          </p>
        )}

        {schedule.estimateAmount && (
          <p className="mt-3 text-sm">
            💰 견적금액: <span className="font-semibold">{schedule.estimateAmount}</span>
          </p>
        )}

        {schedule.photoUrls && (
          <p className="mt-2 text-sm">
            📷 시공 사진:{" "}
            {schedule.photoUrls.split(",").map((url, i) => (
              <a
                key={i}
                href={url.trim()}
                target="_blank"
                rel="noreferrer"
                className="text-peach-500 underline"
              >
                {i === 0 ? "보기" : `보기${i + 1}`}
              </a>
            ))}
          </p>
        )}

        {schedule.contractFileUrl && (
          <p className="mt-2 text-sm">
            📄 계약서·도면:{" "}
            <a
              href={schedule.contractFileUrl}
              target="_blank"
              rel="noreferrer"
              className="text-peach-500 underline"
            >
              열기
            </a>
          </p>
        )}

        {schedule.warrantyUntil && (
          <p className="mt-2 text-sm">
            🛡️ A/S·하자보증: <span className="font-semibold">{schedule.warrantyUntil}</span>까지
          </p>
        )}

        <p className="mt-3 text-xs text-muted">
          {schedule.googleEventId ? "✅ 구글 캘린더에 등록됨" : "⚠️ 구글 캘린더 연동 안 됨"}
        </p>
      </div>

      {schedule.serviceType === "에어컨청소" && (
        <AcConfirmMessageBox schedule={schedule} />
      )}

      <div className="flex flex-wrap gap-2">
        {customer && (
          <Link
            href={`/customers/${customer.id}`}
            className="rounded-xl2 border border-sand-200 px-4 py-2.5 text-sm font-semibold text-muted active:bg-sand-50"
          >
            고객 상세
          </Link>
        )}
        <Link
          href={`/schedules/${schedule.id}/edit`}
          className="rounded-xl2 border border-sand-200 px-4 py-2.5 text-sm font-semibold text-muted active:bg-sand-50"
        >
          수정
        </Link>
        {schedule.status === "예정" && (
          <button
            onClick={handleMarkDone}
            disabled={busy}
            className="rounded-xl2 bg-sage-500 px-4 py-2.5 text-sm font-semibold text-white active:bg-sage-400 disabled:opacity-60"
          >
            완료 처리
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={busy}
          className="ml-auto rounded-xl2 px-4 py-2.5 text-sm font-semibold text-red-500 active:bg-red-50 disabled:opacity-60"
        >
          삭제
        </button>
      </div>
    </div>
  );
}
