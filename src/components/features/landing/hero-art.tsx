'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { cn } from '@/lib/cn';

const OUTLINE = 'M24 1.5 46.5 24 24 46.5 1.5 24Z';
const FACET = 'M24 1.5 33 24 24 46.5 15 24Z';
const GIRDLE = 'M1.5 24h45';

const depth = (px: number) => ({ '--depth': px }) as CSSProperties;

/** Destellos pequeños: posición (%), tamaño (px) y desfase de la animación. */
const SPARKLES = [
  { top: '14%', left: '18%', size: 14, delay: '0s' },
  { top: '72%', left: '10%', size: 10, delay: '1.1s' },
  { top: '22%', left: '84%', size: 12, delay: '2s' },
  { top: '84%', left: '74%', size: 16, delay: '.6s' },
];

/**
 * Arte del hero: diamantes que flotan, se balancean y tienen un destello que recorre
 * el borde (CSS), más un parallax suave que sigue al mouse (React + rAF, sin librerías).
 * Sin parallax en pantallas táctiles ni con "reducir movimiento".
 */
export function HeroArt({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia('(pointer: fine)').matches) return;

    let raf = 0;
    let target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };

    const tick = () => {
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;
      el.style.setProperty('--px', current.x.toFixed(4));
      el.style.setProperty('--py', current.y.toFixed(4));
      const moving = Math.abs(target.x - current.x) + Math.abs(target.y - current.y) > 0.0005;
      raf = moving ? requestAnimationFrame(tick) : 0;
    };
    const onMove = (e: PointerEvent) => {
      target = { x: e.clientX / window.innerWidth - 0.5, y: e.clientY / window.innerHeight - 0.5 };
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onLeave = () => {
      target = { x: 0, y: 0 };
      if (!raf) raf = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className={cn('pointer-events-none relative aspect-square w-[min(100%,520px)] select-none', className)}>
      {/* Halo */}
      <div className="gd-layer absolute inset-[8%]" style={depth(-18)}>
        <div className="gd-breathe size-full rounded-full bg-[radial-gradient(circle,var(--color-pink-200)_0%,transparent_68%)] opacity-70" />
      </div>

      {/* Diamante lleno, atrás */}
      <div className="gd-layer absolute inset-[22%]" style={depth(14)}>
        <svg viewBox="0 0 48 48" className="gd-float-slow size-full overflow-visible">
          <defs>
            <linearGradient id="gd-fill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="var(--color-pink-200)" stopOpacity=".9" />
              <stop offset="1" stopColor="var(--color-pink-50)" stopOpacity=".4" />
            </linearGradient>
          </defs>
          <path d={OUTLINE} fill="url(#gd-fill)" />
          <path d={FACET} fill="var(--color-surface)" fillOpacity=".35" />
        </svg>
      </div>

      {/* Diamante de líneas, adelante: flota, se balancea y tiene destello */}
      <div className="gd-layer absolute inset-[4%]" style={depth(34)}>
        <svg viewBox="0 0 48 48" className="gd-float size-full overflow-visible">
          <g className="gd-sway">
            <path d={OUTLINE} fill="none" stroke="var(--color-pink-300)" strokeWidth=".22" />
            <path d={FACET} fill="none" stroke="var(--color-pink-300)" strokeWidth=".18" />
            <path d={GIRDLE} stroke="var(--color-pink-300)" strokeWidth=".18" />
            <path d="M15 24 24 46.5 33 24" fill="none" stroke="var(--color-pink-300)" strokeWidth=".12" strokeOpacity=".7" />
            <path
              d={OUTLINE}
              className="gd-glint"
              fill="none"
              stroke="var(--color-gold-500)"
              strokeWidth=".45"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray="10 90"
            />
          </g>
        </svg>
      </div>

      {/* Anillo de diamantes pequeños que gira muy lento */}
      <div className="gd-layer absolute inset-0" style={depth(22)}>
        <svg viewBox="0 0 100 100" className="size-full overflow-visible">
          <g className="gd-spin">
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <path
                key={a}
                d="M50 2 52 5 50 8 48 5Z"
                fill={a % 120 === 0 ? 'var(--color-gold-500)' : 'var(--color-pink-300)'}
                opacity=".8"
                transform={`rotate(${a} 50 50)`}
              />
            ))}
          </g>
        </svg>
      </div>

      {/* Destellos */}
      {SPARKLES.map((s) => (
        <span key={s.top + s.left} className="gd-layer absolute" style={{ top: s.top, left: s.left, ...depth(46) }}>
          <svg viewBox="0 0 24 24" width={s.size} height={s.size} className="gd-twinkle block" style={{ animationDelay: s.delay }}>
            <path d="M12 0 14.5 9.5 24 12 14.5 14.5 12 24 9.5 14.5 0 12 9.5 9.5Z" fill="var(--color-gold-500)" />
          </svg>
        </span>
      ))}
    </div>
  );
}
