import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/** tailwind-merge con los tokens propios para que "text-alert" no choque con "text-[13px]". */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      color: [
        'gold-25', 'gold-50', 'gold-100', 'gold-500', 'gold-700', 'gold-900',
        'pink-25', 'pink-50', 'pink-200', 'pink-300', 'pink-800',
        'ink', 'ink-muted', 'ink-subtle', 'bg', 'surface', 'surface-2',
        'line', 'line-card', 'line-soft', 'line-paper', 'paper', 'skeleton', 'toggle-off',
        'alert', 'alert-25', 'alert-50', 'alert-200', 'whatsapp', 'ok', 'ok-50', 'ok-700', 'warn', 'xray', 'xray-fg',
        'st-planned-bg', 'st-planned-fg', 'st-progress-bg', 'st-progress-fg', 'st-done-bg', 'st-done-fg',
        'ap-confirmed-bg', 'ap-confirmed-fg', 'ap-cancelled-bg', 'ap-noshow-bg', 'ap-noshow-fg',
      ],
    },
  },
});

/** Une clases condicionales y resuelve conflictos de Tailwind (la última gana). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
