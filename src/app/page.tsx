import { prisma } from '@/lib/prisma';
import { MenuList } from '@/components/MenuList';
import { CartSummary } from '@/components/cart/CartSummary';

export default async function Home() {
  const items = await prisma.menuItem.findMany({ where: { isAvailable: true }, orderBy: { name: 'asc' } });
  return (
    <main className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Menu</h1>
        <p className="text-sm text-gray-600">Silakan pilih makanan & minuman.</p>
      </header>
      <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
        <MenuList items={items} />
        <aside className="space-y-4">
          <h2 className="text-lg font-semibold">Keranjang</h2>
          <CartSummary />
        </aside>
      </div>
    </main>
  );
}
