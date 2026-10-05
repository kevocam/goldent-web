import Link from 'next/link';
import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/cn';

export interface SectionCardProps {
  title: string;
  /** Texto gris junto al título (fecha). */
  meta?: ReactNode;
  /** Enlace a la derecha: "Ver todas", "Ver todos". */
  action?: { label: string; href: string };
  /** Contenido extra a la derecha del título (ej. etiqueta "Fase 2"). */
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Tarjeta con título de sección. Resumen de la ficha, Citas de hoy. */
export function SectionCard({ title, meta, action, aside, children, className }: SectionCardProps) {
  return (
    <Card as="article" className={cn('flex flex-col gap-3 p-4 md:px-[22px] md:py-5', className)}>
      <div className="flex items-center gap-2.5">
        <h2 className="m-0 text-[17px] font-extrabold md:text-lg">{title}</h2>
        <span className="flex-1 text-[13px] font-semibold text-ink-muted md:text-sm">{meta}</span>
        {aside}
        {action ? (
          <Link href={action.href} scroll={false} className="flex min-h-11 items-center px-1.5 text-[15px] font-bold no-underline">
            {action.label}
          </Link>
        ) : null}
      </div>
      {children}
    </Card>
  );
}
