"use client";

import Link from "next/link";
import InviteExperience from "@/components/InviteExperience";
import { SAMPLE_INVITE } from "@/lib/catalog";

export default function PreviewPage() {
  return (
    <main className="guest-page">
      <div className="preview-banner">
        <span>Սա օրինակ է։ Պատասխանը չի պահվում։</span>
        <Link href="/create">Ստեղծել քոնը</Link>
      </div>
      <InviteExperience invite={SAMPLE_INVITE} mode="preview" />
    </main>
  );
}
