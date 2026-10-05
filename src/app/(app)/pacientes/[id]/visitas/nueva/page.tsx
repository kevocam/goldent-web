import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { VisitForm } from '@/components/features/visit/visit-form';
import { getServicesCatalog } from '@/lib/data/catalogs';
import { getPatient, getPatientAlerts } from '@/lib/data/patients';
import { fullName, shortName } from '@/lib/format';

export const metadata: Metadata = { title: 'Nueva visita' };

/** F06 · Nueva visita. `?cita=` llega desde la agenda (fase 2). */
export default async function NewVisitPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ cita?: string }> }) {
  const [{ id }, { cita }] = await Promise.all([params, searchParams]);
  const [patient, alerts, services] = await Promise.all([getPatient(id), getPatientAlerts(id), getServicesCatalog()]);
  if (!patient) notFound();

  return (
    <main className="flex flex-1 flex-col">
      <VisitForm
        patient={{ id, name: fullName(patient), shortName: shortName(patient), record_number: patient.record_number }}
        alerts={alerts}
        services={services}
        appointmentId={cita ?? null}
      />
    </main>
  );
}
