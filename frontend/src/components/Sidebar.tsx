import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-lg p-4">
      <h2 className="text-xl font-bold mb-6">Insights</h2>
      <nav className="flex flex-col gap-4">
        <Link href="/">Summary</Link>
        <Link href="/orders">Orders</Link>
        <Link href="/customers">Customers</Link>
        <Link href="/products">Products</Link>
        <Link href="/events">Events</Link>
      </nav>
    </aside>
  );
}
