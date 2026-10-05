import type { HTMLAttributes, ElementType } from 'react';
import { cn } from '@/lib/cn';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
}

/** Superficie blanca con borde suave y radio 20 px. */
export function Card({ as: Tag = 'div', className, ...props }: CardProps) {
  return <Tag className={cn('rounded-[20px] border border-line-card bg-surface', className)} {...props} />;
}
