import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface PillProps {
  children: ReactNode;
  className?: string;
  /** Punto de color antes del texto (estados). */
  dot?: boolean;
  icon?: ReactNode;
  size?: 'sm' | 'md';
}

/** Base de AlertPill y StatusPill. Los colores llegan por className. */
export function Pill({ children, className, dot, icon, size = 'md' }: PillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-bold',
        size === 'md' ? 'min-h-7 px-2.5 text-[13px]' : 'min-h-[26px] px-2.5 text-xs',
        className,
      )}
    >
      {dot ? <span aria-hidden className="size-[7px] rounded-full bg-current" /> : null}
      {icon}
      {children}
    </span>
  );
}
