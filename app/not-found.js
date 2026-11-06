import Link from "next/link";

export default function NotFound() {
  return (
    <main className="center-page">
      <h1>Էջը չկա</h1>
      <Link className="btn btn-solid" href="/">Գլխավոր</Link>
    </main>
  );
}
