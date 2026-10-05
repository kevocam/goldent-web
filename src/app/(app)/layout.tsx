import { redirect } from 'next/navigation';
import { AppShell } from '@/components/shared/app-shell';
import { getStaffSession } from '@/lib/data/session';

/** Toda la app autenticada. Sin fila activa en staff → fuera. */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getStaffSession();
  if (!session) redirect('/auth/signout');
  return <AppShell session={{ clinicId: session.clinicId, staffName: session.staffName }}>{children}</AppShell>;
}
