import { cn } from '@/lib/cn';

/** Diamante rosa con muela dorada (isotipo del diseño). */
export function LogoMark({ size = 52, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className={className}>
      <path d="M24 1.5 46.5 24 24 46.5 1.5 24Z" fill="#E8A6C4" />
      <path d="M24 1.5 33 24 24 46.5 15 24Z" fill="#F1C3D7" />
      <path d="M1.5 24h45" stroke="#FFFFFF" strokeOpacity=".55" strokeWidth=".8" />
      <path
        d="M16.5 17.6c0-3 2.8-4.3 7.5-3.3 4.7-1 7.5.3 7.5 3.3 0 3.8-1.6 5.6-2.1 9.2-.4 3-1 5.3-2.4 5.3-1.6 0-1.6-4.8-3-4.8s-1.4 4.8-3 4.8c-1.4 0-2-2.3-2.4-5.3-.5-3.6-2.1-5.4-2.1-9.2Z"
        fill="#C9962B"
        stroke="#8A6512"
        strokeWidth=".9"
      />
    </svg>
  );
}

/** Isotipo + "GOLDENT / CONSULTORIO ODONTOLÓGICO". */
export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn('flex items-center gap-3.5', className)}>
      <LogoMark size={compact ? 36 : 52} />
      <div className="flex flex-col gap-1">
        <span className={cn('leading-none font-extrabold tracking-[.14em] text-gold-700', compact ? 'text-lg' : 'text-[26px]')}>
          GOLDENT
        </span>
        {compact ? null : <span className="text-[11px] font-bold tracking-[.28em] text-ink-muted">CONSULTORIO ODONTOLÓGICO</span>}
      </div>
    </div>
  );
}
