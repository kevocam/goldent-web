import type { Metadata } from 'next';
import { AccessSection } from '@/components/features/landing/access-section';
import { CareSection } from '@/components/features/landing/care-section';
import { DoctorSection } from '@/components/features/landing/doctor-section';
import { Hero } from '@/components/features/landing/hero';
import { LocationSection } from '@/components/features/landing/location-section';
import { ServicesSection } from '@/components/features/landing/services-section';
import { SiteFooter } from '@/components/features/landing/site-footer';
import { SiteHeader } from '@/components/features/landing/site-header';
import { CLINIC } from '@/lib/clinic';

const description = `Consultorio odontológico en ${CLINIC.city}: restauraciones, endodoncia, prótesis, ortodoncia, implantes y más. ${CLINIC.address}. Reserva tu cita por WhatsApp.`;

export const metadata: Metadata = {
  title: { absolute: `${CLINIC.fullName} · Dentista en ${CLINIC.city}` },
  description,
  // El sistema no se indexa (layout raíz); la landing sí.
  robots: { index: true, follow: true },
  openGraph: {
    title: `${CLINIC.fullName} · ${CLINIC.city}`,
    description,
    type: 'website',
    locale: 'es_PE',
    siteName: CLINIC.fullName,
  },
};

/** Datos estructurados para Google (ficha de negocio local). Solo datos reales. */
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Dentist',
  name: CLINIC.fullName,
  telephone: `+51${CLINIC.whatsapp}`,
  address: {
    '@type': 'PostalAddress',
    streetAddress: CLINIC.address,
    addressLocality: CLINIC.city,
    addressRegion: CLINIC.region,
    addressCountry: CLINIC.country,
  },
  geo: { '@type': 'GeoCoordinates', latitude: CLINIC.geo.lat, longitude: CLINIC.geo.lng },
};

/** Landing pública (/). El sistema vive en /inicio. */
export default function LandingPage() {
  return (
    <div className="landing min-h-dvh bg-surface text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main>
        <Hero />
        <ServicesSection />
        <CareSection />
        <DoctorSection />
        <LocationSection />
        <AccessSection />
      </main>
      <SiteFooter />
    </div>
  );
}
