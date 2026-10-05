'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { NAV_ITEMS } from './nav-items';

/** Móvil (< 768 px): barra inferior. */
export function BottomNav() {
  const path = usePathname();
  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line-card bg-surface px-2 pt-1.5 pb-[max(14px,env(safe-area-inset-bottom))] md:hidden"
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon, match }) => {
        const on = match(path);
        return (
          <Link
            key={href}
            href={href}
            aria-current={on ? 'page' : undefined}
            className={cn(
              'flex min-h-[60px] flex-1 flex-col items-center justify-center gap-1 text-xs font-bold no-underline',
              on ? 'text-gold-900' : 'text-ink-muted',
            )}
          >
            <span className={cn('flex h-[30px] w-14 items-center justify-center rounded-[15px]', on && 'bg-gold-50')}>
              <Icon className="size-[22px]" aria-hidden />
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
