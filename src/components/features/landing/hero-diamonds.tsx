import { cn } from '@/lib/cn';

const OUTLINE = 'M24 1.5 46.5 24 24 46.5 1.5 24Z';
const FACET = 'M24 1.5 33 24 24 46.5 15 24Z';

/**
 * Diamantes de fondo del hero: flotan y se inclinan apenas, y un destello dorado
 * recorre el borde. Solo CSS (globals.css · gd-*), sin librerías ni JS.
 */
export function HeroDiamonds({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <svg viewBox="0 0 48 48" className="gd-float absolute -top-[150px] -right-[260px] size-[820px] overflow-visible max-md:-top-[120px] max-md:-right-[300px] max-md:size-[560px]">
        <g className="gd-sway" opacity=".55">
          <path d={OUTLINE} fill="none" stroke="var(--color-pink-300)" strokeWidth=".12" />
          <path d={FACET} fill="none" stroke="var(--color-pink-300)" strokeWidth=".12" />
          <path d="M1.5 24h45" stroke="var(--color-pink-300)" strokeWidth=".12" />
          <path
            d={OUTLINE}
            className="gd-glint"
            fill="none"
            stroke="var(--color-gold-500)"
            strokeWidth=".18"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="6 94"
          />
        </g>
      </svg>
      <svg viewBox="0 0 48 48" className="gd-float-reverse absolute -bottom-[110px] -left-[90px] size-[300px] overflow-visible">
        <g opacity=".45">
          <path d={OUTLINE} fill="none" stroke="var(--color-pink-300)" strokeWidth=".3" />
          <path d={FACET} fill="none" stroke="var(--color-pink-300)" strokeWidth=".3" />
        </g>
      </svg>
    </div>
  );
}
