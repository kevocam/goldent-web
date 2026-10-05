'use client';

import { useEffect, useRef, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { CONDITION_PLACEHOLDERS } from '@/lib/constants';

export interface ConditionToggleProps {
  code: string;
  label: string;
  active: boolean;
  detail: string;
  onActiveChange: (active: boolean) => void;
  onDetailChange: (detail: string) => void;
}

/** Antecedente: interruptor Sí/No; al activarlo aparece el campo de detalle. */
export function ConditionToggle({ code, label, active, detail, onActiveChange, onDetailChange }: ConditionToggleProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  // Solo se enfoca cuando la doctora lo activa, no al cargar un paciente que ya lo tenía.
  const [justActivated, setJustActivated] = useState(false);

  useEffect(() => {
    if (justActivated && active) {
      inputRef.current?.focus();
      setJustActivated(false);
    }
  }, [justActivated, active]);

  return (
    <div className="flex flex-col gap-2 border-t border-line-soft py-2">
      <div className="flex min-h-14 items-center gap-4">
        <span className="flex-1 text-[17px] font-bold">{label}</span>
        <Switch
          checked={active}
          onChange={(next) => {
            onActiveChange(next);
            setJustActivated(next);
          }}
          label={label}
          tone="alert"
        />
      </div>
      {active ? (
        <Input
          ref={inputRef}
          aria-label={`Detalle: ${label}`}
          placeholder={CONDITION_PLACEHOLDERS[code] ?? 'Detalle'}
          value={detail}
          onChange={(e) => onDetailChange(e.target.value)}
          className="mb-1.5"
        />
      ) : null}
    </div>
  );
}
