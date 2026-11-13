"use client";

import Link from "next/link";
import FallingHearts from "@/components/FallingHearts";
import { useLanguage } from "@/components/LanguageProvider";

export default function NotFound() {
  const { dict } = useLanguage();
  return (
    <main className="center-page">
      <FallingHearts />
      <h1>{dict.common.notFound}</h1>
      <Link className="btn btn-solid" href="/">{dict.common.home}</Link>
    </main>
  );
}
