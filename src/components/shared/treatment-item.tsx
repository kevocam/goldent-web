'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { TREATMENT_STATUS, TREATMENT_STATUS_ORDER } from '@/lib/constants';
import { cn } from '@/lib/cn';
import type { TreatmentStatus } from '@/types/domain';
import { TreatmentStatusPill } from './status-pills';

export interface TreatmentItemProps {
  name: string;
  /** "Pieza 46", "Piezas 15, 24" o "General". */
  toothText: string;
  status: TreatmentStatus;
  notes?: string | null;
  onRemove?: () => void;
  /** Si se pasa, tocar la fila permite cambiar el estado. */
  onStatusChange?: (status: TreatmentStatus) => void;
  busy?: boolean;
  size?: 'md' | 'lg';
}

/** Fila gris: tratamiento · pieza · estado. Resumen, timeline y Nueva visita. */
export function TreatmentItem({ name, toothText, status, notes, onRemove, onStatusChange, busy, size = 'md' }: TreatmentItemProps) {
  const [editing, setEditing] = useState(false);
  const editable = Boolean(onStatusChange);

  const row = (
    <>
      <span className={cn('min-w-0 flex-1 font-bold', size === 'lg' ? 'text-base' : 'text-[15px]')}>
        {name}
        {notes ? <span className="mt-0.5 block text-[13px] font-medium text-ink-muted">{notes}</span> : null}
      </span>
      <span className="text-[13px] font-bold text-ink-muted md:text-sm">{toothText}</span>
      <TreatmentStatusPill status={status} />
    </>
  );

  return (
    <div className={cn('flex flex-col gap-2 rounded-[14px] bg-bg', onRemove ? 'py-2 pr-2 pl-4' : editable ? 'px-3.5 py-1' : 'px-3.5 py-2.5 md:py-3')}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        {editable ? (
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            aria-expanded={editing}
            aria-label={`${name}, ${toothText}, ${TREATMENT_STATUS[status].label}. Cambiar estado`}
            className="flex min-h-11 w-full min-w-0 flex-1 cursor-pointer flex-wrap items-center gap-x-3 gap-y-1.5 border-0 bg-transparent p-0 text-left text-ink"
          >
            {row}
          </button>
        ) : (
          row
        )}
        {onRemove ? (
          <Button variant="secondary" size="icon" aria-label={`Quitar ${name}`} onClick={onRemove}>
            <X className="size-5" aria-hidden />
          </Button>
        ) : null}
      </div>
      {editable && editing ? (
        <SegmentedControl
          label="Estado del tratamiento"
          stretch
          value={status}
          onChange={(s) => {
            onStatusChange?.(s);
            setEditing(false);
          }}
          options={TREATMENT_STATUS_ORDER.map((s) => ({ value: s, label: TREATMENT_STATUS[s].label }))}
          className={cn(busy && 'pointer-events-none opacity-60')}
        />
      ) : null}
    </div>
  );
}
