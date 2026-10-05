'use client';

import { useState } from 'react';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Chip } from '@/components/ui/chip';
import { PERMANENT_ARCHES, TEMPORARY_ARCHES, isTemporaryTooth, teethLabel } from '@/lib/teeth';
import { cn } from '@/lib/cn';

export interface ToothPickerProps {
  value: string[];
  onChange: (teeth: string[]) => void;
  wholeMouth: boolean;
  onWholeMouthChange: (wholeMouth: boolean) => void;
  /** Muestra error si el servicio requiere pieza y no hay ninguna. */
  error?: string;
}

/**
 * Cuadrícula FDI por arcada (no es odontograma). Selección múltiple.
 * Base del odontograma de fases futuras.
 */
export function ToothPicker({ value, onChange, wholeMouth, onWholeMouthChange, error }: ToothPickerProps) {
  const [dentition, setDentition] = useState<'perm' | 'temp'>(value[0] && isTemporaryTooth(value[0]) ? 'temp' : 'perm');
  const arches = dentition === 'perm' ? PERMANENT_ARCHES : TEMPORARY_ARCHES;

  const toggle = (tooth: string) => {
    onWholeMouthChange(false);
    onChange(value.includes(tooth) ? value.filter((t) => t !== tooth) : [...value, tooth]);
  };

  const toothButton = (tooth: string) => {
    const on = value.includes(tooth);
    return (
      <button
        key={tooth}
        type="button"
        aria-pressed={on}
        aria-label={`Pieza ${tooth}`}
        onClick={() => toggle(tooth)}
        className={cn(
          'tabular size-10 shrink-0 cursor-pointer rounded-[10px] border-[1.5px] text-sm font-extrabold sm:size-11 lg:size-[52px] lg:rounded-xl lg:text-base',
          on ? 'border-gold-700 bg-gold-700 text-white' : 'border-line bg-surface text-ink',
        )}
      >
        {tooth}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <SegmentedControl
          label="Dentición"
          value={dentition}
          onChange={(d) => {
            setDentition(d);
            onChange([]);
          }}
          options={[
            { value: 'perm', label: 'Permanente' },
            { value: 'temp', label: 'Temporal' },
          ]}
        />
      </div>

      <div className={cn('flex flex-col items-center gap-2 overflow-x-auto rounded-2xl bg-bg px-2.5 py-3.5', wholeMouth && 'opacity-50')}>
        {arches.map((arch) => (
          <div key={arch.label} role="group" aria-label={`Arcada ${arch.label.toLowerCase()}`} className="flex items-center gap-1.5 lg:gap-2.5">
            <div className="flex gap-1 lg:gap-[5px]">{arch.right.map(toothButton)}</div>
            <span aria-hidden className="h-10 w-0.5 shrink-0 rounded-[1px] bg-gold-500" />
            <div className="flex gap-1 lg:gap-[5px]">{arch.left.map(toothButton)}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Chip
          selected={wholeMouth}
          onClick={() => {
            onChange([]);
            onWholeMouthChange(!wholeMouth);
          }}
        >
          Sin pieza específica (boca completa)
        </Chip>
        <span className={cn('text-[15px] font-semibold', error ? 'text-alert' : 'text-ink-muted')} aria-live="polite">
          {error ?? teethLabel(value, wholeMouth)}
        </span>
      </div>
    </div>
  );
}
