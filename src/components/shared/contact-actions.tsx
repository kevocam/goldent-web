import { MessageCircle, Phone } from 'lucide-react';
import { ButtonAnchor } from '@/components/ui/button';
import { telUrl, whatsappUrl } from '@/lib/contact';
import { cn } from '@/lib/cn';
import { formatPhone } from '@/lib/format';

export interface ContactActionsProps {
  phone: string | null;
  name: string;
  /** "icon": solo íconos 52×52 (filas compactas). "full": con texto. "stretch": ocupan el ancho (móvil). */
  variant?: 'icon' | 'full' | 'stretch';
  /** Mensaje prellenado de WhatsApp (recordatorios). */
  message?: string;
  /** En móvil el botón Llamar muestra el número. */
  showNumber?: boolean;
  className?: string;
}

/** WhatsApp (siempre verde) + Llamar (siempre secundario). Deshabilitados sin celular. */
export function ContactActions({ phone, name, variant = 'full', message, showNumber, className }: ContactActionsProps) {
  const disabled = !phone;
  const iconOnly = variant === 'icon';
  const common = { disabled, size: iconOnly ? ('icon' as const) : ('md' as const), className: cn(variant === 'stretch' && 'flex-1') };

  return (
    <div className={cn('flex shrink-0 gap-2.5', variant === 'stretch' && 'w-full', className)}>
      <ButtonAnchor
        {...common}
        variant="whatsapp"
        href={phone ? whatsappUrl(phone, message) : undefined}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={iconOnly ? `WhatsApp a ${name}` : undefined}
        title={disabled ? 'Sin celular registrado' : undefined}
      >
        <MessageCircle className="size-5" aria-hidden />
        {iconOnly ? null : 'WhatsApp'}
      </ButtonAnchor>
      <ButtonAnchor
        {...common}
        variant="secondary"
        href={phone ? telUrl(phone) : undefined}
        aria-label={iconOnly ? `Llamar a ${name}` : undefined}
        title={disabled ? 'Sin celular registrado' : undefined}
      >
        <Phone className="size-5" aria-hidden />
        {iconOnly ? null : showNumber && phone ? formatPhone(phone) : 'Llamar'}
      </ButtonAnchor>
    </div>
  );
}
