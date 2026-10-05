import type { AppointmentStatus, FileKind, MaritalStatus, TreatmentStatus } from '@/types/domain';

export const TREATMENT_STATUS: Record<TreatmentStatus, { label: string; className: string }> = {
  planned: { label: 'Planificado', className: 'bg-st-planned-bg text-st-planned-fg' },
  in_progress: { label: 'En proceso', className: 'bg-st-progress-bg text-st-progress-fg' },
  done: { label: 'Realizado', className: 'bg-st-done-bg text-st-done-fg' },
};

export const TREATMENT_STATUS_ORDER: TreatmentStatus[] = ['planned', 'in_progress', 'done'];

export const APPOINTMENT_STATUS: Record<AppointmentStatus, { label: string; className: string; dot: string }> = {
  scheduled: { label: 'Programada', className: 'bg-st-planned-bg text-st-planned-fg', dot: 'bg-ink-subtle' },
  confirmed: { label: 'Confirmada', className: 'bg-ap-confirmed-bg text-ap-confirmed-fg', dot: 'bg-ap-confirmed-fg' },
  done: { label: 'Atendida', className: 'bg-st-done-bg text-st-done-fg', dot: 'bg-ok' },
  cancelled: { label: 'Cancelada', className: 'bg-ap-cancelled-bg text-ink-muted', dot: 'bg-line' },
  no_show: { label: 'No asistió', className: 'bg-ap-noshow-bg text-ap-noshow-fg', dot: 'bg-warn' },
};

export const VISIT_REASONS = ['Dolor', 'Control', 'Limpieza', 'Urgencia', 'Estética'] as const;

export const MARITAL_STATUS: { value: MaritalStatus; label: string }[] = [
  { value: 'soltero', label: 'Soltero(a)' },
  { value: 'casado', label: 'Casado(a)' },
  { value: 'conviviente', label: 'Conviviente' },
  { value: 'divorciado', label: 'Divorciado(a)' },
  { value: 'viudo', label: 'Viudo(a)' },
];

export function maritalLabel(value: MaritalStatus | null | undefined): string {
  return MARITAL_STATUS.find((m) => m.value === value)?.label ?? '';
}

/** Placeholder del detalle por código de antecedente (seed de la tabla conditions). */
export const CONDITION_PLACEHOLDERS: Record<string, string> = {
  allergy: '¿A qué? Ej. penicilina, látex, anestesia',
  diabetes: 'Tipo y tratamiento',
  bleeding: 'Ej. sangrado prolongado tras extracción',
  blood_pressure: 'Alta o baja, ¿controlada?',
  gastric_ulcer: 'Detalle',
  heart_disease: 'Ej. arritmia, marcapasos',
  medication: '¿Cuál y dosis?',
  other_disease: '¿Cuál?',
  pregnant: 'Semanas de gestación',
};

export const FILE_KIND: Record<FileKind, { label: string; plural: string; tag: string; className: string }> = {
  xray: { label: 'Radiografía', plural: 'Radiografías', tag: 'RX', className: 'bg-xray text-xray-fg' },
  photo: { label: 'Foto intraoral', plural: 'Fotos intraorales', tag: 'FOTO', className: 'bg-pink-50 text-pink-800' },
  paper_record: { label: 'Formato en papel', plural: 'Formato en papel', tag: 'PAPEL', className: 'bg-paper text-ink-muted' },
  consent: { label: 'Consentimiento', plural: 'Consentimientos', tag: 'CONS.', className: 'bg-gold-50 text-gold-900' },
  other: { label: 'Otro archivo', plural: 'Otros', tag: 'OTRO', className: 'bg-surface-2 text-ink-muted' },
};

/** Filtros de la pestaña Archivos, en el orden del diseño. */
export const FILE_FILTERS: { value: FileKind | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'xray', label: 'Radiografías' },
  { value: 'photo', label: 'Fotos intraorales' },
  { value: 'paper_record', label: 'Formato en papel' },
];

export const STORAGE_BUCKET = 'patient-files';
export const SIGNED_URL_TTL = 60 * 60;
