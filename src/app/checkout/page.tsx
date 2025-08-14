"use client";
import { useCart } from '@/components/cart/CartContext';
import { useCartSession } from '@/components/cart/CartSessionContext';
import { formatIDR } from '@/lib/currency';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SessionGuard from '../_components/SessionGuard';

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const { phone: sessionPhone } = useCartSession();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', phone: sessionPhone || '', note: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionPhone) {
      setForm(f => f.phone ? f : { ...f, phone: sessionPhone });
    }
  }, [sessionPhone]);

  const disabled = !items.length || !form.name || !form.phone || loading;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.name,
            customerPhone: form.phone,
            note: form.note,
            items: items.map(it => ({ menuItemId: it.id, quantity: it.quantity }))
        })
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Gagal membuat pesanan');
      const data = await res.json();
      clear();
      router.replace(`/thank-you?id=${data.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(msg);
    } finally { setLoading(false); }
  }

  return (
    <SessionGuard>
      <main className="space-y-6">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        {!items.length && <p className="text-sm text-gray-500">Keranjang kosong.</p>}
        {items.length > 0 && (
          <form onSubmit={submit} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Nama</label>
              <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className="w-full border rounded px-3 py-2 text-sm" required />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Nomor Telepon</label>
              <input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} className="w-full border rounded px-3 py-2 text-sm" required />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Catatan (opsional)</label>
              <textarea value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} className="w-full border rounded px-3 py-2 text-sm" rows={3} />
            </div>
            <div className="space-y-2">
              <h2 className="font-medium">Ringkasan</h2>
              <ul className="text-sm space-y-1">
                {items.map(it => <li key={it.id}>{it.quantity}x {it.name} - {formatIDR(it.price * it.quantity)}</li>)}
              </ul>
              <div className="font-semibold pt-2">Total: {formatIDR(total)}</div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button disabled={disabled} className="bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-green-700 text-white rounded px-4 py-2 text-sm font-medium w-full">{loading ? 'Mengirim...' : 'Kirim Pesanan'}</button>
          </form>
        )}
      </main>
    </SessionGuard>
  );
}
