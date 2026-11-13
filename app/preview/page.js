"use client";

import Link from "next/link";
import InviteExperience from "@/components/InviteExperience";
import { useLanguage } from "@/components/LanguageProvider";
import { sampleInvite } from "@/lib/catalog";

export default function PreviewPage() {
  const { dict, locale } = useLanguage();
  return (
    <main className="guest-page">
      <div className="preview-banner">
        <span>{dict.preview.banner}</span>
        <Link href="/create">{dict.preview.makeYours}</Link>
      </div>
      <InviteExperience invite={sampleInvite(locale)} mode="preview" />
    </main>
  );
}
