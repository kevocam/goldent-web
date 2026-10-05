'use client';

import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: 'min-h-11 px-3.5 text-sm',
  md: 'min-h-12 px-4 text-[15px]',
  lg: 'min-h-[52px] px-5 text-base',
};

export function Chip({ selected = false, size = 'md', className, type = 'button', ...props }: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={props.role ? undefined : selected}
      className={cn(
        'inline-flex cursor-pointer items-center gap-2 rounded-full border-[1.5px] transition-colors',
        selected ? 'border-gold-700 bg-gold-50 font-extrabold text-gold-900' : 'border-line bg-surface font-semibold text-ink hover:border-ink-subtle',
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
}

export interface ChipOption<T extends string> {
  value: T;
  label: string;
}

export interface ChipGroupProps<T extends string> {
  options: ChipOption<T>[];
  value: T | null;
  onChange: (value: T | null) => void;
  label: string;
  size?: ChipProps['size'];
  /** Permite deseleccionar tocando la opción activa. */
  allowEmpty?: boolean;
  className?: string;
}

/** Selección única con chips (role="radiogroup"). */
export function ChipGroup<T extends string>({ options, value, onChange, label, size, allowEmpty, className }: ChipGroupProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('flex flex-wrap gap-2.5', className)}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Chip
            key={o.value}
            role="radio"
            aria-checked={on}
            selected={on}
            size={size}
            onClick={() => onChange(on && allowEmpty ? null : o.value)}
          >
            {o.label}
          </Chip>
        );
      })}
    </div>
  );
}
