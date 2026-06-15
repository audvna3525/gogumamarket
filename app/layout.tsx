import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "고구마마켓 — 우리 동네 중고 직거래",
  description:
    "믿을 수 있는 우리 동네 이웃과 함께하는 따뜻한 중고 직거래 마켓, 고구마마켓.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
