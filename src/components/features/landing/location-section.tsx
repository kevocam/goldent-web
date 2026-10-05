import { MessageCircle, Navigation } from 'lucide-react';
import { ButtonAnchor } from '@/components/ui/button';
import { CLINIC, clinicMapsEmbedUrl, clinicMapsUrl, clinicPhoneLabel, clinicWhatsappUrl } from '@/lib/clinic';

/** Dirección, horario (si ya lo tenemos) y mapa de Google. */
export function LocationSection() {
  return (
    <section id="ubicacion" className="scroll-mt-4 bg-bg">
      <div className="mx-auto grid max-w-[1200px] items-stretch gap-6 px-4 py-14 md:grid-cols-2 md:px-10 md:py-24">
        <div className="flex flex-col gap-[22px] rounded-3xl border border-line-card bg-surface p-6 md:p-9">
          <span className="text-[13px] font-extrabold tracking-[.16em] text-gold-700 uppercase">Ubicación y horario</span>
          <div className="flex flex-col gap-2">
            <h2 className="m-0 text-[clamp(28px,3.2vw,38px)] leading-[1.15] font-extrabold tracking-[-.02em]">{CLINIC.address}</h2>
            <p className="m-0 text-[17px] font-semibold text-ink-muted">
              {CLINIC.city}, Perú{CLINIC.reference ? ` · ${CLINIC.reference}` : ''}
            </p>
          </div>

          {CLINIC.hours ? (
            <dl className="m-0 flex flex-col">
              {CLINIC.hours.map((h) => (
                <div key={h.days} className="flex justify-between gap-4 border-t border-line-soft py-3.5 last:border-b">
                  <dt className="text-base font-bold">{h.days}</dt>
                  <dd className="tabular m-0 text-base font-bold text-ink-muted">{h.hours}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="m-0 border-t border-line-soft pt-4 text-base font-semibold text-ink-muted">Consulta el horario de atención por WhatsApp.</p>
          )}

          <div className="mt-auto flex flex-wrap gap-3">
            <ButtonAnchor variant="whatsapp" size="lg" href={clinicWhatsappUrl()} target="_blank" rel="noopener noreferrer" className="tabular">
              <MessageCircle className="size-5" aria-hidden />
              {clinicPhoneLabel()}
            </ButtonAnchor>
            <ButtonAnchor variant="secondary" size="lg" href={clinicMapsUrl()} target="_blank" rel="noopener noreferrer">
              <Navigation className="size-5" aria-hidden />
              Cómo llegar
            </ButtonAnchor>
          </div>
        </div>

        <div className="min-h-[360px] overflow-hidden rounded-3xl border border-line-paper bg-surface-2">
          <iframe
            title={`Mapa: ${CLINIC.fullName}, ${CLINIC.address}, ${CLINIC.city}`}
            src={clinicMapsEmbedUrl()}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="block h-full min-h-[360px] w-full border-0"
          />
        </div>
      </div>
    </section>
  );
}
