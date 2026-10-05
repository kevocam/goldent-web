const TZ = 'America/Lima';
const LOCALE = 'es-PE';

/** Solo dígitos. */
export function digits(value: string | null | undefined): string {
  return (value ?? '').replace(/\D/g, '');
}

/** 951284736 → "951 284 736" */
export function formatPhone(phone: string | null | undefined): string {
  const d = digits(phone);
  if (d.length !== 9) return phone ?? '';
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
}

/** Fecha ISO "2026-10-05" → Date a mediodía (evita saltos por zona horaria). */
function parseDate(iso: string): Date {
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T12:00:00`) : new Date(iso);
}

function stripDot(s: string): string {
  return s.replace(/\./g, '');
}

/** Abreviaturas fijas: el ICU de es-PE da "set." y varía entre navegadores. */
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function limaParts(d: Date): { day: number; month: number; year: number } {
  const [y, m, day] = d.toLocaleDateString('en-CA', { timeZone: TZ }).split('-').map(Number);
  return { day: day!, month: m! - 1, year: y! };
}

/** "28 sep 2026" */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const { day, month, year } = limaParts(parseDate(iso));
  return `${day} ${MONTHS[month]} ${year}`;
}

/** "28 sep" (sin año) */
export function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const { day, month } = limaParts(parseDate(iso));
  return `${day} ${MONTHS[month]}`;
}

/** "28 de septiembre de 2026" */
export function formatLongDate(iso: string): string {
  return parseDate(iso).toLocaleDateString(LOCALE, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: TZ,
  });
}

/** "Lunes 5 de octubre" */
export function formatWeekdayDate(date: Date = new Date()): string {
  const s = date.toLocaleDateString(LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: TZ,
  });
  const clean = s.replace(',', '');
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

/** "lun 5 oct 2026" */
export function formatCompactDate(iso: string): string {
  const d = parseDate(iso);
  const wd = stripDot(d.toLocaleDateString(LOCALE, { weekday: 'short', timeZone: TZ }));
  return `${wd} ${formatDate(iso)}`;
}

/** Fecha de hoy en Lima como "YYYY-MM-DD". */
export function todayISO(now: Date = new Date()): string {
  return now.toLocaleDateString('en-CA', { timeZone: TZ });
}

/** Edad en años cumplidos. */
export function ageFrom(birthDate: string | null | undefined, now: Date = new Date()): number | null {
  if (!birthDate) return null;
  const b = parseDate(birthDate);
  if (Number.isNaN(b.getTime())) return null;
  const today = parseDate(todayISO(now));
  let age = today.getFullYear() - b.getFullYear();
  const m = today.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
  return age >= 0 ? age : null;
}

/** "Buenos días" / "Buenas tardes" / "Buenas noches" según la hora en Lima. */
export function greeting(now: Date = new Date()): string {
  const hour = Number(now.toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: TZ }));
  if (hour >= 5 && hour < 12) return 'Buenos días';
  if (hour >= 12 && hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

interface Named {
  first_names: string;
  last_names: string;
}

export function fullName(p: Named): string {
  return `${p.first_names} ${p.last_names}`.trim();
}

/** Primer nombre + primer apellido: "Rosa Quispe" */
export function shortName(p: Named): string {
  const first = p.first_names.trim().split(/\s+/)[0] ?? '';
  const last = p.last_names.trim().split(/\s+/)[0] ?? '';
  return `${first} ${last}`.trim();
}

/** Iniciales: primer nombre + primer apellido → "RQ" */
export function initials(p: Named): string {
  const f = p.first_names.trim().charAt(0);
  const l = p.last_names.trim().charAt(0);
  return `${f}${l}`.toUpperCase();
}

/** "HC-00248" → "00248" (el diseño muestra "HC 00248"). */
export function recordDigits(recordNumber: string): string {
  return recordNumber.replace(/^HC-?/i, '');
}

export function pluralize(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

/** { day: "28 sep", year: "2026" } para la línea de tiempo. */
export function dayParts(iso: string | null | undefined): { day: string; year: string } {
  if (!iso) return { day: '', year: '' };
  const [d = '', m = '', y = ''] = formatDate(iso).split(' ');
  return { day: `${d} ${m}`, year: y };
}
