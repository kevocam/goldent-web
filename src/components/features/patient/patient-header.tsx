import Link from 'next/link';
import { Pencil, Plus } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { LinkTabs } from '@/components/ui/tabs';
import { ContactActions } from '@/components/shared/contact-actions';
import { MedicalAlerts } from '@/components/shared/medical-alerts';
import { BackLink } from '@/components/shared/page-header';
import { PatientAvatar, PatientIdentity } from '@/components/shared/patient-identity';
import { ageFrom, fullName } from '@/lib/format';
import type { Patient } from '@/types/domain';

export const PATIENT_TABS = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'visitas', label: 'Visitas y tratamientos', shortLabel: 'Visitas' },
  { id: 'antecedentes', label: 'Antecedentes' },
  { id: 'archivos', label: 'Archivos' },
  { id: 'datos', label: 'Datos personales', shortLabel: 'Datos' },
] as const;

export type PatientTab = (typeof PATIENT_TABS)[number]['id'];

export function isPatientTab(value: string | undefined): value is PatientTab {
  return PATIENT_TABS.some((t) => t.id === value);
}

export interface PatientHeaderProps {
  patient: Patient;
  alerts: string[];
  tab: PatientTab;
}

/** Encabezado fijo de la ficha: identidad, contacto, alertas y pestañas. */
export function PatientHeader({ patient, alerts, tab }: PatientHeaderProps) {
  const name = fullName(patient);
  const identity = { ...patient, age: ageFrom(patient.birth_date) };
  const base = `/pacientes/${patient.id}`;

  return (
    <header className="flex flex-col gap-3 border-b border-line-card bg-surface px-4 pt-2.5 md:px-8 md:pt-3">
      <div className="flex items-center justify-between">
        <BackLink href="/" label="Pacientes" />
        <Link href={`${base}/editar`} aria-label="Editar paciente" className="flex size-11 items-center justify-center text-ink md:hidden">
          <Pencil className="size-5" aria-hidden />
        </Link>
      </div>

      <div className="flex items-center gap-3 md:gap-[18px]">
        <PatientAvatar patient={patient} size="xl" />
        <div className="flex min-w-0 flex-1 flex-col gap-1 md:gap-1.5">
          <h1 className="m-0 text-[21px] leading-tight font-extrabold tracking-[-.02em] md:text-[26px]">{name}</h1>
          <PatientIdentity patient={identity} layout="header" include={{ phone: true }} className="hidden md:flex" />
          <PatientIdentity patient={identity} include={{ phone: false }} className="text-[13px] md:hidden" />
        </div>
        <div className="hidden shrink-0 gap-2.5 md:flex">
          <ContactActions phone={patient.phone} name={name} />
          <ButtonLink href={`${base}/visitas/nueva`}>
            <Plus className="size-5" aria-hidden />
            Nueva visita
          </ButtonLink>
          <ButtonLink href={`${base}/editar`} variant="secondary" size="icon" aria-label="Editar paciente">
            <Pencil className="size-5" aria-hidden />
          </ButtonLink>
        </div>
      </div>

      <ContactActions phone={patient.phone} name={name} variant="stretch" showNumber className="md:hidden" />

      <MedicalAlerts alerts={alerts} withHeading size="lg" className="hidden md:flex" />
      <MedicalAlerts alerts={alerts} size="sm" className="md:hidden" />

      <LinkTabs
        label="Secciones de la ficha"
        tabs={[...PATIENT_TABS]}
        value={tab}
        hrefFor={(id) => (id === 'resumen' ? base : `${base}?tab=${id}`)}
      />
    </header>
  );
}
