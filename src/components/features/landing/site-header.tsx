import Link from 'next/link';
import { Lock, MessageCircle } from 'lucide-react';
import { ButtonAnchor, buttonClasses } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { CLINIC, clinicWhatsappUrl } from '@/lib/clinic';

/** Encabezado de la landing: logo, secciones, Ingresar y Reservar cita. */
export function SiteHeader() {
  const links = [
    { href: '#servicios', label: 'Servicios' },
    ...(CLINIC.doctor ? [{ href: '#doctora', label: 'La doctora' }] : []),
    { href: '#ubicacion', label: 'Ubicación' },
  ];

  return (
    <header className="border-b border-line-card bg-surface">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-4 gap-y-3 px-4 py-4 md:gap-x-7 md:px-10">
        <Link href="/" aria-label="GOLDENT, inicio" className="no-underline">
          <Logo className="hidden sm:flex [&_svg]:size-11" />
          <Logo compact className="sm:hidden" />
        </Link>
        <nav aria-label="Secciones" className="hidden flex-1 justify-center gap-1 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="flex min-h-11 items-center px-3 text-[15px] font-bold text-ink no-underline hover:text-gold-700">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex gap-2.5 md:ml-0">
          <a href="#acceso" className={buttonClasses('secondary', 'sm')}>
            <Lock className="size-[18px]" aria-hidden />
            Ingresar
          </a>
          <ButtonAnchor variant="whatsapp" size="sm" href={clinicWhatsappUrl()} target="_blank" rel="noopener noreferrer" className="max-sm:hidden">
            <MessageCircle className="size-[18px]" aria-hidden />
            Reservar cita
          </ButtonAnchor>
        </div>
      </div>
    </header>
  );
}
