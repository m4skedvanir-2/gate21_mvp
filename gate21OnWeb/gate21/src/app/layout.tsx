import type { Metadata } from "next";
import { Syne, JetBrains_Mono, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["300", "400", "500", "600"],
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "GATE21",
  description: "Secure Asset Management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" data-theme="dark">
      <body className={`${syne.variable} ${jetbrainsMono.variable} ${notoSansJP.variable}`}>
        {children}
      </body>
    </html>
  );
}