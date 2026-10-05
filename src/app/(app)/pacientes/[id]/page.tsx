import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Plus } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { ConditionsTab } from '@/components/features/patient/conditions-tab';
import { FilesTab } from '@/components/features/files/files-tab';
import { PatientHeader, isPatientTab, type PatientTab } from '@/components/features/patient/patient-header';
import { PersonalDataTab } from '@/components/features/patient/personal-data-tab';
import { SummaryTab } from '@/components/features/patient/summary-tab';
import { VisitsTab } from '@/components/features/patient/visits-tab';
import { getFiles } from '@/lib/data/files';
import { getPatient, getPatientAlerts, getPatientConditions } from '@/lib/data/patients';
import { getVisits, pendingTreatments } from '@/lib/data/visits';
import { fullName } from '@/lib/format';

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const patient = await getPatient((await params).id);
  return { title: patient ? fullName(patient) : 'Paciente' };
}

/** F03 · Ficha del paciente. Cada pestaña carga solo lo que necesita. */
export default async function PatientPage({ params, searchParams }: Props) {
  const [{ id }, { tab: rawTab }] = await Promise.all([params, searchParams]);
  const tab: PatientTab = isPatientTab(rawTab) ? rawTab : 'resumen';

  const patient = await getPatient(id);
  if (!patient) notFound();
  const alerts = await getPatientAlerts(id);

  let content: React.ReactNode;
  switch (tab) {
    case 'resumen': {
      const [visits, files] = await Promise.all([getVisits(id), getFiles(id)]);
      content = <SummaryTab patientId={id} lastVisit={visits[0] ?? null} pending={pendingTreatments(visits)} recentFiles={files.slice(0, 3)} />;
      break;
    }
    case 'visitas': {
      const [visits, files] = await Promise.all([getVisits(id), getFiles(id)]);
      const paper = files.filter((f) => f.kind === 'paper_record');
      content = <VisitsTab patientId={id} visits={visits} paperPages={paper.length} paperDate={paper.at(-1)?.created_at ?? null} />;
      break;
    }
    case 'antecedentes':
      content = <ConditionsTab patientId={id} conditions={await getPatientConditions(id)} />;
      break;
    case 'archivos':
      content = <FilesTab patientId={id} files={await getFiles(id)} />;
      break;
    case 'datos': {
      const files = await getFiles(id);
      content = <PersonalDataTab patient={patient} fromPaper={Boolean(patient.legacy_record_number) || files.some((f) => f.kind === 'paper_record')} />;
      break;
    }
  }

  return (
    <main className="flex flex-1 flex-col">
      <PatientHeader patient={patient} alerts={alerts} tab={tab} />
      <section className="flex-1 px-4 py-4 md:px-8 md:pt-[22px] md:pb-7">{content}</section>
      <div className="sticky bottom-[88px] z-10 border-t border-line-card bg-surface px-4 py-3 md:hidden">
        <ButtonLink href={`/pacientes/${id}/visitas/nueva`} className="min-h-14 w-full text-[17px]">
          <Plus className="size-5" aria-hidden />
          Nueva visita
        </ButtonLink>
      </div>
    </main>
  );
}
