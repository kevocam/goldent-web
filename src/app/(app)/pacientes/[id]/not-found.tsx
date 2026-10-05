import { UserX } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { APP_HOME } from '@/lib/constants';

export default function PatientNotFound() {
  return (
    <main className="flex flex-1 flex-col px-4 py-8 md:px-8">
      <EmptyState
        icon={UserX}
        title="No encontramos a este paciente"
        description="Puede que haya sido archivado o que el enlace no sea correcto."
        actions={<ButtonLink href={APP_HOME}>Volver a Pacientes</ButtonLink>}
        className="md:mx-auto md:w-full md:max-w-xl"
      />
    </main>
  );
}
