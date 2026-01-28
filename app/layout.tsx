import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TranslationProvider } from "@/i18n/context";
import { getLocale } from "@/i18n/server";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Event Manager - B2B Event Management Platform",
  description: "Create and manage events, sell tickets, and grow your business",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <TranslationProvider>
          {children}
        </TranslationProvider>
      </body>
    </html>
  );
}
