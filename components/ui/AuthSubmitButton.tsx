'use client';

import { ComponentPropsWithoutRef, ReactNode } from 'react';
import FormLoadingButton from '@/components/ui/FormLoadingButton';

type AuthSubmitButtonProps = Omit<ComponentPropsWithoutRef<typeof FormLoadingButton>, 'children'> & {
  children: ReactNode;
};

export default function AuthSubmitButton({ children, ...props }: AuthSubmitButtonProps) {
  return <FormLoadingButton {...props}>{children}</FormLoadingButton>;
}
