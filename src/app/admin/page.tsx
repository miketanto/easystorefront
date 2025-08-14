"use client";
import { useEffect, useRef, useState } from 'react';
import { formatIDR } from '@/lib/currency';

interface OrderItem { id: string; nameSnapshot: string; quantity: number; lineTotal: number; }
interface Order { id: string; customerName: string; customerPhone: string; note: string | null; status: string; total: number; items: OrderItem[]; }

const STATUS_OPTS = ['PENDING','CONFIRMED','FULFILLED','CANCELED'] as const;

type UpdateEvent =
  | { type: 'order_created'; data: Order }
  | { type: 'order_updated'; data: Order };

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string,string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    FULFILLED: 'bg-green-100 text-green-800',
    CANCELED: 'bg-red-100 text-red-700'
  };
  return <span className={`text-xs px-2 py-1 rounded font-medium ${colors[status] || 'bg-gray-200'}`}>{status}</span>;
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminKey, setAdminKey] = useState('');
  const evtRef = useRef<EventSource | null>(null);
  const retryRef = useRef<number>(0);

  // load saved key
  useEffect(() => {
    const k = localStorage.getItem('adminKey');
    if (k) setAdminKey(k);
  }, []);

  function saveKey(k: string) {
    setAdminKey(k);
    localStorage.setItem('adminKey', k);
  }

  // SSE connection lifecycle
  useEffect(() => {
    if (!adminKey) return;
    setLoading(true);
    setError(null);

    function connect() {
      if (evtRef.current) { evtRef.current.close(); }
      const es = new EventSource(`/api/orders/events?key=${encodeURIComponent(adminKey)}`);
      evtRef.current = es;

      es.addEventListener('open', () => { retryRef.current = 0; setLoading(false); });
      es.addEventListener('error', () => {
        setError('Terputus, mencoba sambung ulang...');
        setLoading(true);
        es.close();
        const retry = Math.min(10000, 500 * Math.pow(2, retryRef.current++));
        setTimeout(connect, retry);
      });

      es.addEventListener('snapshot', (e) => {
        try {
          const data: Order[] = JSON.parse((e as MessageEvent).data);
          setOrders(data);
          setError(null);
        } catch { /* ignore */ }
      });

      es.addEventListener('update', (e) => {
        try {
          const evt: UpdateEvent = JSON.parse((e as MessageEvent).data);
          setOrders(prev => {
            const existing = prev.find(o => o.id === evt.data.id);
            if (evt.type === 'order_created') {
              if (existing) return prev.map(o => o.id === evt.data.id ? evt.data : o);
              return [evt.data, ...prev];
            } else { // updated
              if (!existing) return [evt.data, ...prev];
              return prev.map(o => o.id === evt.data.id ? evt.data : o);
            }
          });
        } catch { /* ignore */ }
      });
    }

    connect();
    return () => { evtRef.current?.close(); };
  }, [adminKey]);

  async function updateStatus(id: string, status: string) {
    if (!adminKey) return;
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      setError('Gagal update status');
    }
    // No manual state change; rely on SSE update event
  }

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin Orders</h1>
      <div className="space-y-2 max-w-sm">
        <label className="text-sm font-medium">Admin Key</label>
        <input value={adminKey} onChange={e=>saveKey(e.target.value)} placeholder="Masukkan admin key" className="w-full border rounded px-3 py-2 text-sm" />
        <p className="text-xs text-gray-500">Key disimpan lokal (localStorage).</p>
      </div>
      {loading && <p className="text-sm text-gray-500">Memuat / terhubung...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="space-y-4">
        {orders.map(o => (
          <div key={o.id} className="border rounded p-4 bg-white space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div className="font-medium">#{o.id.slice(0,8)}</div>
              <StatusBadge status={o.status} />
            </div>
            <div className="text-sm">{o.customerName} ({o.customerPhone})</div>
            {o.note && <div className="text-xs text-gray-500">Catatan: {o.note}</div>}
            <ul className="mt-2 text-sm list-disc ml-5 space-y-1">
              {o.items.map(it => (
                <li key={it.id}>{it.quantity}x {it.nameSnapshot} - {formatIDR(it.lineTotal)}</li>
              ))}
            </ul>
            <div className="font-semibold">Total: {formatIDR(o.total)}</div>
            <div className="flex flex-wrap gap-2 pt-2">
              {STATUS_OPTS.map(s => (
                <button key={s} onClick={()=>updateStatus(o.id, s)} disabled={s===o.status} className={`text-xs px-2 py-1 rounded border ${s===o.status ? 'bg-gray-200 cursor-default' : 'hover:bg-gray-100'}`}>{s}</button>
              ))}
            </div>
          </div>
        ))}
        {!loading && !orders.length && !error && <p className="text-sm text-gray-500">Tidak ada order.</p>}
      </div>
    </main>
  );
}
