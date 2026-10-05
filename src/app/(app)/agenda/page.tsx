import type { Metadata } from 'next';
import { AgendaToolbar } from '@/components/features/agenda/agenda-toolbar';
import { AppointmentDialog, type PickedPatient } from '@/components/features/agenda/appointment-dialog';
import { DayView } from '@/components/features/agenda/day-view';
import { WeekView } from '@/components/features/agenda/week-view';
import {
  DEFAULT_DURATION,
  agendaHref,
  dayTitle,
  isISODate,
  isTime,
  limaTime,
  minutesOf,
  nextHalfHour,
  slotOf,
  weekDays,
  weekTitle,
  type AgendaView,
} from '@/lib/agenda';
import { getAppointment, getAppointments } from '@/lib/data/appointments';
import { getPatient, getPatientAlerts } from '@/lib/data/patients';
import { todayISO } from '@/lib/format';

export const metadata: Metadata = { title: 'Agenda' };

type SearchParams = { vista?: string; fecha?: string; cita?: string; nueva?: string; hora?: string; paciente?: string; editar?: string };

/**
 * F08 · Agenda. Todo el estado vive en la URL:
 *   ?vista=dia|semana &fecha=YYYY-MM-DD &cita=<id> (seleccionada)
 *   &nueva=1 [&hora=HH:MM &paciente=<id>] (Nueva cita) · &editar=<id> (Reprogramar)
 */
export default async function AgendaPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const now = new Date();
  const today = todayISO(now);
  const nowMinutes = minutesOf(limaTime(now.toISOString()));
  const view: AgendaView = sp.vista === 'semana' ? 'semana' : 'dia';
  const date = isISODate(sp.fecha) ? sp.fecha : today;

  // Semana: se pide de lunes a domingo; el domingo solo se muestra si tiene citas.
  const fullWeek = weekDays(date, true);
  const appointments =
    view === 'semana' ? await getAppointments(fullWeek[0]!, fullWeek[6]!) : await getAppointments(date, date);
  const days = view === 'semana' ? (appointments.some((a) => slotOf(a).date === fullWeek[6]) ? fullWeek : fullWeek.slice(0, 6)) : [date];
  const title = view === 'semana' ? weekTitle(days) : dayTitle(date, today);

  const closeHref = agendaHref({ vista: view, fecha: sp.fecha ? date : undefined, cita: sp.cita });
  const dialog = await dialogProps(sp, { date, today, closeHref });

  return (
    <main className="flex flex-1 flex-col gap-4 pb-6 md:gap-5">
      <AgendaToolbar view={view} date={date} today={today} title={title} />
      <div className="px-4 md:px-8">
        {view === 'semana' ? (
          <WeekView days={days} today={today} appointments={appointments} nowMinutes={nowMinutes} />
        ) : (
          <DayView date={date} today={today} appointments={appointments} selectedId={sp.cita ?? null} nowMinutes={nowMinutes} />
        )}
      </div>
      {dialog ? <AppointmentDialog key={`${dialog.mode}-${dialog.appointmentId ?? dialog.patient?.id ?? ''}-${dialog.date}-${dialog.time}`} {...dialog} /> : null}
    </main>
  );
}

async function pickedPatient(id: string | undefined): Promise<PickedPatient | null> {
  if (!id) return null;
  const patient = await getPatient(id);
  if (!patient) return null;
  const alerts = await getPatientAlerts(id);
  return { id, first_names: patient.first_names, last_names: patient.last_names, record_number: patient.record_number, phone: patient.phone, alerts };
}

async function dialogProps(sp: SearchParams, ctx: { date: string; today: string; closeHref: string }) {
  if (sp.editar) {
    const a = await getAppointment(sp.editar);
    if (!a || a.status === 'done') return null;
    const s = slotOf(a);
    return {
      mode: 'reschedule' as const,
      closeHref: ctx.closeHref,
      today: ctx.today,
      appointmentId: a.id,
      patient: { ...a.patient },
      date: s.date,
      time: s.time,
      duration: s.duration,
      reason: a.reason,
      notes: a.notes,
    };
  }
  if (sp.nueva === '1') {
    // En días pasados se propone hoy; hoy, la próxima media hora; en el futuro, 9:00.
    const date = ctx.date < ctx.today ? ctx.today : ctx.date;
    const time = isTime(sp.hora) ? sp.hora : date === ctx.today ? nextHalfHour() : '09:00';
    return {
      mode: 'create' as const,
      closeHref: ctx.closeHref,
      today: ctx.today,
      patient: await pickedPatient(sp.paciente),
      date,
      time,
      duration: DEFAULT_DURATION,
    };
  }
  return null;
}
