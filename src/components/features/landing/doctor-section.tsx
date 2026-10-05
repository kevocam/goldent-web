import { MessageCircle, UserRound } from 'lucide-react';
import { ButtonAnchor } from '@/components/ui/button';
import { CLINIC, clinicWhatsappUrl } from '@/lib/clinic';

/** La doctora. No se muestra hasta tener su nombre en lib/clinic.ts. */
export function DoctorSection() {
  const doctor = CLINIC.doctor;
  if (!doctor) return null;

  return (
    <section id="doctora" className="scroll-mt-4 bg-surface">
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-4 py-14 md:grid-cols-2 md:px-10 md:py-24">
        <div className="flex aspect-square w-full max-w-[480px] items-center justify-center rounded-[28px] bg-pink-50 text-pink-800">
          <UserRound className="size-24" strokeWidth={1.2} aria-hidden />
        </div>
        <div className="flex flex-col gap-[18px]">
          <span className="text-[13px] font-extrabold tracking-[.16em] text-gold-700 uppercase">La doctora</span>
          <h2 className="m-0 text-[clamp(30px,3.6vw,42px)] leading-[1.1] font-extrabold tracking-[-.02em]">{doctor.name}</h2>
          {doctor.cop ? (
            <span className="inline-flex min-h-9 items-center self-start rounded-full border border-gold-100 bg-gold-50 px-3.5 text-sm font-extrabold text-gold-900">
              Cirujana dentista · COP {doctor.cop}
            </span>
          ) : null}
          {doctor.bio ? <p className="m-0 text-[17px] leading-relaxed font-medium text-ink-muted">{doctor.bio}</p> : null}
          <ButtonAnchor variant="whatsapp" size="lg" href={clinicWhatsappUrl()} target="_blank" rel="noopener noreferrer" className="self-start">
            <MessageCircle className="size-5" aria-hidden />
            Escribirle por WhatsApp
          </ButtonAnchor>
        </div>
      </div>
    </section>
  );
}
