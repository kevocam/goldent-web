import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { NewPasswordForm } from '@/components/features/auth/reset-password-forms';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Nueva contraseña' };

export default async function NewPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?error=enlace-invalido');

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="m-0 text-[32px] font-extrabold tracking-[-.02em]">Nueva contraseña</h1>
        <p className="m-0 text-base font-medium text-ink-muted">Mínimo 8 caracteres.</p>
      </div>
      <NewPasswordForm />
    </>
  );
}
