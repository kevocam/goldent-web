import type { Metadata } from 'next';
import { LoginForm } from '@/components/features/auth/login-form';

export const metadata: Metadata = { title: 'Iniciar sesión' };

const ERRORS: Record<string, string> = {
  'sin-acceso': 'Tu cuenta no tiene acceso al consultorio.',
  'enlace-invalido': 'El enlace expiró o no es válido. Pide uno nuevo.',
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="m-0 text-[32px] font-extrabold tracking-[-.02em]">Iniciar sesión</h1>
        <p className="m-0 text-base font-medium text-ink-muted">Ingresa con la cuenta del consultorio.</p>
      </div>
      <LoginForm initialError={error ? ERRORS[error] : undefined} />
    </>
  );
}
