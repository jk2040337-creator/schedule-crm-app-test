import { toKakaoMapHref } from "@/lib/utils";

export default function AddressLink({ address }: { address: string }) {
  if (!address) return null;
  return (
    <a
      href={toKakaoMapHref(address)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1.5 rounded-full bg-sage-50 px-3 py-1.5 text-sm font-medium text-sage-500 active:bg-sage-100"
    >
      📍 {address}
    </a>
  );
}
