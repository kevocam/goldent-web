import { SearchX } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-bg p-6">
      <EmptyState
        icon={SearchX}
        title="Esta página no existe"
        description="Revisa el enlace o vuelve al inicio."
        actions={<ButtonLink href="/">Ir al inicio</ButtonLink>}
        className="w-full max-w-lg"
      />
    </main>
  );
}
