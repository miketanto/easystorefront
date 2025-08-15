"use client";
import { useEffect, useState, useCallback } from 'react';
import { formatIDR } from '@/lib/currency';

interface OrderItem { id: string; nameSnapshot: string; quantity: number; lineTotal: number; }
interface Order { id: string; total: number; items: OrderItem[]; status: string; trackingLink?: string | null; note?: string | null; }

export default function ThankYouClient({ id }: { id?: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) { setError('Tidak dapat memuat order'); setOrder(null); }
      else { setOrder(await res.json()); }
    } catch { setError('Gagal memuat detail'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Terima kasih!</h1>
      <p>Pesanan Anda telah diterima. Silakan tunggu konfirmasi.</p>
      <div className="flex items-center gap-3 flex-wrap text-sm">
        {id && <span className="text-gray-600">ID Pesanan: <span className="font-mono">{id}</span></span>}
        <button onClick={load} className="px-2 py-1 text-xs rounded border bg-white hover:bg-gray-100 disabled:opacity-50" disabled={loading}>{loading ? 'Memuat...' : 'Refresh'}</button>
      </div>
      {order && (
        <div className="space-y-3">
          <div className="space-y-2">
            <h2 className="font-medium">Ringkasan</h2>
            <ul className="text-sm list-disc ml-5 space-y-1">
              {order.items.map(it => <li key={it.id}>{it.quantity}x {it.nameSnapshot} - {formatIDR(it.lineTotal)}</li>)}
            </ul>
            <div className="font-semibold">Total: {formatIDR(order.total)}</div>
            <div className="text-sm">Status: <span className="font-medium">{order.status}</span></div>
            {order.note && <div className="text-xs text-gray-500">Catatan: {order.note}</div>}
          </div>
          {order.trackingLink && (
            <div className="p-3 rounded border bg-green-50 text-sm">
              <div className="font-medium mb-1">Link Tracking Pengantaran</div>
              <a href={order.trackingLink} target="_blank" className="text-green-700 underline break-all">{order.trackingLink}</a>
              <p className="text-xs text-gray-500 mt-1">Gunakan link ini untuk memantau pengiriman.</p>
            </div>
          )}
          {!order.trackingLink && <p className="text-xs text-gray-500">Link tracking akan muncul di sini setelah pengiriman diproses.</p>}
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </main>
  );
}
