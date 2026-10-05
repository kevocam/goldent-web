'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Chip } from '@/components/ui/chip';
import { useToast } from '@/components/ui/toast';
import { setAppointmentStatus } from '@/lib/actions/appointments';
import { APPOINTMENT_STATUS } from '@/lib/constants';
import { cn } from '@/lib/cn';
import type { AppointmentStatus } from '@/types/domain';

const ORDER: AppointmentStatus[] = ['scheduled', 'confirmed', 'done', 'cancelled', 'no_show'];

/** Estado de la cita con un toque (Confirmada, No asistió…). Optimista. */
export function AppointmentStatusPicker({ id, patientId, status }: { id: string; patientId: string; status: AppointmentStatus }) {
  const router = useRouter();
  const toast = useToast();
  const [value, setValue] = useState(status);
  const [pending, startTransition] = useTransition();

  const pick = (next: AppointmentStatus) => {
    if (next === value || pending) return;
    const prev = value;
    setValue(next);
    startTransition(async () => {
      const res = await setAppointmentStatus(id, patientId, next);
      if (!res.ok) {
        setValue(prev);
        toast({ title: 'No se pudo cambiar el estado', description: res.error, tone: 'error' });
        return;
      }
      router.refresh();
    });
  };

  return (
    <div role="radiogroup" aria-label="Estado de la cita" aria-busy={pending || undefined} className="flex flex-wrap gap-2">
      {ORDER.map((s) => {
        const on = s === value;
        return (
          <Chip key={s} role="radio" aria-checked={on} selected={on} size="sm" onClick={() => pick(s)}>
            <span aria-hidden className={cn('size-2 rounded-full', APPOINTMENT_STATUS[s].dot)} />
            {APPOINTMENT_STATUS[s].label}
          </Chip>
        );
      })}
    </div>
  );
}
