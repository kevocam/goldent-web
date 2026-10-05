'use client';

import { cn } from '@/lib/cn';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  onLabel?: string;
  offLabel?: string;
  /** "alert": el "Sí" se muestra en rojo (antecedentes médicos). */
  tone?: 'alert' | 'default';
  disabled?: boolean;
}

export function Switch({ checked, onChange, label, onLabel = 'Sí', offLabel = 'No', tone = 'default', disabled }: SwitchProps) {
  return (
    <span className="flex items-center gap-4">
      <span
        aria-hidden
        className={cn('w-6 text-right text-[15px] font-extrabold', checked && tone === 'alert' ? 'text-alert' : 'text-ink-muted')}
      >
        {checked ? onLabel : offLabel}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'flex h-10 w-[68px] shrink-0 cursor-pointer rounded-[20px] border-0 p-1 transition-colors disabled:opacity-50',
          checked ? 'justify-end bg-gold-700' : 'justify-start bg-toggle-off',
        )}
      >
        <span className="size-8 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,.25)]" />
      </button>
    </span>
  );
}
