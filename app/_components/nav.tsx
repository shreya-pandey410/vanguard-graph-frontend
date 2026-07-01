import Link from "next/link";

export default function Nav() {
  return (
    <nav className="bg-black text-white px-6 py-4 flex gap-6">
      <Link href="/" className="font-bold">Vanguard Graph</Link>
      <Link href="/dashboard" className="hover:underline">Dashboard</Link>
      <Link href="/merchants/new" className="hover:underline">New Merchant</Link>
      <Link href="/alerts" className="hover:underline">Alerts</Link>
      <Link href="/settings" className="hover:underline">Settings</Link>
    </nav>
  );
}