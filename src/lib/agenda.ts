/**
 * F08 · Utilidades de agenda (puras, sin Supabase).
 * Perú no tiene horario de verano: Lima es siempre UTC-05:00.
 */

export const LIMA_OFFSET = '-05:00';
const TZ = 'America/Lima';

/** Rango visible por defecto de la grilla semanal (se amplía si hay citas fuera). */
export const DAY_START_HOUR = 8;
export const DAY_END_HOUR = 20;

/** Duración por defecto cuando una cita no tiene hora de fin. */
export const DEFAULT_DURATION = 30;
export const DURATION_OPTIONS = [30, 45, 60, 90] as const;

const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const WEEKDAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function isISODate(value: string | null | undefined): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T12:00:00Z`));
}

export function isTime(value: string | null | undefined): value is string {
  return !!value && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

/** "YYYY-MM-DD" → Date a mediodía UTC (aritmética de días sin saltos). */
function noon(date: string): Date {
  return new Date(`${date}T12:00:00Z`);
}

export function addDays(date: string, days: number): string {
  const d = noon(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** 0 = domingo … 6 = sábado */
export function weekdayIndex(date: string): number {
  return noon(date).getUTCDay();
}

/** Lunes de la semana de `date`. */
export function weekStart(date: string): string {
  const wd = weekdayIndex(date);
  return addDays(date, wd === 0 ? -6 : 1 - wd);
}

/** Lunes a sábado; el domingo solo si `withSunday`. */
export function weekDays(date: string, withSunday = false): string[] {
  const start = weekStart(date);
  return Array.from({ length: withSunday ? 7 : 6 }, (_, i) => addDays(start, i));
}

/** "2026-10-05" + "09:30" → "2026-10-05T09:30:00-05:00" */
export function toTimestamp(date: string, time: string): string {
  return `${date}T${time}:00${LIMA_OFFSET}`;
}

/** Desde el inicio del primer día hasta el inicio del día siguiente al último. */
export function rangeOf(from: string, toInclusive: string): { from: string; to: string } {
  return { from: toTimestamp(from, '00:00'), to: toTimestamp(addDays(toInclusive, 1), '00:00') };
}

/** Fecha en Lima ("YYYY-MM-DD") de un timestamp. */
export function limaDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', { timeZone: TZ });
}

/** Hora en Lima ("HH:MM", 24 h) de un timestamp. */
export function limaTime(iso: string): string {
  const s = new Date(iso).toLocaleTimeString('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false });
  return s.startsWith('24') ? `00${s.slice(2)}` : s;
}

/** Minutos desde la medianoche de Lima. */
export function minutesOf(time: string): number {
  const [h = 0, m = 0] = time.split(':').map(Number);
  return h * 60 + m;
}

export function timeFromMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Duración en minutos; sin hora de fin → DEFAULT_DURATION. */
export function durationOf(startsAt: string, endsAt: string | null): number {
  if (!endsAt) return DEFAULT_DURATION;
  return Math.max(5, Math.round((Date.parse(endsAt) - Date.parse(startsAt)) / 60000));
}

/** "16:00" → "4:00 p. m." (como se escribe en Perú). */
export function formatTime12(time: string): string {
  const [h = 0, m = 0] = time.split(':').map(Number);
  const suffix = h < 12 ? 'a. m.' : 'p. m.';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** 45 → "45 min" · 60 → "1 h" · 90 → "1 h 30" */
export function durationLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m}` : `${h} h`;
}

/** "Lun" */
export function weekdayShort(date: string): string {
  return WEEKDAYS_SHORT[weekdayIndex(date)]!;
}

/** "5" */
export function dayNumber(date: string): string {
  return String(Number(date.slice(8, 10)));
}

/** "lunes 5 de octubre" */
export function longDay(date: string): string {
  const d = noon(date);
  return `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()} de ${MONTHS[d.getUTCMonth()]}`;
}

/** "Hoy · lunes 5 de octubre", "Mañana · …" o "Jueves 8 de octubre". */
export function dayTitle(date: string, today: string): string {
  if (date === today) return `Hoy · ${longDay(date)}`;
  if (date === addDays(today, 1)) return `Mañana · ${longDay(date)}`;
  const s = longDay(date);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** "5 – 10 oct 2026" · "28 sep – 3 oct 2026" · "29 dic 2025 – 3 ene 2026" */
export function weekTitle(days: string[]): string {
  const first = noon(days[0]!);
  const last = noon(days[days.length - 1]!);
  const fy = first.getUTCFullYear();
  const ly = last.getUTCFullYear();
  const fm = MONTHS_SHORT[first.getUTCMonth()];
  const lm = MONTHS_SHORT[last.getUTCMonth()];
  if (fy !== ly) return `${first.getUTCDate()} ${fm} ${fy} – ${last.getUTCDate()} ${lm} ${ly}`;
  if (fm !== lm) return `${first.getUTCDate()} ${fm} – ${last.getUTCDate()} ${lm} ${ly}`;
  return `${first.getUTCDate()} – ${last.getUTCDate()} ${lm} ${ly}`;
}

/** "hoy lunes 5 de octubre" · "mañana martes 6 de octubre" · "el jueves 8 de octubre" */
export function relativeDay(date: string, today: string): string {
  if (date === today) return `hoy ${longDay(date)}`;
  if (date === addDays(today, 1)) return `mañana ${longDay(date)}`;
  return `el ${longDay(date)}`;
}

/** Recordatorio de WhatsApp (F08). */
export function reminderMessage({ firstName, date, time, today }: { firstName: string; date: string; time: string; today: string }): string {
  return (
    `Hola, ${firstName}. Le recordamos su cita en GOLDENT Consultorio Odontológico ${relativeDay(date, today)} ` +
    // "p. m." ya termina en punto: no se agrega otro.
    `a las ${formatTime12(time)} Responda SÍ para confirmar o escríbanos si necesita cambiar la hora. ¡Gracias!`
  );
}

/** Intervalo [inicio, fin) en minutos dentro del día de Lima. */
export interface Slot {
  id: string;
  start: number;
  end: number;
}

/** Primera cita que se cruza con [start, end), ignorando `excludeId`. */
export function findOverlap<T extends Slot>(slots: T[], start: number, end: number, excludeId?: string): T | null {
  return slots.find((s) => s.id !== excludeId && s.start < end && start < s.end) ?? null;
}

/** Huecos libres de al menos `minGap` minutos entre citas ocupadas, dentro del horario. */
export function freeGaps(
  busy: { start: number; end: number }[],
  dayStart = DAY_START_HOUR * 60,
  dayEnd = DAY_END_HOUR * 60,
  minGap = 30,
): { start: number; end: number }[] {
  const sorted = [...busy].sort((a, b) => a.start - b.start);
  const gaps: { start: number; end: number }[] = [];
  let cursor = dayStart;
  for (const b of sorted) {
    if (b.start - cursor >= minGap) gaps.push({ start: cursor, end: Math.min(b.start, dayEnd) });
    cursor = Math.max(cursor, b.end);
    if (cursor >= dayEnd) break;
  }
  if (dayEnd - cursor >= minGap) gaps.push({ start: cursor, end: dayEnd });
  return gaps.filter((g) => g.end - g.start >= minGap);
}

/**
 * Carriles para citas que se cruzan en la grilla semanal: cada cita recibe su carril
 * y cuántos carriles tiene su grupo, para dibujarlas lado a lado.
 */
export function layoutLanes<T extends { start: number; end: number }>(items: T[]): (T & { lane: number; lanes: number })[] {
  const sorted = [...items].sort((a, b) => a.start - b.start || b.end - a.end);
  const out: (T & { lane: number; lanes: number })[] = [];
  let group: (T & { lane: number })[] = [];
  let groupEnd = -1;
  let laneEnds: number[] = [];

  const flush = () => {
    const lanes = group.reduce((n, g) => Math.max(n, g.lane + 1), 1);
    for (const g of group) out.push({ ...g, lanes });
    group = [];
    laneEnds = [];
  };

  for (const it of sorted) {
    if (group.length && it.start >= groupEnd) flush();
    let lane = laneEnds.findIndex((end) => end <= it.start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(it.end);
    } else {
      laneEnds[lane] = it.end;
    }
    group.push({ ...it, lane });
    groupEnd = Math.max(groupEnd, it.end);
  }
  if (group.length) flush();
  return out;
}

/** Horas visibles de la grilla: 8–20, ampliadas si alguna cita cae fuera. */
export function visibleHours(slots: { start: number; end: number }[]): { start: number; end: number } {
  let start = DAY_START_HOUR;
  let end = DAY_END_HOUR;
  for (const s of slots) {
    start = Math.min(start, Math.floor(s.start / 60));
    end = Math.max(end, Math.ceil(s.end / 60));
  }
  return { start: Math.max(0, start), end: Math.min(24, end) };
}

/** Fecha, hora y minutos (Lima) de una cita guardada. */
export function slotOf(a: { starts_at: string; ends_at: string | null }): { date: string; time: string; start: number; end: number; duration: number } {
  const date = limaDate(a.starts_at);
  const time = limaTime(a.starts_at);
  const start = minutesOf(time);
  const duration = durationOf(a.starts_at, a.ends_at);
  return { date, time, start, end: Math.min(start + duration, 24 * 60), duration };
}

export type AgendaView = 'dia' | 'semana';

export interface AgendaParams {
  vista?: AgendaView;
  fecha?: string;
  /** Cita seleccionada (vista día). */
  cita?: string;
  /** Abre "Nueva cita". */
  nueva?: boolean;
  hora?: string;
  paciente?: string;
  /** Abre "Reprogramar" para esta cita. */
  editar?: string;
}

/** URL de la agenda: todo el estado vive en la query para que "atrás" funcione. */
export function agendaHref(p: AgendaParams = {}): string {
  const q = new URLSearchParams();
  if (p.vista) q.set('vista', p.vista);
  if (p.fecha) q.set('fecha', p.fecha);
  if (p.cita) q.set('cita', p.cita);
  if (p.nueva) q.set('nueva', '1');
  if (p.hora) q.set('hora', p.hora);
  if (p.paciente) q.set('paciente', p.paciente);
  if (p.editar) q.set('editar', p.editar);
  const s = q.toString();
  return s ? `/agenda?${s}` : '/agenda';
}

/** Próxima media hora en punto (para prellenar "Nueva cita" hoy). */
export function nextHalfHour(now: Date = new Date()): string {
  const mins = minutesOf(limaTime(now.toISOString()));
  const next = Math.min(Math.ceil((mins + 1) / 30) * 30, 23 * 60 + 30);
  return timeFromMinutes(next);
}
