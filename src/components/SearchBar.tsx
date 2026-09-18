"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar({
  placeholder = "이름, 전화번호, 주소로 검색",
  autoFocus = false,
  defaultValue = "",
}: {
  placeholder?: string;
  autoFocus?: boolean;
  defaultValue?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  function go(q: string) {
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className="relative">
      <input
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (e.target.value.trim().length >= 1) {
            go(e.target.value.trim());
          }
        }}
        placeholder={placeholder}
        className="w-full rounded-xl2 border border-sand-200 bg-paper px-4 py-3 pl-10 text-sm shadow-soft outline-none placeholder:text-muted focus:border-peach-400"
      />
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
        🔍
      </span>
    </div>
  );
}
