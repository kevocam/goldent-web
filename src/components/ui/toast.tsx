'use client';

import Link from 'next/link';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Check, CircleAlert } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface ToastInput {
  title: string;
  description?: string;
  action?: { label: string; href: string };
  tone?: 'success' | 'error';
}

interface ToastItem extends ToastInput {
  id: number;
}

const ToastContext = createContext<((t: ToastInput) => void) | null>(null);

/** Toast oscuro abajo al centro, 4 s (design/screens/13-estados.html). */
export function Toaster({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const toast = useCallback((t: ToastInput) => {
    const id = nextId.current++;
    setItems((prev) => [...prev.slice(-2), { ...t, id }]);
  }, []);

  const value = useMemo(() => toast, [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4 md:bottom-6">
        {items.map((t) => (
          <ToastView key={t.id} item={t} onDone={() => setItems((prev) => prev.filter((p) => p.id !== t.id))} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastView({ item, onDone }: { item: ToastItem; onDone: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDone, 4000);
    return () => clearTimeout(id);
  }, [onDone]);

  const error = item.tone === 'error';
  return (
    <div
      role="status"
      className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl bg-ink py-3.5 pr-3.5 pl-4 text-white shadow-[0_12px_30px_rgba(17,17,17,.25)]"
    >
      <span className={cn('flex size-[30px] shrink-0 items-center justify-center rounded-full', error ? 'bg-alert' : 'bg-ok')}>
        {error ? <CircleAlert className="size-[18px]" aria-hidden /> : <Check className="size-[18px]" aria-hidden />}
      </span>
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="text-[15px] font-extrabold">{item.title}</span>
        {item.description ? <span className="text-[13px] font-semibold text-line">{item.description}</span> : null}
      </span>
      {item.action ? (
        <Link href={item.action.href} className="flex min-h-11 items-center px-2 text-sm font-extrabold text-pink-200">
          {item.action.label}
        </Link>
      ) : null}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <Toaster>');
  return ctx;
}
