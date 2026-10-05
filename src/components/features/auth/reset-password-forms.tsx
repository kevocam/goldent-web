'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { CircleAlert, CircleCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { requestPasswordReset, updatePassword, type ResetState } from '@/lib/actions/auth';
import { PasswordInput } from './password-input';

function Message({ state }: { state: ResetState }) {
  if (state.error)
    return (
      <p role="alert" className="m-0 flex items-center gap-2 rounded-[14px] bg-alert-50 px-4 py-3 text-[15px] font-bold text-alert">
        <CircleAlert className="size-5 shrink-0" aria-hidden />
        {state.error}
      </p>
    );
  return null;
}

/** Paso 1: pedir el correo de recuperación. */
export function ResetRequestForm() {
  const [state, action, pending] = useActionState<ResetState, FormData>(requestPasswordReset, {});

  if (state.sent) {
    return (
      <div className="flex flex-col gap-5">
        <p role="status" className="m-0 flex items-start gap-3 rounded-[14px] bg-ok-50 px-4 py-3.5 text-base font-bold text-ok-700">
          <CircleCheck className="mt-0.5 size-5 shrink-0" aria-hidden />
          Si el correo está registrado, te llegará un enlace para crear una nueva contraseña.
        </p>
        <Link href="/login" className="self-center text-base font-bold">
          Volver a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      <Message state={state} />
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="field-label">
          Correo electrónico
        </label>
        <Input id="email" name="email" type="email" inputSize="lg" required autoComplete="email" placeholder="tucorreo@gmail.com" />
      </div>
      <Button type="submit" size="lg" loading={pending} className="w-full">
        Enviar enlace
      </Button>
      <Link href="/login" className="flex min-h-11 items-center self-center text-base font-bold">
        Volver a iniciar sesión
      </Link>
    </form>
  );
}

/** Paso 2: definir la nueva contraseña (tras el enlace del correo). */
export function NewPasswordForm() {
  const [state, action, pending] = useActionState<ResetState, FormData>(updatePassword, {});
  return (
    <form action={action} className="flex flex-col gap-5">
      <Message state={state} />
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="field-label">
          Nueva contraseña
        </label>
        <PasswordInput id="password" name="password" autoComplete="new-password" />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="confirm" className="field-label">
          Repite la contraseña
        </label>
        <PasswordInput id="confirm" name="confirm" autoComplete="new-password" />
      </div>
      <Button type="submit" size="lg" loading={pending} className="w-full">
        Guardar contraseña
      </Button>
    </form>
  );
}
