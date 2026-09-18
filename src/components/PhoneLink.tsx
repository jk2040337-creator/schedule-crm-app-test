import { toTelHref } from "@/lib/utils";

export default function PhoneLink({ phone }: { phone: string }) {
  if (!phone) return null;
  return (
    <a
      href={toTelHref(phone)}
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-500 active:bg-sky-100"
    >
      📞 {phone}
    </a>
  );
}
