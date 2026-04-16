'use client';

import { ComponentPropsWithoutRef, ReactNode } from 'react';
import { useFormStatus } from 'react-dom';
import LoadingButton from '@/components/ui/LoadingButton';

type FormLoadingButtonProps = Omit<ComponentPropsWithoutRef<typeof LoadingButton>, 'children' | 'loading'> & {
  children: ReactNode;
};

export default function FormLoadingButton({ children, disabled, ...props }: FormLoadingButtonProps) {
  const { pending } = useFormStatus();

  return (
    <LoadingButton type="submit" loading={pending} disabled={disabled} {...props}>
      {children}
    </LoadingButton>
  );
}
