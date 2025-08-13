"use client";
import { useCart } from './cart/CartContext';
import { formatIDR } from '@/lib/currency';

interface MenuItem { id: string; name: string; description: string | null; price: number; }
export function MenuList({ items }: { items: MenuItem[] }) {
  const { add } = useCart();
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map(item => (
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
    </div>
  );
}
