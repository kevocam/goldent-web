import { Pencil } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format';
import type { PatientCondition } from '@/types/domain';

/** Ficha · Antecedentes: las 9 condiciones con Sí/No y detalle. */
export function ConditionsTab({ patientId, conditions }: { patientId: string; conditions: PatientCondition[] }) {
  const updated = conditions
    .map((c) => c.updatedAt)
    .filter((d): d is string => Boolean(d))
    .sort()
    .at(-1);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="m-0 text-lg font-extrabold">Antecedentes médicos</h2>
        <span className="flex-1 text-sm font-semibold text-ink-muted">{updated ? `Actualizado el ${formatDate(updated)}` : 'Sin antecedentes registrados'}</span>
        <ButtonLink href={`/pacientes/${patientId}/editar#antecedentes`} variant="secondary" size="sm">
          <Pencil className="size-[18px]" aria-hidden />
          Editar
        </ButtonLink>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {conditions.map((c) => (
          <div
            key={c.conditionId}
            className={cn(
              'flex min-h-[112px] flex-col gap-2 rounded-2xl border px-[18px] py-4',
              c.active ? 'border-alert-200 bg-alert-25' : 'border-line-card bg-surface',
            )}
          >
            <div className="flex items-center gap-2">
              <span className="flex-1 text-base font-extrabold">{c.label}</span>
              <span
                className={cn(
                  'inline-flex min-h-7 items-center rounded-full px-3 text-[13px] font-extrabold',
                  c.active ? 'bg-alert text-white' : 'bg-surface-2 text-ink-muted',
                )}
              >
                {c.active ? 'Sí' : 'No'}
              </span>
            </div>
            <span className={cn('text-[15px] leading-snug font-semibold', c.active ? 'text-ink' : 'text-ink-subtle')}>
              {c.active ? (c.detail ?? 'Sin detalle') : 'Sin antecedentes'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
