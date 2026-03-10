'use client';

import { Eye, EyeOff } from 'lucide-react';
import { InputHTMLAttributes, ReactNode, useEffect, useRef, useState } from 'react';

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  containerClassName?: string;
  inputClassName?: string;
  leftIcon?: ReactNode;
  iconClassName?: string;
};

export default function PasswordField({
  containerClassName = '',
  inputClassName = '',
  leftIcon,
  iconClassName = '',
  ...inputProps
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  const [wasFocused, setWasFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selection || !inputRef.current) {
      return;
    }

    const node = inputRef.current;
    node.focus({ preventScroll: true });
    node.setSelectionRange(selection.start, selection.end);
    setSelection(null);
  }, [isVisible, selection]);

  const toggleVisibility = () => {
    const node = inputRef.current;

    if (node) {
      setWasFocused(document.activeElement === node);
      setSelection({
        start: node.selectionStart ?? node.value.length,
        end: node.selectionEnd ?? node.value.length
      });
    }

    setIsVisible((prev) => !prev);
  };

  useEffect(() => {
    if (!wasFocused || !inputRef.current) {
      return;
    }

    inputRef.current.focus({ preventScroll: true });
    setWasFocused(false);
  }, [isVisible, wasFocused]);

  return (
    <div className={containerClassName}>
      {leftIcon}
      <input
        {...inputProps}
        ref={inputRef}
        type={isVisible ? 'text' : 'password'}
        className={inputClassName}
      />
      <button
        type="button"
        onClick={toggleVisibility}
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        aria-pressed={isVisible}
        className="grid h-5 w-5 place-items-center"
      >
        {isVisible ? (
          <EyeOff className={iconClassName} aria-hidden="true" />
        ) : (
          <Eye className={iconClassName} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
