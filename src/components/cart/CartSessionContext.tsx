"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface CartSessionContextValue {
  sessionId: string | null;
  phone: string | null;
  start: (phone: string) => Promise<{ ok: boolean; error?: string }>; 
  clearSession: () => void;
  loaded: boolean;
}

const CartSessionContext = createContext<CartSessionContextValue>({
  sessionId: null,
  phone: null,
  start: async () => ({ ok: false }),
  clearSession: () => {},
  loaded: false
});

const LS_KEY = 'cartSession:v1';

export function CartSessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { sessionId: string; phone: string };
        if (parsed.sessionId && parsed.phone) {
          setSessionId(parsed.sessionId);
          setPhone(parsed.phone);
        }
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (sessionId && phone) {
      localStorage.setItem(LS_KEY, JSON.stringify({ sessionId, phone }));
    } else {
      localStorage.removeItem(LS_KEY);
    }
  }, [sessionId, phone]);

  async function start(p: string) {
    try {
      const res = await fetch('/api/cart-sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: p }) });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error || 'Gagal memulai sesi' };
      setSessionId(data.id);
      setPhone(data.phone);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Jaringan bermasalah' };
    }
  }

  function clearSession() {
    setSessionId(null);
    setPhone(null);
  }

  return <CartSessionContext.Provider value={{ sessionId, phone, start, clearSession, loaded }}>{children}</CartSessionContext.Provider>;
}

export function useCartSession() {
  return useContext(CartSessionContext);
}
