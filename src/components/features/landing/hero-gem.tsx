'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';

/**
 * Gema del hero: un octaedro (el diamante del logo en 3D) hecho de partículas,
 * dibujado en <canvas> con JS puro, sin librerías.
 *  · Al cargar, las partículas llegan desde todo el recuadro y arman la gema.
 *  · Gira sola; el cursor la inclina y empuja las partículas cercanas (vuelven con resorte).
 *  · Clic o toque: la gema estalla y se vuelve a armar.
 * Con "reducir movimiento" gira más lento y sin la entrada, pero sigue viva.
 * Se pausa fuera de pantalla y con la pestaña oculta.
 */

type Vec3 = [number, number, number];

const GOLD = [201, 150, 43] as const;
const PINK = [214, 128, 168] as const;

// Octaedro: punta arriba, punta abajo y cuatro vértices en el ecuador.
const V: Vec3[] = [
  [0, -1, 0],
  [0, 1, 0],
  [0.9, 0, 0],
  [0, 0, 0.9],
  [-0.9, 0, 0],
  [0, 0, -0.9],
];
const EDGES: [number, number][] = [
  [0, 2], [0, 3], [0, 4], [0, 5],
  [1, 2], [1, 3], [1, 4], [1, 5],
  [2, 3], [3, 4], [4, 5], [5, 2],
];
const PER_EDGE = 26;
const DUST = 46;

interface Particle {
  /** Posición base en la gema (3D) o, para el polvo, ángulo/radio/altura de órbita. */
  base: Vec3;
  dust: boolean;
  edge: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  z: number;
  phase: number;
  size: number;
}

const rgba = (c: readonly number[], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`;
const mix = (a: readonly number[], b: readonly number[], t: number) => a.map((v, i) => v + (b[i]! - v) * t);

export function HeroGem({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!wrap || !canvas || !ctx) return;

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hero = wrap.closest<HTMLElement>('.gd-hero');

    let size = 0;
    let dpr = 1;
    let raf = 0;
    let running = false;
    let visible = true;
    let last = performance.now();
    let t = 0;

    let spin = 0; // ángulo Y
    let spinBoost = 0; // giro extra tras un clic
    const tilt = { x: 0, y: 0, tx: 0, ty: 0 }; // inclinación por el cursor
    const pointer = { x: -9999, y: -9999, inside: false };

    // ---- partículas
    const particles: Particle[] = [];
    EDGES.forEach(([a, b], edge) => {
      for (let i = 0; i < PER_EDGE; i++) {
        const k = i / (PER_EDGE - 1);
        const pa = V[a]!;
        const pb = V[b]!;
        particles.push({
          base: [pa[0] + (pb[0] - pa[0]) * k, pa[1] + (pb[1] - pa[1]) * k, pa[2] + (pb[2] - pa[2]) * k],
          dust: false,
          edge,
          x: 0, y: 0, vx: 0, vy: 0, z: 0,
          phase: Math.random() * Math.PI * 2,
          size: 1.8 + Math.random() * 1.4,
        });
      }
    });
    for (let i = 0; i < DUST; i++) {
      particles.push({
        base: [Math.random() * Math.PI * 2, 1.18 + Math.random() * 0.32, (Math.random() - 0.5) * 1.1],
        dust: true,
        edge: -1,
        x: 0, y: 0, vx: 0, vy: 0, z: 0,
        phase: Math.random() * Math.PI * 2,
        size: 0.8 + Math.random() * 1.4,
      });
    }

    const scatter = () => {
      for (const p of particles) {
        p.x = Math.random() * size;
        p.y = Math.random() * size;
        p.vx = p.vy = 0;
      }
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const first = size === 0;
      size = Math.max(1, Math.round(rect.width));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = canvas.style.height = `${size}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (first) {
        if (reduced) {
          step(0); // aparece ya armada
          for (const p of particles) {
            const target = project(p);
            p.x = target.x;
            p.y = target.y;
          }
        } else {
          scatter();
        }
      }
    };

    // ---- 3D → 2D
    const project = (p: Particle) => {
      let x: number, y: number, z: number;
      if (p.dust) {
        const ang = p.base[0] + t * 0.25;
        x = Math.cos(ang) * p.base[1];
        z = Math.sin(ang) * p.base[1];
        y = p.base[2] + Math.sin(t * 0.8 + p.phase) * 0.05;
      } else {
        [x, y, z] = p.base;
        // respiración suave de la gema
        const breathe = 1 + Math.sin(t * 1.4) * 0.025;
        x *= breathe; y *= breathe; z *= breathe;
      }
      // giro Y (spin + cursor) e inclinación X (fija + cursor)
      const ry = spin + tilt.y;
      const cy = Math.cos(ry), sy = Math.sin(ry);
      [x, z] = [x * cy + z * sy, -x * sy + z * cy];
      const rx = 0.28 + tilt.x;
      const cx = Math.cos(rx), sx = Math.sin(rx);
      [y, z] = [y * cx - z * sx, y * sx + z * cx];

      const persp = 3.4 / (3.4 + z);
      const scale = size * 0.34;
      return { x: size / 2 + x * scale * persp, y: size / 2 + y * scale * persp, z };
    };

    // ---- simulación
    const step = (dt: number) => {
      t += dt;
      spinBoost *= Math.pow(0.04, dt);
      spin += dt * ((reduced ? 0.16 : 0.42) + spinBoost);
      tilt.x += (tilt.tx - tilt.x) * Math.min(1, dt * 4);
      tilt.y += (tilt.ty - tilt.y) * Math.min(1, dt * 4);
    };

    const physics = (dt: number) => {
      const k = Math.min(1, dt * 60);
      const radius = size * 0.2;
      for (const p of particles) {
        const target = project(p);
        p.z = target.z;
        // resorte hacia su lugar en la gema
        p.vx += (target.x - p.x) * 0.055 * k;
        p.vy += (target.y - p.y) * 0.055 * k;
        // el cursor empuja
        if (pointer.inside) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d = Math.hypot(dx, dy);
          if (d < radius && d > 0.01) {
            const f = (1 - d / radius) ** 2 * 7 * k;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }
        }
        const damp = Math.pow(0.84, k);
        p.vx *= damp;
        p.vy *= damp;
        p.x += p.vx * k;
        p.y += p.vy * k;
      }
    };

    // ---- dibujo
    const draw = () => {
      ctx.clearRect(0, 0, size, size);

      // brillo central
      const glow = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size * 0.42);
      glow.addColorStop(0, 'rgba(255,255,255,0.65)');
      glow.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, size, size);

      // aristas: una línea elástica que pasa por las partículas de cada arista
      ctx.lineWidth = 1.4;
      for (let e = 0; e < EDGES.length; e++) {
        const start = e * PER_EDGE;
        let zSum = 0;
        ctx.beginPath();
        for (let i = 0; i < PER_EDGE; i++) {
          const p = particles[start + i]!;
          zSum += p.z;
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        const front = Math.max(0, Math.min(1, 0.5 - zSum / PER_EDGE / 1.8));
        ctx.strokeStyle = rgba(mix(PINK, GOLD, front), 0.25 + front * 0.5);
        ctx.stroke();
      }

      // partículas (de atrás hacia adelante)
      const order = particles.slice().sort((a, b) => b.z - a.z);
      for (const p of order) {
        const front = Math.max(0, Math.min(1, 0.5 - p.z / 1.8));
        const twinkle = (Math.sin(t * 2.2 + p.phase * 3) + 1) / 2;
        const r = p.size * (0.7 + front * 0.7) * (p.dust ? 0.8 : 1);
        const color = mix(PINK, GOLD, p.dust ? twinkle * 0.6 : front);
        ctx.fillStyle = rgba(color, (p.dust ? 0.35 + twinkle * 0.45 : 0.45 + front * 0.55));
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();

        // destello en forma de estrella, de vez en cuando
        if (!p.dust && front > 0.6 && Math.sin(t * 1.3 + p.phase * 7) > 0.985) {
          const s = 7 + front * 5;
          ctx.fillStyle = rgba(GOLD, 0.95);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - s);
          ctx.quadraticCurveTo(p.x, p.y, p.x + s, p.y);
          ctx.quadraticCurveTo(p.x, p.y, p.x, p.y + s);
          ctx.quadraticCurveTo(p.x, p.y, p.x - s, p.y);
          ctx.quadraticCurveTo(p.x, p.y, p.x, p.y - s);
          ctx.fill();
        }
      }
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      step(dt);
      physics(dt);
      draw();
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running || !visible || document.hidden) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // ---- interacción
    let heroRaf = 0;
    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.inside = pointer.x > -40 && pointer.y > -40 && pointer.x < rect.width + 40 && pointer.y < rect.height + 40;
      // inclinación según dónde esté el cursor en la ventana
      tilt.ty = (e.clientX / window.innerWidth - 0.5) * 0.9;
      tilt.tx = (e.clientY / window.innerHeight - 0.5) * -0.5;
      // halo CSS del fondo
      if (hero && !heroRaf) {
        heroRaf = requestAnimationFrame(() => {
          heroRaf = 0;
          const hr = hero.getBoundingClientRect();
          hero.style.setProperty('--mx', `${e.clientX - hr.left}px`);
          hero.style.setProperty('--my', `${e.clientY - hr.top}px`);
        });
      }
    };
    const onPointerLeave = () => {
      pointer.inside = false;
      tilt.tx = tilt.ty = 0;
    };
    const burst = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const ox = e.clientX - rect.left;
      const oy = e.clientY - rect.top;
      for (const p of particles) {
        const dx = p.x - ox;
        const dy = p.y - oy;
        const d = Math.hypot(dx, dy) || 1;
        const power = (18 + Math.random() * 26) * (size / 480);
        const jitter = (Math.random() - 0.5) * 0.9;
        p.vx += (dx / d + jitter) * power;
        p.vy += (dy / d - jitter) * power;
      }
      spinBoost = 9;
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (visible) start();
      else stop();
    });
    const ro = new ResizeObserver(resize);
    const onVisibility = () => (document.hidden ? stop() : start());

    resize();
    ro.observe(wrap);
    io.observe(wrap);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
    canvas.addEventListener('pointerdown', burst);
    document.addEventListener('visibilitychange', onVisibility);
    start();

    return () => {
      stop();
      cancelAnimationFrame(heroRaf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('pointerdown', burst);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <div ref={wrapRef} className={cn('relative aspect-square w-[min(100%,540px)]', className)}>
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 block cursor-pointer touch-pan-y" />
    </div>
  );
}
