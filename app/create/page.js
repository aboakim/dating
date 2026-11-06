import { Suspense } from "react";
import CreateApp from "./CreateApp";

export const metadata = { title: "Ստեղծել հրավեր — Ջերմ" };

export default function CreatePage() {
  return (
    <Suspense fallback={<main className="center-page">Բեռնում…</main>}>
      <CreateApp />
    </Suspense>
  );
}
