import GuestApp from "@/components/GuestApp";

export const metadata = { title: "Հրավեր — DateMe" };

export default function InvitePage({ params }) {
  return <GuestApp id={params.id} />;
}
