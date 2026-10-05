import { TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/cn';

export function AlertPill({ label, icon, size = 'md', truncate }: { label: string; icon?: boolean; size?: 'sm' | 'md' | 'lg'; truncate?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 rounded-full border border-alert-200 bg-alert-50 font-bold whitespace-nowrap text-alert',
        truncate && 'overflow-hidden [&>span]:truncate',
        size === 'sm' && 'min-h-7 px-2.5 text-xs',
        size === 'md' && 'min-h-8 px-3 text-[13px]',
        size === 'lg' && 'min-h-[34px] px-3.5 text-sm',
      )}
    >
      {icon ? <TriangleAlert className="size-4 shrink-0" aria-hidden /> : null}
      <span>{label}</span>
    </span>
  );
}

export interface MedicalAlertsProps {
  alerts: string[];
  /**
   * Una sola píldora (filas de lista, como el diseño): hasta 2 alertas cortas unidas
   * con " · "; si no caben, "N alertas". El detalle completo queda en el title.
   */
  compact?: boolean;
  /** Muestra el rótulo "ALERTAS MÉDICAS" antes (encabezado de ficha). */
  withHeading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/** Antecedentes activos como píldoras rojas. Siempre visibles bajo el nombre. */
export function MedicalAlerts({ alerts, compact, withHeading, size = 'md', className }: MedicalAlertsProps) {
  if (alerts.length === 0) return null;

  if (compact) {
    const joined = alerts.join(' · ');
    const label = alerts.length > 2 || joined.length > 24 ? `${alerts.length} alertas` : joined;
    return (
      <span className={cn('min-w-0 shrink', className)} title={alerts.join(' · ')}>
        <AlertPill label={label} icon size={size} truncate />
      </span>
    );
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)} aria-label="Alertas médicas">
      {withHeading ? (
        <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-extrabold tracking-[.08em] text-alert uppercase">
          <TriangleAlert className="size-4" aria-hidden />
          Alertas médicas
        </span>
      ) : null}
      {alerts.map((a, i) => (
        <AlertPill key={a} label={a} size={size} icon={!withHeading && i === 0} />
      ))}
    </div>
  );
}
