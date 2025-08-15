"use client";
import { useSearchParams } from 'next/navigation';
import ThankYouClient from './ThankYouClient';

export default function ThankYouShell() {
  const sp = useSearchParams();
  const id = sp.get('id') || undefined;
  return <ThankYouClient id={id} />;
}
