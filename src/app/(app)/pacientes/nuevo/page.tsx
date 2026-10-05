import type { Metadata } from 'next';
import { PatientForm } from '@/components/features/patient-form/patient-form';
import { getNextRecordNumber, getPatientConditions } from '@/lib/data/patients';
import type { PatientFormValues } from '@/lib/schemas/patient';

export const metadata: Metadata = { title: 'Nuevo paciente' };

type Search = { nombre?: string; dni?: string; celular?: string };

/** Prellenado desde "Crear paciente" en una búsqueda sin resultados. */
function prefill({ nombre, dni, celular }: Search): Partial<PatientFormValues> {
  const values: Partial<PatientFormValues> = {};
  if (dni) values.dni = dni.replace(/\D/g, '').slice(0, 8);
  if (celular) values.phone = celular.replace(/\D/g, '').slice(0, 9);
  if (nombre) {
    // Se suele buscar por apellidos ("Vargas Ttito"): 1-2 palabras van a apellidos.
    const words = nombre.trim().split(/\s+/);
    if (words.length <= 2) values.last_names = words.join(' ');
    else values.first_names = words.join(' ');
  }
  return values;
}

/** F04 · Nuevo paciente. */
export default async function NewPatientPage({ searchParams }: { searchParams: Promise<Search> }) {
  const [search, conditions, next] = await Promise.all([searchParams, getPatientConditions(), getNextRecordNumber()]);
  return (
    <main className="flex flex-1 flex-col">
      <PatientForm
        mode="create"
        recordLabel={`${next} · se asigna automáticamente`}
        conditions={conditions}
        defaultValues={prefill(search)}
        cancelHref="/"
      />
    </main>
  );
}
