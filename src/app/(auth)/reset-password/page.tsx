import type { Metadata } from 'next';
import { ResetRequestForm } from '@/components/features/auth/reset-password-forms';

export const metadata: Metadata = { title: 'Recuperar contraseña' };

export default function ResetPasswordPage() {
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="m-0 text-[32px] font-extrabold tracking-[-.02em]">Recuperar contraseña</h1>
        <p className="m-0 text-base font-medium text-ink-muted">Te enviaremos un enlace para crear una nueva.</p>
      </div>
      <ResetRequestForm />
    </>
  );
}
