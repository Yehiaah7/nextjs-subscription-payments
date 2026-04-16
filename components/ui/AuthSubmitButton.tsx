'use client';

import { Loader2 } from 'lucide-react';
import { ComponentPropsWithoutRef, ReactNode } from 'react';
import { useFormStatus } from 'react-dom';
import { MotionButton } from '@/components/motion';
import { cn } from '@/utils/cn';

type AuthSubmitButtonProps = Omit<ComponentPropsWithoutRef<typeof MotionButton>, 'children'> & {
  children: ReactNode;
};

export default function AuthSubmitButton({
  children,
  className,
  disabled,
  ...props
}: AuthSubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <MotionButton
      type="submit"
      disabled={isDisabled}
      aria-disabled={isDisabled}
      className={cn('inline-flex items-center justify-center', className)}
      {...props}
    >
      <span>{children}</span>
      <span className="ml-2 grid h-4 w-4 place-items-center" aria-hidden="true">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="h-4 w-4" />}
      </span>
    </MotionButton>
  );
}
