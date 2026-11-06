import { Noto_Sans_Armenian } from "next/font/google";
import { RefCapture, SiteFooter, SiteHeader } from "@/components/SiteChrome";
import "./globals.css";

const armenian = Noto_Sans_Armenian({
  subsets: ["armenian"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap"
});

export const metadata = {
  title: "Ջերմ — առցանց հրավեր հանդիպման",
  description: "Ստեղծիր հայերեն հրավեր հանդիպման, ուղարկիր հղումը և տես պատասխանը քո էջում։ Երևան, Սևան, Գառնի և քո սեփական ծրագիրը։",
  openGraph: {
    title: "Ջերմ — առցանց հրավեր հանդիպման",
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
    <html lang="hy">
      <body className={armenian.className}>
        <RefCapture />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
