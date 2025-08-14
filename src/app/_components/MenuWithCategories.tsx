"use client";
import { useState, useMemo } from 'react';
import { useCart } from '@/components/cart/CartContext';
import { formatIDR } from '@/lib/currency';
import { CartSummary } from '@/components/cart/CartSummary';

interface Item { id: string; name: string; description: string | null; price: number; category: string | null; }
export default function MenuWithCategories({ items }: { items: Item[] }) {
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => set.add(i.category || 'Lainnya'));
    return Array.from(set).sort();
  }, [items]);
  const [active, setActive] = useState<string>(categories[0] || '');
  const { add } = useCart();
  const filtered = items.filter(i => (i.category || 'Lainnya') === active);

  return (
    <main className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Menu</h1>
        <p className="text-sm text-gray-600">Silakan pilih makanan & minuman.</p>
      </header>
      <div className="overflow-x-auto -mx-4 px-4 pb-2">
        <div className="flex gap-3 min-w-max">
          {categories.map(c => (
            <button key={c} onClick={()=>setActive(c)} className={`px-4 py-2 rounded-full border text-sm whitespace-nowrap transition-colors ${c===active ? 'bg-green-600 text-white border-green-600' : 'bg-white hover:bg-gray-100'}`}>{c}</button>
          ))}
        </div>
      </div>
      <div className="grid gap-8 md:grid-cols-[2fr_1fr] items-start">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map(item => (
              <div key={item.id} className="border rounded-lg p-4 bg-white shadow-sm flex flex-col justify-between">
                <div>
                  <div className="font-medium">{item.name}</div>
                  {item.description && <div className="text-sm text-gray-500 mb-2">{item.description}</div>}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-semibold">{formatIDR(item.price)}</span>
                  <button onClick={() => add({ id: item.id, name: item.name, price: item.price })} className="text-sm px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700">Tambah</button>
                </div>
              </div>
            ))}
            {!filtered.length && <p className="text-sm text-gray-500 col-span-full">Tidak ada item.</p>}
          </div>
        </div>
        <aside className="space-y-4 sticky top-4 self-start">
          <h2 className="text-lg font-semibold">Keranjang</h2>
          <CartSummary />
        </aside>
      </div>
    </main>
  );
}
