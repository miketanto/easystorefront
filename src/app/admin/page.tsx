"use client";
import { useEffect, useRef, useState } from 'react';
import { formatIDR } from '@/lib/currency';

interface OrderItem { id: string; nameSnapshot: string; quantity: number; lineTotal: number; }
interface Order { id: string; customerName: string; customerPhone: string; note: string | null; status: string; total: number; items: OrderItem[]; trackingLink?: string | null; }

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
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [query, setQuery] = useState('');
  const [updatingTracking, setUpdatingTracking] = useState<string | null>(null);
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

  async function fetchFiltered() {
    if (!adminKey) return;
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (query) params.set('q', query);
    const res = await fetch(`/api/orders/admin?${params.toString()}`, { headers: { 'x-admin-key': adminKey } });
    if (res.ok) {
      const data: Order[] = await res.json();
      setOrders(data);
    }
  }

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

  async function updateTracking(id: string, trackingLink: string | null) {
    if (!adminKey) return;
    const res = await fetch(`/api/orders/${id}/tracking`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ trackingLink: trackingLink || '' })
    });
    if (!res.ok) setError('Gagal update tracking link');
    setUpdatingTracking(null);
  }

  const visibleOrders = orders.filter(o => {
    if (statusFilter && o.status !== statusFilter) return false;
    if (query) {
      const ql = query.toLowerCase();
      if (!(`${o.customerName} ${o.customerPhone} ${o.id}`.toLowerCase().includes(ql))) return false;
    }
    return true;
  });

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin Orders</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-start">
        <div className="space-y-2 max-w-sm">
          <label className="text-sm font-medium">Admin Key</label>
          <input value={adminKey} onChange={e=>saveKey(e.target.value)} placeholder="Masukkan admin key" className="w-full border rounded px-3 py-2 text-sm" />
          <p className="text-xs text-gray-500">Key disimpan lokal (localStorage).</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Filter Status</label>
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="w-full border rounded px-3 py-2 text-sm">
            <option value="">Semua</option>
            {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Cari (nama / telepon / ID)</label>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ketik untuk cari" className="w-full border rounded px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <button type="button" onClick={fetchFiltered} className="text-xs px-3 py-1 rounded bg-blue-600 text-white">Apply</button>
            <button type="button" onClick={()=>{ setStatusFilter(''); setQuery(''); fetchFiltered(); }} className="text-xs px-3 py-1 rounded bg-gray-200">Reset</button>
          </div>
        </div>
      </div>
      {loading && <p className="text-sm text-gray-500">Memuat / terhubung...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="space-y-4">
        {visibleOrders.map(o => (
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
            {o.trackingLink && <div className="text-xs">Tracking: <a href={o.trackingLink} target="_blank" className="text-blue-600 underline break-all">{o.trackingLink}</a></div>}
            {o.status !== 'FULFILLED' && o.status !== 'CANCELED' && (
              <div className="pt-2 space-y-2">
                {updatingTracking === o.id ? (
                  <TrackingEditor
                    initial={o.trackingLink || ''}
                    onSave={(link)=>updateTracking(o.id, link || null)}
                    onCancel={()=>setUpdatingTracking(null)}
                  />
                ) : (
                  <button onClick={()=>setUpdatingTracking(o.id)} className="text-xs px-2 py-1 rounded border hover:bg-gray-100">{o.trackingLink ? 'Edit Tracking' : 'Tambah Tracking'}</button>
                )}
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              {STATUS_OPTS.map(s => (
                <button key={s} onClick={()=>updateStatus(o.id, s)} disabled={s===o.status} className={`text-xs px-2 py-1 rounded border ${s===o.status ? 'bg-gray-200 cursor-default' : 'hover:bg-gray-100'}`}>{s}</button>
              ))}
            </div>
          </div>
        ))}
        {!loading && !visibleOrders.length && !error && <p className="text-sm text-gray-500">Tidak ada order.</p>}
      </div>
    </main>
  );
}

function TrackingEditor({ initial, onSave, onCancel }: { initial: string; onSave: (v: string)=>void; onCancel: ()=>void }) {
  const [val, setVal] = useState(initial);
  return (
    <div className="flex flex-col gap-2">
      <input value={val} onChange={e=>setVal(e.target.value)} placeholder="https://..." className="w-full border rounded px-2 py-1 text-xs" />
      <div className="flex gap-2">
        <button onClick={()=>onSave(val.trim())} className="text-xs px-2 py-1 rounded bg-green-600 text-white">Simpan</button>
        <button onClick={onCancel} className="text-xs px-2 py-1 rounded border">Batal</button>
      </div>
    </div>
  );
}
