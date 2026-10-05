'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/cn';

export const THEME_KEY = 'gd-theme';

/**
 * Corre antes de pintar (script inline en la landing): aplica el tema guardado
 * para que no parpadee. Sin preferencia guardada, manda el sistema (CSS).
 */
export const themeInitScript = `try{var t=localStorage.getItem('${THEME_KEY}');if(t==='dark'||t==='light')document.currentScript.parentElement.dataset.theme=t}catch(e){}`;

function landingEl(): HTMLElement | null {
  return document.querySelector('.landing');
}

function resolvedTheme(): 'light' | 'dark' {
  const forced = landingEl()?.dataset.theme;
  if (forced === 'dark' || forced === 'light') return forced;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Sol / luna en el encabezado. Guarda la elección en este navegador. */
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);

  useEffect(() => {
    // Si se llegó navegando dentro de la app, el script inline no corrió: aplicar lo guardado.
    try {
      const saved = localStorage.getItem(THEME_KEY);
      const el = landingEl();
      if (el && (saved === 'dark' || saved === 'light')) el.dataset.theme = saved;
    } catch {
      // sin almacenamiento: manda el sistema
    }
    setTheme(resolvedTheme());
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setTheme(resolvedTheme());
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggle = () => {
    const next = resolvedTheme() === 'dark' ? 'light' : 'dark';
    const el = landingEl();
    if (el) el.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Navegación privada: el cambio vale solo para esta visita.
    }
    setTheme(next);
  };

  const dark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={dark ? 'Modo claro' : 'Modo oscuro'}
      className={cn(
        'flex size-12 cursor-pointer items-center justify-center rounded-[14px] border-[1.5px] border-line bg-surface text-ink transition-colors hover:border-ink-subtle',
        className,
      )}
    >
      {dark ? <Sun className="size-5" aria-hidden /> : <Moon className="size-5" aria-hidden />}
    </button>
  );
}
