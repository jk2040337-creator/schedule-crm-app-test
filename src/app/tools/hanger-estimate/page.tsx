"use client";

import { useMemo, useState } from "react";
import { formatWon, hangerMaterialCost, mmToJa } from "@/lib/utils";

interface Line {
  id: number;
  mm: string;
  label: string;
}

let nextId = 1;

export default function HangerEstimatePage() {
  const [lines, setLines] = useState<Line[]>([{ id: nextId++, mm: "", label: "" }]);
  const [laborCost, setLaborCost] = useState("");

  const rows = lines.map((line) => {
    const mm = Number(line.mm) || 0;
    const ja = mmToJa(mm);
    const cost = hangerMaterialCost(mm);
    return { ...line, ja, cost };
  });

  const materialTotal = useMemo(
    () => rows.reduce((sum, r) => sum + r.cost, 0),
    [rows]
  );
  const labor = Number(laborCost.replace(/[^0-9]/g, "")) || 0;
  const total = materialTotal + labor;

  function updateLine(id: number, patch: Partial<Line>) {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function addLine() {
    setLines((prev) => [...prev, { id: nextId++, mm: "", label: "" }]);
  }

  function removeLine(id: number) {
    setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev));
  }

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs text-muted">시스템행거 전용</p>
        <h1 className="mt-1 text-xl font-bold">원가 계산기</h1>
        <p className="mt-1 text-xs text-muted">
          공식: 자재원가 = (실측길이mm ÷ 300) × 26,000원, 자 환산값은 소수점 둘째 자리에서
          반올림합니다.
        </p>
      </header>

      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="rounded-card bg-paper p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <input
                value={row.label}
                onChange={(e) => updateLine(row.id, { label: e.target.value })}
                placeholder="구간명 (예: 거실)"
                className="input flex-1"
              />
              <button
                onClick={() => removeLine(row.id)}
                className="rounded-xl2 px-2 py-1 text-xs text-red-500"
              >
                삭제
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                inputMode="numeric"
                value={row.mm}
                onChange={(e) => updateLine(row.id, { mm: e.target.value })}
                placeholder="실측길이(mm)"
                className="input flex-1"
              />
              <span className="whitespace-nowrap text-xs text-muted">
                = {row.ja.toFixed(1)}자
              </span>
            </div>
            <p className="mt-2 text-right text-sm font-semibold text-peach-600">
              {formatWon(row.cost)}
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={addLine}
        className="w-full rounded-xl2 border border-dashed border-sand-200 py-2.5 text-sm font-semibold text-muted active:bg-sand-50"
      >
        + 구간 추가
      </button>

      <div className="rounded-card bg-sand-50 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">자재원가 합계</span>
          <span className="font-semibold">{formatWon(materialTotal)}</span>
        </div>
        <label className="mt-3 block">
          <span className="mb-1 block text-xs font-semibold text-muted">시공비 (직접입력)</span>
          <input
            inputMode="numeric"
            value={laborCost}
            onChange={(e) => setLaborCost(e.target.value)}
            placeholder="예: 100000"
            className="input"
          />
        </label>
        <div className="mt-3 flex items-center justify-between border-t border-sand-200 pt-3">
          <span className="text-sm font-semibold">견적 합계</span>
          <span className="text-lg font-bold text-peach-600">{formatWon(total)}</span>
        </div>
      </div>

      <p className="text-xs text-muted">
        계산된 견적 합계는 일정 등록·수정 화면의 &quot;견적금액&quot;에 직접 입력해 반영하세요.
      </p>

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
    </div>
  );
}
