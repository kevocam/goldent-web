'use client';

import { CircleAlert, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from './empty-state';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

/** Usado por los error.tsx de cada ruta. */
export function ErrorState({
  title = 'No pudimos cargar esta pantalla',
  description = 'Revisa la conexión e inténtalo otra vez. No se perdió ningún dato.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <EmptyState
      icon={CircleAlert}
      tone="alert"
      title={title}
      description={description}
      className={className}
      actions={
        onRetry ? (
          <Button onClick={onRetry} className="w-full sm:w-auto">
            <RotateCw className="size-5" aria-hidden />
            Reintentar
          </Button>
        ) : undefined
      }
    />
  );
}
