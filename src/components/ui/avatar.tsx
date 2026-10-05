import { cn } from '@/lib/cn';

const SIZES = {
  sm: 'size-11 text-[13px]',
  md: 'size-12 text-[15px]',
  lg: 'size-[52px] text-base',
  xl: 'size-14 text-[17px]',
  '2xl': 'size-16 text-[21px]',
};

export interface AvatarProps {
  initials: string;
  size?: keyof typeof SIZES;
  className?: string;
}

/** Círculo rosa con iniciales. Decorativo: el nombre siempre está al lado. */
export function Avatar({ initials, size = 'lg', className }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={cn('flex shrink-0 items-center justify-center rounded-full bg-pink-50 font-extrabold text-pink-800', SIZES[size], className)}
    >
      {initials}
    </span>
  );
}
