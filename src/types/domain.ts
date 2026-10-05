import type { Database } from './database';

type Tables = Database['public']['Tables'];

export type Patient = Tables['patients']['Row'];
export type Visit = Tables['visits']['Row'];
export type Treatment = Tables['treatments']['Row'];
export type Service = Tables['services']['Row'];
export type Condition = Tables['conditions']['Row'];
export type PatientFile = Tables['files']['Row'];

export type TreatmentStatus = Treatment['status'];
export type AppointmentStatus = Tables['appointments']['Row']['status'];
export type FileKind = PatientFile['kind'];
export type MaritalStatus = NonNullable<Patient['marital_status']>;

/** Lo que devuelven las RPC search_patients y recent_patients. */
export interface PatientCard {
  id: string;
  record_number: string;
  legacy_record_number: string | null;
  first_names: string;
  last_names: string;
  dni: string | null;
  phone: string | null;
  age: number | null;
  alerts: string[];
  last_visit: string | null;
}

/** Antecedente del catálogo con el estado del paciente. */
export interface PatientCondition {
  conditionId: string;
  code: string;
  label: string;
  active: boolean;
  detail: string | null;
  updatedAt: string | null;
}

export interface TreatmentWithService extends Treatment {
  service: Pick<Service, 'id' | 'name'>;
}

export interface VisitWithTreatments extends Visit {
  treatments: TreatmentWithService[];
}

export interface FileWithUrl extends PatientFile {
  url: string | null;
}

/** Tratamiento en edición dentro de Nueva visita (aún no guardado). */
export interface DraftTreatment {
  key: string;
  serviceId: string;
  serviceName: string;
  teeth: string[];
  wholeMouth: boolean;
  status: TreatmentStatus;
  notes?: string;
}

/** Resultado estándar de las Server Actions. */
export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };
