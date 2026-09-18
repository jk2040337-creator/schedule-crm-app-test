"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { classNames } from "@/lib/utils";

const items = [
  { href: "/", label: "홈", icon: "🏠" },
  { href: "/schedules", label: "일정", icon: "📅" },
  { href: "/customers", label: "고객", icon: "👤" },
  { href: "/tools/hanger-estimate", label: "원가계산", icon: "🧮" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-sand-200 bg-paper/95 backdrop-blur px-2 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-2px_12px_rgba(58,52,46,0.06)]"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 0px)" }}
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {items.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={classNames(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors",
                active ? "text-peach-600" : "text-muted"
              )}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
