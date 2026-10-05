'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { CircleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { login, type LoginState } from '@/lib/actions/auth';
import { PasswordInput } from './password-input';

/** F01 · Correo, contraseña, mantener sesión. */
export function LoginForm({ initialError }: { initialError?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, { error: initialError });

  return (
    <form action={action} className="flex flex-col gap-5">
      {state.error ? (
        <p role="alert" className="m-0 flex items-center gap-2 rounded-[14px] bg-alert-50 px-4 py-3 text-[15px] font-bold text-alert">
          <CircleAlert className="size-5 shrink-0" aria-hidden />
          {state.error}
        </p>
      ) : null}
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="field-label">
          Correo electrónico
        </label>
        <Input id="email" name="email" type="email" inputSize="lg" required autoComplete="email" placeholder="tucorreo@gmail.com" />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="field-label">
          Contraseña
        </label>
        <PasswordInput id="password" name="password" autoComplete="current-password" />
      </div>
      <label className="flex min-h-12 cursor-pointer items-center gap-3.5">
        <input type="checkbox" name="remember" defaultChecked className="m-0 size-7 accent-gold-700" />
        <span className="text-base font-semibold">Mantener la sesión iniciada en esta tablet</span>
      </label>
      <Button type="submit" size="lg" loading={pending} className="w-full">
        Entrar
      </Button>
      <Link href="/reset-password" className="flex min-h-11 items-center self-center text-base font-bold">
        ¿Olvidaste tu contraseña?
      </Link>
    </form>
  );
}
