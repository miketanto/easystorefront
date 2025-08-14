"use client";
import { useState, useMemo, useEffect, useCallback } from 'react';
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
  const { add, items: cartItems } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const filtered = items.filter(i => (i.category || 'Lainnya') === active);

  // Close drawer on ESC
  const handleKey = useCallback((e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false); }, []);
  useEffect(() => { if (drawerOpen) { window.addEventListener('keydown', handleKey); } else { window.removeEventListener('keydown', handleKey); } return () => window.removeEventListener('keydown', handleKey); }, [drawerOpen, handleKey]);

  // Prevent body scroll when drawer open on mobile
  useEffect(() => { if (drawerOpen) { document.body.style.overflow = 'hidden'; } else { document.body.style.overflow = ''; } }, [drawerOpen]);

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
        {/* Desktop static sidebar */}
        <aside className="space-y-4 sticky top-4 self-start hidden md:block">
          <h2 className="text-lg font-semibold">Keranjang</h2>
            <CartSummary />
        </aside>
      </div>

      {/* Mobile floating button */}
      <button
        aria-label="Buka keranjang"
        onClick={() => setDrawerOpen(true)}
        className="md:hidden fixed bottom-4 right-4 z-40 shadow-lg rounded-full bg-green-600 text-white px-5 py-3 font-medium flex items-center gap-2"
      >
        <span>Keranjang</span>
        {cartItems.length > 0 && (
          <span className="inline-flex items-center justify-center text-xs bg-white text-green-700 rounded-full min-w-5 h-5 px-1 font-semibold">{cartItems.length}</span>
        )}
      </button>

      {/* Drawer / overlay for mobile */}
      {drawerOpen && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
            className="fixed inset-y-0 right-0 w-80 max-w-[85%] bg-white shadow-xl z-50 flex flex-col animate-slide-in"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 id="cart-drawer-title" className="text-lg font-semibold">Keranjang</h2>
              <button aria-label="Tutup keranjang" onClick={() => setDrawerOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <CartSummary />
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`
        @keyframes slide-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slide-in { animation: slide-in 0.25s ease-out; }
      `}</style>
    </main>
  );
}
