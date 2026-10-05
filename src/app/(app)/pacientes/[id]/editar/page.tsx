import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PatientForm } from '@/components/features/patient-form/patient-form';
import { getPatient, getPatientConditions } from '@/lib/data/patients';
import { fullName } from '@/lib/format';

export const metadata: Metadata = { title: 'Editar paciente' };

/** F04 · Edición. `#antecedentes` lleva directo a esa sección. */
export default async function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [patient, conditions] = await Promise.all([getPatient(id), getPatientConditions(id)]);
  if (!patient) notFound();

  return (
    <main className="flex flex-1 flex-col">
      <PatientForm
        mode="edit"
        patientId={id}
        recordLabel={`${fullName(patient)} · ${patient.record_number}`}
        conditions={conditions}
        cancelHref={`/pacientes/${id}`}
        defaultValues={{
          first_names: patient.first_names,
          last_names: patient.last_names,
          dni: patient.dni ?? '',
          birth_date: patient.birth_date ?? '',
          phone: patient.phone ?? '',
          email: patient.email ?? '',
          address: patient.address ?? '',
          occupation: patient.occupation ?? '',
          marital_status: patient.marital_status,
        }}
      />
    </main>
  );
}
