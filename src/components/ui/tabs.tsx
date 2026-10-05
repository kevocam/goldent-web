import Link from 'next/link';
import { cn } from '@/lib/cn';

export interface TabItem {
  id: string;
  label: string;
  shortLabel?: string;
  count?: number;
}

export interface LinkTabsProps {
  tabs: TabItem[];
  value: string;
  hrefFor: (id: string) => string;
  label: string;
  className?: string;
}

/** Pestañas como enlaces (estado en la URL). Scroll horizontal en móvil. */
export function LinkTabs({ tabs, value, hrefFor, label, className }: LinkTabsProps) {
  return (
    <nav aria-label={label} className={cn('-mx-4 flex gap-0.5 overflow-x-auto whitespace-nowrap px-1.5 md:-mx-3.5 md:px-0', className)}>
      {tabs.map((t) => {
        const on = t.id === value;
        return (
          <Link
            key={t.id}
            href={hrefFor(t.id)}
            replace
            scroll={false}
            aria-current={on ? 'page' : undefined}
            className={cn(
              'flex min-h-[50px] items-center border-b-[3px] px-3 text-[15px] no-underline md:min-h-[54px] md:px-3.5 md:text-base',
              on ? 'border-gold-700 font-extrabold text-ink' : 'border-transparent font-semibold text-ink-muted hover:text-ink',
            )}
          >
            {t.shortLabel ? (
              <>
                <span className="md:hidden">{t.shortLabel}</span>
                <span className="hidden md:inline">{t.label}</span>
              </>
            ) : (
              t.label
            )}
            {t.count !== undefined ? <span className="ml-1.5 text-ink-muted">· {t.count}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}
