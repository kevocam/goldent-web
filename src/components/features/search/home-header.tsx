import { ScanLine, UserPlus } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { UserMenu } from '@/components/shared/user-menu';
import { formatWeekdayDate, greeting } from '@/lib/format';

/** Inicio: fecha + saludo + Captura rápida / Nuevo paciente. En móvil, barra con logo. */
export function HomeHeader({ staffName, now = new Date() }: { staffName: string; now?: Date }) {
  return (
    <>
      <div className="flex items-center gap-2.5 md:hidden">
        <Logo compact className="flex-1" />
        <UserMenu name={staffName} size="sm" />
      </div>
      <div className="flex items-end gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="hidden text-[15px] font-semibold text-ink-muted md:block">{formatWeekdayDate(now)}</span>
          <h1 className="m-0 text-[26px] font-extrabold tracking-[-.02em] md:text-[28px]">
            <span className="md:hidden">Pacientes</span>
            <span className="hidden md:inline">{greeting(now)}, doctora</span>
          </h1>
        </div>
        <ButtonLink href="/captura" variant="secondary" className="hidden md:inline-flex">
          <ScanLine className="size-[22px]" aria-hidden />
          Captura rápida
        </ButtonLink>
        <ButtonLink href="/pacientes/nuevo" className="hidden md:inline-flex">
          <UserPlus className="size-[22px]" aria-hidden />
          Nuevo paciente
        </ButtonLink>
      </div>
    </>
  );
}
