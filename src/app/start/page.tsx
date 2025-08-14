"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartSession } from '@/components/cart/CartSessionContext';

export default function StartSessionPage() {
  const { start, sessionId } = useCartSession();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!phone) return;
    setLoading(true);
    const res = await start(phone);
    setLoading(false);
    if (!res.ok) {
      setError(res.error || 'Gagal');
    } else {
      router.replace('/');
    }
  }

  return (
    <main className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Mulai Belanja</h1>
      <p className="text-sm text-gray-600">Masukkan nomor telepon untuk memulai sesi keranjang Anda.</p>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Nomor Telepon</label>
          <input value={phone} onChange={e=>setPhone(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" required placeholder="08xxxx" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading || !phone} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded px-4 py-2 text-sm font-medium w-full">{loading ? 'Memulai...' : (sessionId ? 'Lanjutkan' : 'Mulai')}</button>
      </form>
    </main>
  );
}
