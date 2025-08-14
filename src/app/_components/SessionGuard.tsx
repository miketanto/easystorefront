"use client";
import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCartSession } from '@/components/cart/CartSessionContext';

export default function SessionGuard({ children }: { children: ReactNode }) {
  const { sessionId, loaded } = useCartSession();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (!loaded) return; // wait for localStorage load
    if (!sessionId && path !== '/start') {
      router.replace('/start');
    }
  }, [sessionId, loaded, path, router]);

  if (!loaded) return <div className="p-6 text-sm text-gray-500">Memuat sesi...</div>;
  if (!sessionId && path !== '/start') return <div className="p-6 text-sm text-gray-500">Mengalihkan...</div>;
  return <>{children}</>;
}
