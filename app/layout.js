import { Comfortaa, Noto_Sans, Noto_Sans_Armenian } from "next/font/google";
import { LanguageProvider } from "@/components/LanguageProvider";
import { RefCapture, SiteFooter, SiteHeader } from "@/components/SiteChrome";
import "./globals.css";

const armenian = Noto_Sans_Armenian({
  subsets: ["armenian"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-hy"
});

const body = Noto_Sans({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-body"
});

const display = Comfortaa({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-display"
});

export const metadata = {
  title: "DateMe — առցանց հրավեր հանդիպման",
  description: "Ստեղծիր հայերեն հրավեր հանդիպման, ուղարկիր հղումը և տես պատասխանը քո էջում կամ Telegram բոտում։",
  openGraph: {
    title: "DateMe — առցանց հրավեր հանդիպման",
    description: "Հրավեր հանդիպման հղումով։ Հայաստանի համար։",
    locale: "hy_AM",
    type: "website"
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }) {
  return (
    <html lang="hy" className={`${armenian.variable} ${body.variable} ${display.variable}`}>
      <body className={`${body.className} ${armenian.className}`}>
        <LanguageProvider>
          <RefCapture />
          <SiteHeader />
          {children}
          <SiteFooter />
        </LanguageProvider>
      </body>
    </html>
  );
}
