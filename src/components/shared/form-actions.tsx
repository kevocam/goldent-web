'use client';

import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

export interface FormActionsProps {
  onCancel: () => void;
  submitLabel: string;
  submitting?: boolean;
  disabled?: boolean;
  size?: 'md' | 'lg';
  /** id del <form> cuando los botones están fuera de él (encabezado). */
  form?: string;
  icon?: ReactNode;
  className?: string;
}

/** Cancelar + Guardar. Se deshabilita sin conexión (D-03). */
export function FormActions({ onCancel, submitLabel, submitting, disabled, size = 'md', form, icon, className }: FormActionsProps) {
  const online = useOnlineStatus();
  return (
    <div className={cn('flex gap-3', className)}>
      <Button variant="secondary" size={size} onClick={onCancel}>
        Cancelar
      </Button>
      <Button
        type="submit"
        form={form}
        size={size}
        loading={submitting}
        disabled={disabled || !online}
        className={size === 'lg' ? 'flex-1 md:min-w-[320px] md:flex-none' : undefined}
      >
        {submitting ? null : (icon ?? <Check className="size-5" aria-hidden />)}
        {submitLabel}
      </Button>
    </div>
  );
}
