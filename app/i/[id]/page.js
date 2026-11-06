import GuestApp from "@/components/GuestApp";

export const metadata = { title: "Հրավեր — Ջերմ" };

export default function InvitePage({ params }) {
  return <GuestApp id={params.id} />;
}
