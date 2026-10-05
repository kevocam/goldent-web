import { Pencil } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { maritalLabel } from '@/lib/constants';
import { ageFrom, formatDate, formatPhone, fullName } from '@/lib/format';
import type { Patient } from '@/types/domain';
import { ArchivePatientButton } from './archive-patient-button';

/** Ficha · Datos personales (solo lectura). */
export function PersonalDataTab({ patient, fromPaper }: { patient: Patient; fromPaper: boolean }) {
  const age = ageFrom(patient.birth_date);
  const birth = patient.birth_date
    ? `${new Date(`${patient.birth_date}T12:00:00`).toLocaleDateString('es-PE')}${age !== null ? ` · ${age} años` : ''}`
    : null;

  const rows: [string, string | null][] = [
    ['Nombres', patient.first_names],
    ['Apellidos', patient.last_names],
    ['DNI', patient.dni],
    ['Fecha de nacimiento', birth],
    ['Celular', patient.phone ? formatPhone(patient.phone) : null],
    ['Correo', patient.email],
    ['Domicilio', patient.address],
    ['Ocupación', patient.occupation],
    ['Estado civil', maritalLabel(patient.marital_status) || null],
    ['N.º de historia', `${patient.record_number}${patient.legacy_record_number ? ` · en papel: ${patient.legacy_record_number}` : ''}`],
    ['Registrado', `${formatDate(patient.created_at)}${fromPaper ? ' · desde formato en papel' : ''}`],
  ];

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col px-5 pt-2 pb-4 md:px-6">
        <div className="flex min-h-16 items-center gap-3">
          <h2 className="m-0 flex-1 text-lg font-extrabold">Datos personales</h2>
          <ButtonLink href={`/pacientes/${patient.id}/editar`} variant="secondary" size="sm">
            <Pencil className="size-[18px]" aria-hidden />
            Editar
          </ButtonLink>
        </div>
        <dl className="m-0 grid gap-x-8 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="flex flex-col gap-1 border-t border-line-soft py-3.5">
              <dt className="text-[13px] font-bold tracking-[.04em] text-ink-muted uppercase">{label}</dt>
              <dd className="tabular m-0 text-[17px] font-bold">{value ?? <span className="font-semibold text-ink-subtle">—</span>}</dd>
            </div>
          ))}
        </dl>
      </Card>
      <div className="flex justify-end">
        <ArchivePatientButton patientId={patient.id} name={fullName(patient)} />
      </div>
    </div>
  );
}
