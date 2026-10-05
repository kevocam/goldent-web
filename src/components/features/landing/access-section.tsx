import { Lock } from 'lucide-react';
import { LoginForm } from '@/components/features/auth/login-form';

/** Acceso al sistema desde la landing. Reusa el mismo formulario de /login. */
export function AccessSection() {
  return (
    <section id="acceso" className="scroll-mt-4 border-t border-line-card bg-surface">
      <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-4 py-14 md:grid-cols-2 md:px-10 md:py-[88px]">
        <div className="flex max-w-[460px] flex-col gap-3.5">
          <span className="inline-flex items-center gap-2 text-[13px] font-extrabold tracking-[.16em] text-ink-muted uppercase">
            <Lock className="size-4" aria-hidden />
            Solo personal del consultorio
          </span>
          <h2 className="m-0 text-[clamp(26px,3vw,34px)] leading-[1.15] font-extrabold tracking-[-.02em]">Acceso al sistema de historias clínicas</h2>
          <p className="m-0 text-base leading-relaxed font-medium text-ink-muted">¿Eres paciente? No necesitas una cuenta: reserva y consulta todo por WhatsApp.</p>
        </div>
        <div className="w-full max-w-[480px] rounded-3xl border border-line-card bg-bg p-6 md:justify-self-end md:p-8">
          <LoginForm />
        </div>
      </div>
    </section>
  );
}
