import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "일정관리 · 고객관리",
  description: "시공 일정과 고객 정보를 한 화면에서 관리하는 개인용 웹앱",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-cream font-sans text-ink antialiased">
        <div className="mx-auto max-w-lg px-4 pb-24 pt-6">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}
