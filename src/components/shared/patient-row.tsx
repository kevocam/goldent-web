import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatShortDate, fullName } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { PatientCard } from '@/types/domain';
import { ContactActions } from './contact-actions';
import { MedicalAlerts } from './medical-alerts';
import { PatientAvatar, PatientIdentity } from './patient-identity';

export interface PatientRowProps {
  patient: PatientCard;
  href: string;
  /** "recent": compacta, botones de ícono y fecha de última visita. "result": con edad y botones con texto. */
  variant?: 'recent' | 'result';
}

/**
 * Fila de paciente (Inicio, resultados, agenda).
 * Tablet: una línea. Móvil: tarjeta apilada con botones a todo el ancho.
 */
export function PatientRow({ patient, href, variant = 'result' }: PatientRowProps) {
  const name = fullName(patient);
  const recent = variant === 'recent';

  return (
    <Card
      as="article"
      className={cn(
        'flex flex-col gap-3 p-4 md:flex-row md:items-center',
        recent ? 'md:gap-3.5 md:rounded-[18px] md:py-2.5 md:pr-3 md:pl-3.5' : 'md:gap-4 md:py-3.5 md:pr-3.5 md:pl-4',
      )}
    >
      <Link href={href} className="flex min-w-0 flex-1 items-center gap-3 text-ink no-underline md:min-w-[260px] md:gap-3.5">
        <PatientAvatar patient={patient} size={recent ? 'lg' : 'xl'} />
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className={cn('truncate leading-tight font-extrabold', recent ? 'text-[17px]' : 'text-[17px] md:text-[19px]')}>{name}</span>
          <PatientIdentity patient={patient} include={{ age: false, phone: false }} className="truncate text-[13px] md:hidden" />
          <PatientIdentity
            patient={patient}
            include={{ age: !recent, phone: true }}
            className={cn('hidden truncate md:block', recent ? 'md:text-sm' : 'md:text-[15px]')}
          />
        </span>
        <ChevronRight className="size-5 shrink-0 text-ink-muted md:hidden" aria-hidden />
      </Link>

      {patient.alerts.length > 0 ? (
        <>
          <MedicalAlerts alerts={patient.alerts} size="sm" className="md:hidden" />
          <MedicalAlerts alerts={patient.alerts} compact className="hidden max-w-[220px] md:flex" />
        </>
      ) : null}

      {recent && patient.last_visit ? (
        <span className="hidden w-16 text-right text-[13px] font-semibold text-ink-muted md:block">{formatShortDate(patient.last_visit)}</span>
      ) : null}

      <ContactActions phone={patient.phone} name={name} variant="stretch" className="md:hidden" />
      <ContactActions phone={patient.phone} name={name} variant={recent ? 'icon' : 'full'} className="hidden md:flex" />
    </Card>
  );
}
