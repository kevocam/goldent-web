/**
 * Datos de ejemplo para /dev/* (solo desarrollo). Copian los del diseño
 * para comparar pantalla a pantalla sin conectar Supabase.
 */
import type { AgendaAppointment, AppointmentStatus, FileWithUrl, Patient, PatientCard, PatientCondition, Service, VisitWithTreatments } from '@/types/domain';

const now = '2026-10-05T14:00:00Z';
const clinic = '00000000-0000-0000-0000-00000000c111';
const uid = (n: number) => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`;

export const fxPatientCards: PatientCard[] = [
  { id: uid(1), record_number: 'HC-00248', legacy_record_number: null, first_names: 'Rosa Elvira', last_names: 'Quispe Mamani', dni: '41827365', phone: '951284736', age: 47, alerts: ['Alergia: penicilina', 'Diabetes', 'Presión alta'], last_visit: '2026-09-28' },
  { id: uid(2), record_number: 'HC-00251', legacy_record_number: null, first_names: 'Luis Alberto', last_names: 'Huamán Ccama', dni: '72451983', phone: '987105342', age: 34, alerts: [], last_visit: '2026-10-02' },
  { id: uid(3), record_number: 'HC-00250', legacy_record_number: null, first_names: 'María Fernanda', last_names: 'Torres Salazar', dni: '70318426', phone: '964773019', age: 29, alerts: ['Embarazada'], last_visit: '2026-10-01' },
  { id: uid(4), record_number: 'HC-00197', legacy_record_number: null, first_names: 'Jorge Luis', last_names: 'Mendoza Apaza', dni: '29561840', phone: '958402117', age: 61, alerts: ['Enfermedad cardiaca', 'Recibe medicamento'], last_visit: '2026-09-30' },
  { id: uid(5), record_number: 'HC-00243', legacy_record_number: '0187', first_names: 'Carmen Rosa', last_names: 'Condori Flores', dni: '40976215', phone: '973618254', age: 52, alerts: [], last_visit: '2026-09-26' },
  { id: uid(6), record_number: 'HC-00249', legacy_record_number: null, first_names: 'Diego Armando', last_names: 'Paredes Vilca', dni: '76840193', phone: null, age: 17, alerts: [], last_visit: '2026-09-25' },
];

export const fxSearchResults: PatientCard[] = [fxPatientCards[0]!, { ...fxPatientCards[0]!, id: uid(7), record_number: 'HC-00236', first_names: 'Ana Sofía', last_names: 'Quispe Ramos', dni: '73905418', phone: '986214590', age: 24, alerts: [], last_visit: '2026-07-04' }];

export const fxPatient: Patient = {
  id: uid(1),
  clinic_id: clinic,
  record_number: 'HC-00248',
  legacy_record_number: '0152',
  first_names: 'Rosa Elvira',
  last_names: 'Quispe Mamani',
  dni: '41827365',
  birth_date: '1979-03-14',
  sex: 'F',
  phone: '951284736',
  email: 'rosa.quispe79@gmail.com',
  address: 'Calle Mercaderes 418, Cercado, Arequipa',
  occupation: 'Comerciante',
  marital_status: 'casado',
  notes: null,
  deleted_at: null,
  created_by: null,
  created_at: '2025-03-03T15:00:00Z',
  updated_at: now,
};

export const fxAlerts = ['Alergia: penicilina', 'Diabetes', 'Presión alta / baja', 'Recibe medicamento'];

const cond = (code: string, label: string, active: boolean, detail: string | null, i: number): PatientCondition => ({
  conditionId: uid(100 + i),
  code,
  label,
  active,
  detail,
  updatedAt: active ? '2026-09-28T15:00:00Z' : null,
});

export const fxConditions: PatientCondition[] = [
  cond('allergy', 'Alergias', true, 'Penicilina: urticaria generalizada', 1),
  cond('diabetes', 'Diabetes', true, 'Tipo 2 · metformina 850 mg', 2),
  cond('bleeding', 'Hemorragias', false, null, 3),
  cond('blood_pressure', 'Presión alta / baja', true, 'Presión alta, controlada', 4),
  cond('gastric_ulcer', 'Úlcera gástrica', false, null, 5),
  cond('heart_disease', 'Enfermedad cardiaca', false, null, 6),
  cond('medication', 'Recibe medicamento', true, 'Metformina 850 mg, losartán 50 mg', 7),
  cond('other_disease', 'Otra enfermedad', false, null, 8),
  cond('pregnant', 'Embarazada', false, null, 9),
];

const svc = (n: number, name: string) => ({ id: uid(200 + n), name });
const tr = (n: number, visit: number, service: { id: string; name: string }, tooth: string | null, status: 'planned' | 'in_progress' | 'done') => ({
  id: uid(300 + n),
  clinic_id: clinic,
  patient_id: uid(1),
  visit_id: uid(400 + visit),
  service_id: service.id,
  service,
  tooth,
  status,
  notes: null,
  deleted_at: null,
  created_by: null,
  created_at: `2026-09-0${n}T10:00:00Z`,
  updated_at: now,
});
const visit = (n: number, date: string, reason: string, notes: string, treatments: ReturnType<typeof tr>[]): VisitWithTreatments => ({
  id: uid(400 + n),
  clinic_id: clinic,
  patient_id: uid(1),
  appointment_id: null,
  visit_date: date,
  reason,
  notes,
  deleted_at: null,
  created_by: null,
  created_at: `${date}T15:00:00Z`,
  updated_at: now,
  treatments,
});

export const fxVisits: VisitWithTreatments[] = [
  visit(1, '2026-09-28', 'Dolor en molar inferior derecho', 'Apertura cameral y conductometría. Medicación intraconducto con hidróxido de calcio. Refiere dolor a la percusión.', [
    tr(1, 1, svc(5, 'Endodoncia multirradicular'), '46', 'in_progress'),
    tr(2, 1, svc(18, 'Rayos X'), '46', 'done'),
  ]),
  visit(2, '2026-09-14', 'Control y limpieza', 'Sangrado leve al sondaje en sector anteroinferior. Se refuerza técnica de cepillado.', [
    tr(3, 2, svc(11, 'Profilaxis'), null, 'done'),
    tr(4, 2, svc(12, 'Destartraje'), null, 'done'),
  ]),
  visit(3, '2026-07-22', 'Caries en premolares', 'Pieza 15 queda pendiente por tiempo. Sensibilidad al frío.', [
    tr(5, 3, svc(1, 'Resina simple'), '24', 'done'),
    tr(6, 3, svc(2, 'Resina compuesta'), '15', 'planned'),
  ]),
];

const file = (n: number, kind: FileWithUrl['kind'], caption: string | null, created: string, page: number | null = null): FileWithUrl => ({
  id: uid(500 + n),
  clinic_id: clinic,
  patient_id: uid(1),
  visit_id: null,
  treatment_id: null,
  kind,
  storage_path: `${clinic}/${uid(1)}/${uid(500 + n)}.webp`,
  mime_type: 'image/webp',
  size_bytes: 300000,
  page_number: page,
  caption,
  taken_at: null,
  deleted_at: null,
  created_by: null,
  created_at: created,
  url: null,
});

export const fxFiles: FileWithUrl[] = [
  file(1, 'xray', 'Pieza 46 · inicial', '2026-09-28T15:00:00Z'),
  file(2, 'xray', 'Pieza 46 · conductometría', '2026-09-28T15:10:00Z'),
  file(3, 'photo', 'Arcada inferior', '2026-09-14T15:00:00Z'),
  file(4, 'photo', 'Vista frontal', '2026-09-14T15:05:00Z'),
  file(5, 'paper_record', null, '2025-03-03T15:00:00Z', 1),
  file(6, 'paper_record', null, '2025-03-03T15:00:00Z', 2),
];

type Svc = Pick<Service, 'id' | 'name' | 'category' | 'requires_tooth' | 'sort_order'>;
const s = (n: number, name: string, category: string, requires_tooth: boolean): Svc => ({ id: uid(200 + n), name, category, requires_tooth, sort_order: n });

export const fxServices: Svc[] = [
  s(1, 'Resina simple', 'Restauraciones', true),
  s(2, 'Resina compuesta', 'Restauraciones', true),
  s(3, 'Resina compleja', 'Restauraciones', true),
  s(4, 'Endodoncia unirradicular', 'Endodoncia', true),
  s(5, 'Endodoncia multirradicular', 'Endodoncia', true),
  s(6, 'Biopulpotomía', 'Endodoncia', true),
  s(7, 'Perno', 'Prótesis', true),
  s(8, 'Prótesis fija', 'Prótesis', false),
  s(9, 'Prótesis parcial removible', 'Prótesis', false),
  s(10, 'Prótesis total', 'Prótesis', false),
  s(11, 'Profilaxis', 'Prevención y estética', false),
  s(12, 'Destartraje', 'Prevención y estética', false),
  s(13, 'Blanqueamiento dental', 'Prevención y estética', false),
  s(14, 'Cirugía bucal', 'Cirugía', false),
  s(15, 'Implantes', 'Cirugía', true),
  s(16, 'Ortodoncia inicial', 'Ortodoncia', false),
  s(17, 'Ortodoncia mensualidad', 'Ortodoncia', false),
  s(18, 'Rayos X', 'Diagnóstico y otros', false),
  s(19, 'Otros', 'Diagnóstico y otros', false),
];

export const fxSession = { clinicId: clinic, staffName: 'Dra. Goldent' };

/** Semana del 5 al 10 de octubre de 2026 (como design/screens/11 y 12). */
const ap = (n: number, date: string, time: string, minutes: number, patient: number, reason: string, status: AppointmentStatus): AgendaAppointment => {
  const p = fxPatientCards[patient]!;
  const starts = new Date(`${date}T${time}:00-05:00`);
  return {
    id: uid(900 + n),
    patient_id: p.id,
    starts_at: starts.toISOString(),
    ends_at: new Date(starts.getTime() + minutes * 60000).toISOString(),
    status,
    reason,
    notes: null,
    patient: { id: p.id, first_names: p.first_names, last_names: p.last_names, record_number: p.record_number, dni: p.dni, phone: p.phone, age: p.age, alerts: p.alerts },
  };
};

export const fxAppointments: AgendaAppointment[] = [
  ap(1, '2026-10-05', '09:00', 45, 4, 'Profilaxis', 'done'),
  ap(2, '2026-10-05', '10:00', 45, 5, 'Ortodoncia · mensualidad', 'no_show'),
  ap(3, '2026-10-05', '11:30', 60, 1, 'Resina compuesta · pieza 36', 'confirmed'),
  ap(4, '2026-10-05', '16:00', 45, 2, 'Control', 'scheduled'),
  ap(5, '2026-10-06', '09:30', 90, 3, 'Prótesis fija', 'scheduled'),
  ap(6, '2026-10-06', '09:45', 30, 4, 'Control', 'scheduled'),
  ap(7, '2026-10-07', '17:00', 45, 4, 'Control', 'cancelled'),
  ap(8, '2026-10-08', '10:30', 90, 0, 'Continuación de endodoncia', 'confirmed'),
  ap(9, '2026-10-09', '12:00', 60, 2, 'Profilaxis', 'scheduled'),
  ap(10, '2026-10-10', '09:00', 90, 3, 'Prótesis fija', 'scheduled'),
];
