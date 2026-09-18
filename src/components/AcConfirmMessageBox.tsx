"use client";

import { useState } from "react";
import { buildAcConfirmMessage } from "@/lib/utils";
import type { Schedule } from "@/lib/types";

export default function AcConfirmMessageBox({ schedule }: { schedule: Schedule }) {
  const [unitCount, setUnitCount] = useState("1");
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const message = buildAcConfirmMessage({
    datetime: schedule.datetime,
    address: schedule.address,
    unitCount,
    amount: schedule.estimateAmount,
  });

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 접근 실패 시 조용히 무시 (아래 textarea에서 직접 복사 가능)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl2 border border-sky-200 bg-sky-50 py-2.5 text-sm font-semibold text-sky-600 active:bg-sky-100"
      >
        📩 예약확정 문자 문구 만들기
      </button>
    );
  }

  return (
    <div className="rounded-xl2 border border-sky-200 bg-sky-50 p-3">
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-muted">대수</span>
        <input
          value={unitCount}
          onChange={(e) => setUnitCount(e.target.value)}
          className="mb-2 w-20 rounded-lg border border-sand-200 bg-white px-2 py-1 text-sm"
        />
      </label>
      <textarea
        readOnly
        value={message}
        rows={12}
        className="w-full rounded-lg border border-sand-200 bg-white p-2 text-xs leading-relaxed"
      />
      <div className="mt-2 flex gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 rounded-xl2 bg-sky-500 py-2 text-sm font-semibold text-white active:bg-sky-400"
        >
          {copied ? "복사됨 ✓" : "문구 복사하기"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded-xl2 border border-sand-200 px-3 py-2 text-sm text-muted"
        >
          닫기
        </button>
      </div>
      <p className="mt-2 text-[11px] text-muted">
        복사한 문구를 문자·카카오톡 앱에 붙여넣어 사장님이 직접 보내주세요. (자동 발송 아님)
      </p>
    </div>
  );
}
