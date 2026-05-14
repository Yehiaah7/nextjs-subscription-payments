import {
  buttonMotion,
  cardMotion,
  chipMotion,
  inputMotion,
  tapMotion
} from '@/lib/motion';

export const focusRingInteractive =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent';

export const btnInteractive = `${buttonMotion} active:brightness-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:brightness-100 disabled:hover:brightness-100`;

export const btnInteractiveColored =
  'hover:brightness-[0.94] active:brightness-[0.96] disabled:hover:brightness-100';

export const btnInteractiveNeutral = 'hover:bg-blue-50';

export const primaryCtaButton = `${btnInteractive} ${btnInteractiveColored} ${focusRingInteractive} h-12 rounded-2xl bg-blue-600 px-10 text-sm font-extrabold uppercase tracking-[0.14em] text-white`;

export const cardInteractive = cardMotion;

export const inputInteractive = inputMotion;

export const tabInteractive = `${chipMotion} hover:bg-blue-50`;

export const iconBtnInteractive = `${tapMotion} transition-colors hover:bg-blue-50`;
