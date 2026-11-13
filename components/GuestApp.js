"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import InviteExperience from "@/components/InviteExperience";
import FallingHearts from "@/components/FallingHearts";
import { useLanguage } from "@/components/LanguageProvider";

export default function GuestApp({ id }) {
  const { dict } = useLanguage();
  const [invite, setInvite] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let stop = false;
    fetch(`/api/invites/${id}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed");
        if (!stop) setInvite(data);
      })
      .catch((err) => {
        if (!stop) setError(err.message);
      });
    return () => {
      stop = true;
    };
  }, [id]);

  if (error) {
    return (
      <main className="center-page">
        <FallingHearts />
        <h1>{error}</h1>
        <Link className="btn btn-solid" href="/create">{dict.common.createNew}</Link>
      </main>
    );
  }
  if (!invite) return <main className="center-page">{dict.common.loading}</main>;
  return (
    <main className="guest-page">
      <InviteExperience
        invite={invite}
        mode="live"
        onEvent={(event) => {
          if (event.type === "unlock") return;
          fetch(`/api/invites/${id}/event`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(event)
          }).catch(() => {});
        }}
      />
    </main>
  );
}
