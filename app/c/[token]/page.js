import CreatorApp from "@/components/CreatorApp";

export const metadata = { title: "Իմ հրավերը — DateMe" };

export default function CreatorPage({ params }) {
  return <CreatorApp token={params.token} />;
}
