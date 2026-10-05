'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { signOut } from '@/lib/actions/auth';
import { cn } from '@/lib/cn';

/** Avatar "Dra" → menú con cerrar sesión. */
export function UserMenu({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Cuenta y cerrar sesión"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex cursor-pointer items-center justify-center rounded-full border-0 bg-pink-50 font-extrabold text-pink-800',
          size === 'md' ? 'size-12 text-[13px]' : 'size-11 text-xs',
        )}
      >
        Dra
      </button>
      {open ? (
        <div
          className={cn(
            'absolute z-40 w-60 rounded-2xl border border-line-card bg-surface p-2 shadow-[0_12px_30px_rgba(17,17,17,.12)]',
            size === 'md' ? 'bottom-0 left-[60px]' : 'top-[52px] right-0',
          )}
        >
          <p className="m-0 px-3 pt-2 pb-3 text-sm font-bold text-ink-muted">{name}</p>
          <form action={signOut}>
            <button
              type="submit"
              className="flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-xl border-0 bg-transparent px-3 text-left text-base font-bold text-ink hover:bg-bg"
            >
              <LogOut className="size-5" aria-hidden />
              Cerrar sesión
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
