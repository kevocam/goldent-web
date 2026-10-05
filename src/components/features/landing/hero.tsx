import { MapPin, MessageCircle } from 'lucide-react';
import { ButtonAnchor, buttonClasses } from '@/components/ui/button';
import { LogoMark } from '@/components/ui/logo';
import { CLINIC, clinicMapsUrl, clinicPhoneLabel, clinicWhatsappUrl } from '@/lib/clinic';
import { HeroDiamonds } from './hero-diamonds';

/** Hero: lo que distingue al consultorio + reservar por WhatsApp. */
export function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden bg-pink-25">
      <HeroDiamonds />
      <div className="relative mx-auto grid max-w-[1200px] items-center gap-12 px-4 py-14 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:px-10 md:py-24">
        <div className="flex flex-col items-start gap-6">
          <span className="inline-flex min-h-8 items-center rounded-full border border-pink-200 bg-surface px-3.5 text-[13px] font-extrabold tracking-[.06em] text-pink-800 uppercase">
            Consultorio odontológico · {CLINIC.city}
          </span>
          <h1 className="m-0 text-[clamp(36px,5.2vw,60px)] leading-[1.05] font-extrabold tracking-[-.03em] text-balance">
            Una sola doctora que conoce toda tu historia.
          </h1>
          <p className="m-0 max-w-[540px] text-[clamp(17px,1.6vw,20px)] leading-relaxed font-medium text-pretty text-ink-muted">
            En GOLDENT te atiende siempre la misma odontóloga. Antes de empezar ya sabe qué tratamientos te hizo, qué quedó pendiente y si
            tienes alguna alergia, porque tu historia clínica está guardada y a la mano.
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonAnchor variant="whatsapp" size="lg" href={clinicWhatsappUrl()} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-[22px]" aria-hidden />
              Reservar cita por WhatsApp
            </ButtonAnchor>
            <a href="#servicios" className={buttonClasses('secondary', 'lg')}>
              Ver servicios
            </a>
          </div>
          <a
            href={clinicMapsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 text-[15px] font-bold text-ink no-underline hover:text-gold-700"
          >
            <MapPin className="size-5 text-gold-700" aria-hidden />
            {CLINIC.address}, {CLINIC.city}
          </a>
        </div>

        {/* Sin fotos todavía: tarjeta de marca con el isotipo. */}
        <div className="relative flex min-h-[300px] items-center justify-center md:min-h-[440px]">
          <div className="gd-float flex w-[min(100%,380px)] flex-col items-center gap-5 rounded-[28px] border border-pink-200 bg-surface/90 px-8 py-12 text-center shadow-[0_24px_60px_rgba(138,63,99,.12)] backdrop-blur-sm">
            <LogoMark size={148} />
            <div className="flex flex-col gap-1.5">
              <span className="text-[28px] leading-none font-extrabold tracking-[.14em] text-gold-700">GOLDENT</span>
              <span className="text-[11px] font-bold tracking-[.28em] text-ink-muted">CONSULTORIO ODONTOLÓGICO</span>
            </div>
          </div>
          <a
            href={clinicWhatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-2 left-0 hidden items-center gap-3 rounded-[18px] md:flex bg-surface py-3.5 pr-[18px] pl-3.5 text-ink no-underline shadow-[0_14px_34px_rgba(17,17,17,.12)] md:bottom-6"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-whatsapp text-white">
              <MessageCircle className="size-[22px]" aria-hidden />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-[15px] font-extrabold">Reserva por WhatsApp</span>
              <span className="tabular text-[13px] font-bold text-ink-muted">{clinicPhoneLabel()}</span>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
