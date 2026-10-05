'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { archivePatient } from '@/lib/actions/patients';
import { APP_HOME } from '@/lib/constants';

/** Soft delete con confirmación. El paciente deja de aparecer en el buscador. */
export function ArchivePatientButton({ patientId, name }: { patientId: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const toast = useToast();

  return (
    <>
      <Button variant="ghost" size="sm" className="text-alert hover:text-alert" onClick={() => setOpen(true)}>
        <Archive className="size-[18px]" aria-hidden />
        Archivar paciente
      </Button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        tone="danger"
        loading={pending}
        title="¿Archivar paciente?"
        description={`${name} dejará de aparecer en el buscador. Su historia no se borra y se puede recuperar desde la base de datos.`}
        confirmLabel="Archivar"
        onConfirm={() =>
          startTransition(async () => {
            const res = await archivePatient(patientId);
            if (!res.ok) {
              toast({ title: 'No se pudo archivar', description: res.error, tone: 'error' });
              return;
            }
            toast({ title: 'Paciente archivado', description: name });
            router.replace(APP_HOME);
          })
        }
      />
    </>
  );
}
