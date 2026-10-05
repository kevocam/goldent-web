/**
 * Vista previa de pantallas con datos de ejemplo. SOLO desarrollo (el middleware
 * responde 404 en producción). Sirve para comparar contra design/screens sin Supabase.
 *   /dev/inicio · /dev/resultados · /dev/sin-resultados · /dev/vacio
 *   /dev/ficha?tab=… · /dev/nuevo-paciente · /dev/captura · /dev/nueva-visita · /dev/login
 *   /dev/agenda?vista=dia|semana&cita=…&nueva=1 (los enlaces internos llevan a /agenda real)
 */
import { notFound } from 'next/navigation';
import { Plus } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { AppShell } from '@/components/shared/app-shell';
import { BrandPanel } from '@/components/features/auth/brand-panel';
import { LoginForm } from '@/components/features/auth/login-form';
import { QuickCaptureForm } from '@/components/features/capture/quick-capture-form';
import { FilesTab } from '@/components/features/files/files-tab';
import { ConditionsTab } from '@/components/features/patient/conditions-tab';
import { PatientHeader, isPatientTab } from '@/components/features/patient/patient-header';
import { PersonalDataTab } from '@/components/features/patient/personal-data-tab';
import { SummaryTab } from '@/components/features/patient/summary-tab';
import { VisitsTab } from '@/components/features/patient/visits-tab';
import { PatientForm } from '@/components/features/patient-form/patient-form';
import { HomeHeader } from '@/components/features/search/home-header';
import { HomeSearch } from '@/components/features/search/home-search';
import { RecentPatients } from '@/components/features/search/recent-patients';
import { TodayAppointmentsCard } from '@/components/features/search/today-appointments-card';
import { VisitForm } from '@/components/features/visit/visit-form';
import { AgendaToolbar } from '@/components/features/agenda/agenda-toolbar';
import { AppointmentDialog } from '@/components/features/agenda/appointment-dialog';
import { DayView } from '@/components/features/agenda/day-view';
import { WeekView } from '@/components/features/agenda/week-view';
import { dayTitle, slotOf, weekDays, weekTitle } from '@/lib/agenda';
import { pendingTreatments } from '@/lib/data/visits';
import { fxAlerts, fxAppointments, fxConditions, fxFiles, fxPatient, fxPatientCards, fxSearchResults, fxServices, fxSession, fxVisits } from '../fixtures';

const DEMO_NOW = new Date('2026-10-05T14:00:00Z');

export default async function DevScreen({ params, searchParams }: { params: Promise<{ screen: string }>; searchParams: Promise<{ tab?: string; vista?: string; cita?: string; nueva?: string }> }) {
  if (process.env.NODE_ENV !== 'development') notFound();
  const [{ screen }, { tab: rawTab, vista, cita, nueva }] = await Promise.all([params, searchParams]);

  if (screen === 'login') {
    return (
      <div className="flex min-h-dvh bg-surface">
        <BrandPanel />
        <section className="flex w-full flex-col justify-center gap-9 px-6 py-10 md:w-[540px] md:shrink-0 md:px-[72px]">
          <Logo />
          <div className="flex flex-col gap-2">
            <h1 className="m-0 text-[32px] font-extrabold tracking-[-.02em]">Iniciar sesión</h1>
            <p className="m-0 text-base font-medium text-ink-muted">Ingresa con la cuenta del consultorio.</p>
          </div>
          <LoginForm />
        </section>
      </div>
    );
  }

  let body: React.ReactNode;
  switch (screen) {
    case 'inicio':
    case 'resultados':
    case 'sin-resultados':
    case 'vacio': {
      const q = screen === 'resultados' ? 'quispe' : screen === 'sin-resultados' ? 'Vargas Ttito' : '';
      body = (
        <main className="flex flex-1 flex-col gap-4 px-4 pt-5 pb-6 md:gap-[22px] md:px-8 md:pt-7">
          <HomeHeader staffName={fxSession.staffName} now={DEMO_NOW} />
          <HomeSearch
            initialQuery={q}
            initialResults={screen === 'resultados' ? fxSearchResults : []}
            recent={<RecentPatients patients={screen === 'vacio' ? [] : fxPatientCards} />}
            aside={<TodayAppointmentsCard appointments={screen === 'vacio' ? [] : fxAppointments.filter((a) => slotOf(a).date === '2026-10-05')} today="2026-10-05" />}
          />
        </main>
      );
      break;
    }
    case 'ficha': {
      const tab = isPatientTab(rawTab) ? rawTab : 'resumen';
      const id = fxPatient.id;
      const content = {
        resumen: <SummaryTab patientId={id} lastVisit={fxVisits[0]!} pending={pendingTreatments(fxVisits)} recentFiles={fxFiles.slice(0, 3)} nextAppointment={fxAppointments.find((a) => a.patient_id === id) ?? null} />,
        visitas: <VisitsTab patientId={id} visits={fxVisits} paperPages={2} paperDate="2025-03-03T15:00:00Z" />,
        antecedentes: <ConditionsTab patientId={id} conditions={fxConditions} />,
        archivos: <FilesTab patientId={id} files={fxFiles} />,
        datos: <PersonalDataTab patient={fxPatient} fromPaper />,
      }[tab];
      body = (
        <main className="flex flex-1 flex-col">
          <PatientHeader patient={fxPatient} alerts={fxAlerts} tab={tab} />
          <section className="flex-1 px-4 py-4 md:px-8 md:pt-[22px] md:pb-7">{content}</section>
          <div className="sticky bottom-[88px] z-10 border-t border-line-card bg-surface px-4 py-3 md:hidden">
            <ButtonLink href="#" className="min-h-14 w-full text-[17px]">
              <Plus className="size-5" aria-hidden />
              Nueva visita
            </ButtonLink>
          </div>
        </main>
      );
      break;
    }
    case 'nuevo-paciente':
      body = (
        <main className="flex flex-1 flex-col">
          <PatientForm
            mode="create"
            recordLabel="HC-00252 · se asigna automáticamente"
            conditions={fxConditions.map((c) => ({ ...c, active: ['allergy', 'medication', 'pregnant'].includes(c.code), detail: { allergy: 'Ibuprofeno: ronchas en la piel', medication: 'Ácido fólico, sulfato ferroso', pregnant: '12 semanas' }[c.code] ?? null }))}
            defaultValues={{ first_names: 'Milagros', last_names: 'Ccori Huanca', dni: '47205318', birth_date: '1992-11-09', phone: '965418203', address: 'Urb. Los Pinos D-12, Cerro Colorado, Arequipa', occupation: 'Docente', marital_status: 'conviviente' }}
            cancelHref="/dev/inicio"
          />
        </main>
      );
      break;
    case 'captura':
      body = (
        <main className="flex flex-1 flex-col">
          <QuickCaptureForm nextRecordNumber="HC-00253" />
        </main>
      );
      break;
    case 'nueva-visita':
      body = (
        <main className="flex flex-1 flex-col">
          <VisitForm
            patient={{ id: fxPatient.id, name: 'Rosa Elvira Quispe Mamani', shortName: 'Rosa Quispe', record_number: 'HC-00248' }}
            alerts={fxAlerts}
            services={fxServices}
          />
        </main>
      );
      break;
    case 'agenda': {
      const today = '2026-10-05';
      const week = vista === 'semana';
      const days = weekDays(today);
      body = (
        <main className="flex flex-1 flex-col gap-4 pb-6 md:gap-5">
          <AgendaToolbar view={week ? 'semana' : 'dia'} date={today} today={today} title={week ? weekTitle(days) : dayTitle(today, today)} />
          <div className="px-4 md:px-8">
            {week ? (
              <WeekView days={days} today={today} appointments={fxAppointments} nowMinutes={640} />
            ) : (
              <DayView date={today} today={today} appointments={fxAppointments.filter((a) => slotOf(a).date === today)} selectedId={cita ?? null} nowMinutes={640} />
            )}
          </div>
          {nueva ? (
            <AppointmentDialog mode="create" closeHref="/dev/agenda" today={today} patient={null} date={today} time="12:30" duration={30} />
          ) : null}
        </main>
      );
      break;
    }
    default:
      notFound();
  }

  return <AppShell session={fxSession}>{body}</AppShell>;
}
