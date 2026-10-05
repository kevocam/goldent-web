import Link from 'next/link';
import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/cn';

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="-ml-1.5 inline-flex min-h-11 max-w-full items-center gap-1 self-start truncate text-[15px] font-bold text-ink-muted no-underline hover:text-ink"
    >
      <ChevronLeft className="size-5 shrink-0" aria-hidden />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  back?: { href: string; label: string };
  actions?: ReactNode;
  /** Contenido debajo del título (alertas, pestañas). */
  children?: ReactNode;
  /** "bar": franja blanca con borde (formularios, ficha). "plain": sobre el fondo (Inicio, Captura). */
  variant?: 'bar' | 'plain';
  className?: string;
}

export function PageHeader({ title, subtitle, back, actions, children, variant = 'bar', className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col gap-2',
        variant === 'bar' ? 'border-b border-line-card bg-surface px-4 pt-3 pb-4 md:px-8' : 'px-4 pt-5 md:px-8 md:pt-7',
        className,
      )}
    >
      {back ? <BackLink {...back} /> : null}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h1 className="m-0 text-[24px] font-extrabold tracking-[-.02em] md:text-[26px]">{title}</h1>
          {subtitle ? <span className="text-sm font-semibold text-ink-muted">{subtitle}</span> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2.5">{actions}</div> : null}
      </div>
      {children}
    </header>
  );
}
