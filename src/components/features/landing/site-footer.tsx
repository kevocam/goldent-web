import { LogoMark } from '@/components/ui/logo';
import { CLINIC, clinicMapsUrl, clinicPhoneLabel, clinicWhatsappUrl } from '@/lib/clinic';

export function SiteFooter() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-4 pt-12 pb-8 md:px-10">
        <div className="flex flex-wrap justify-between gap-7">
          <div className="flex items-center gap-3">
            <LogoMark size={40} />
            <span className="flex flex-col gap-1">
              <span className="text-xl leading-none font-extrabold tracking-[.14em] text-gold-500">GOLDENT</span>
              <span className="text-[10px] font-bold tracking-[.26em] text-line">CONSULTORIO ODONTOLÓGICO</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-x-10 gap-y-3 text-[15px] font-semibold">
            <a href={clinicMapsUrl()} target="_blank" rel="noopener noreferrer" className="text-line no-underline hover:text-white">
              {CLINIC.address}, {CLINIC.city}, Perú
            </a>
            <a href={clinicWhatsappUrl()} target="_blank" rel="noopener noreferrer" className="tabular text-line no-underline hover:text-white">
              WhatsApp {clinicPhoneLabel()}
            </a>
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-3 border-t border-white/15 pt-6 text-sm font-semibold text-line">
          <span>© {new Date().getFullYear()} {CLINIC.fullName}</span>
          <a href="#acceso" className="font-bold text-pink-200">
            Acceso del consultorio
          </a>
        </div>
      </div>
    </footer>
  );
}
