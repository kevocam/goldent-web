'use client';

import { cn } from '@/lib/cn';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  size?: 'md' | 'lg';
  /** Ocupa todo el ancho repartiendo las opciones. */
  stretch?: boolean;
  className?: string;
}

/** Permanente/Temporal, Día/Semana, estado del tratamiento. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  size = 'md',
  stretch,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('inline-flex gap-1 rounded-2xl bg-surface-2 p-1', stretch && 'flex w-full', className)}
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={cn(
              'cursor-pointer rounded-xl border-0 px-4 transition-colors',
              size === 'lg' ? 'min-h-[52px] text-[15px]' : 'min-h-11 text-sm',
              stretch && 'flex-1 px-2',
              on ? 'bg-surface font-extrabold text-ink shadow-[0_1px_3px_rgba(17,17,17,.14)]' : 'bg-transparent font-bold text-ink-muted',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
