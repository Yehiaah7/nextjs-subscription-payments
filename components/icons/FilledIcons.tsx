import { ComponentProps } from 'react';

type IconProps = ComponentProps<'svg'>;

const baseProps = {
  viewBox: '0 0 24 24',
  fill: 'currentColor',
  'aria-hidden': 'true' as const
};

export function HomeFilledIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 3.2 3.75 10A1 1 0 0 0 4.4 11.8h1.1v7.45c0 .75.6 1.35 1.35 1.35h4.3v-5.1c0-.75.6-1.35 1.35-1.35h2.95c.75 0 1.35.6 1.35 1.35v5.1h4.3c.75 0 1.35-.6 1.35-1.35V11.8h1.1A1 1 0 0 0 20.25 10L12 3.2Z" />
    </svg>
  );
}

export function TrophyFilledIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M7 4.5A1.5 1.5 0 0 1 8.5 3h7A1.5 1.5 0 0 1 17 4.5V6h2a1 1 0 0 1 1 1c0 3.02-1.83 5.36-4.6 6.06A4.75 4.75 0 0 1 13.25 15v2h2.15a1 1 0 1 1 0 2h-6.8a1 1 0 1 1 0-2h2.15v-2a4.75 4.75 0 0 1-2.15-1.94C5.83 12.36 4 10.02 4 7a1 1 0 0 1 1-1h2V4.5Zm10 3.5v2.55c1.25-.53 2-1.65 2.2-2.55H17Zm-10 0H4.8c.2.9.95 2.02 2.2 2.55V8Z" />
    </svg>
  );
}

export function UserFilledIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 12.75a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2.25c-4.3 0-7.8 2.45-7.8 5.48 0 .42.35.77.78.77h14.04c.43 0 .78-.35.78-.77C19.8 17.45 16.3 15 12 15Z" />
    </svg>
  );
}

export function BellFilledIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 3.5a5.5 5.5 0 0 0-5.5 5.5v2.08c0 1.1-.4 2.16-1.13 2.98L4.3 15.3a1.2 1.2 0 0 0 .9 2h13.6a1.2 1.2 0 0 0 .9-2l-1.08-1.24A4.48 4.48 0 0 1 17.5 11V9A5.5 5.5 0 0 0 12 3.5Zm0 17.2a3 3 0 0 0 2.77-1.85h-5.54A3 3 0 0 0 12 20.7Z" />
    </svg>
  );
}

export function CheckCircleFilledIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 2.75A9.25 9.25 0 1 0 12 21.25 9.25 9.25 0 0 0 12 2.75Zm4.22 6.6a1 1 0 0 1 .03 1.4l-4.6 4.8a1 1 0 0 1-1.44.02l-2.44-2.43a1 1 0 0 1 1.41-1.42l1.72 1.72 3.9-4.07a1 1 0 0 1 1.42-.02Z" />
    </svg>
  );
}

export function FireFilledIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M13.1 2.9c.2 2.48-.68 3.7-1.93 5.15-1.4 1.62-3.02 3.5-3.02 6.25a3.85 3.85 0 1 0 7.7 0c0-1.62-.78-2.96-1.72-4.2-.86-1.16-1.73-2.37-1.03-4.8Zm-1.22 18.35a5.95 5.95 0 0 1-5.93-5.95c0-3.56 2.03-5.9 3.66-7.8 1.56-1.8 2.63-3.04 1.83-6.1a.95.95 0 0 1 1.6-.95c.56.55.95 1.08 1.28 1.59.4.61.72 1.22 1.01 1.8.73 1.44 1.28 2.72 2.35 4.15 1.14 1.52 2.52 3.55 2.52 6.31a5.95 5.95 0 0 1-5.92 5.95Z" />
    </svg>
  );
}

export function XFilledIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 2.75A9.25 9.25 0 1 0 12 21.25 9.25 9.25 0 0 0 12 2.75Zm2.88 12.13a1 1 0 0 1-1.41 1.42L12 14.83l-1.47 1.47a1 1 0 1 1-1.41-1.42L10.58 13l-1.46-1.47a1 1 0 1 1 1.41-1.41L12 11.59l1.47-1.47a1 1 0 1 1 1.41 1.41L13.42 13l1.46 1.88Z" />
    </svg>
  );
}

export function RocketFilledIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M14.8 3.1c2.86-.67 5.43 1.9 4.76 4.77-.73 3.14-2.64 5.84-5.43 7.68l-2.67 1.76a1.4 1.4 0 0 1-1.89-.25l-2.63-2.63a1.4 1.4 0 0 1-.25-1.9l1.76-2.66A13.67 13.67 0 0 1 14.8 3.1Zm-1.3 4.1a1.7 1.7 0 1 0 3.4 0 1.7 1.7 0 0 0-3.4 0Zm-7.62 8.05 1.96 1.96-2.49 2.48a1 1 0 0 1-1.41-1.41l1.94-3.03Z" />
    </svg>
  );
}

export function ChevronRightFilledIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M9.2 5.2a1 1 0 0 1 1.4 0l5.5 5.6a1.7 1.7 0 0 1 0 2.4l-5.5 5.6a1 1 0 1 1-1.4-1.42l4.73-4.8-4.73-4.78a1 1 0 0 1 0-1.42Z" />
    </svg>
  );
}

export function ChevronLeftFilledIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M14.8 5.2a1 1 0 0 0-1.4 0l-5.5 5.6a1.7 1.7 0 0 0 0 2.4l5.5 5.6a1 1 0 1 0 1.4-1.42l-4.73-4.8 4.73-4.78a1 1 0 0 0 0-1.42Z" />
    </svg>
  );
}

export function ChevronDownFilledIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M5.2 8.8a1 1 0 0 1 1.4 0L12 14.2l5.4-5.4a1 1 0 0 1 1.4 1.4l-6.2 6.2a.85.85 0 0 1-1.2 0l-6.2-6.2a1 1 0 0 1 0-1.4Z" />
    </svg>
  );
}

export function ArrowLeftFilledIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M10.2 5a1 1 0 0 1 0 1.4L6.9 9.7H20a1 1 0 1 1 0 2H6.9l3.3 3.3a1 1 0 1 1-1.4 1.4l-5-5a1.5 1.5 0 0 1 0-2.1l5-5a1 1 0 0 1 1.4 0Z" />
    </svg>
  );
}

export function UsersFilledIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M9.4 12.4a3.45 3.45 0 1 0 0-6.9 3.45 3.45 0 0 0 0 6.9Zm6.1-1.4a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6Zm0 1.6c-1.06 0-2.03.24-2.84.67a6.7 6.7 0 0 1 2.8 3.85h3.3c.4 0 .72-.33.67-.72-.24-2.23-1.97-3.8-3.93-3.8Zm-6.1 1.1c-2.66 0-4.83 1.58-5.16 3.81-.05.4.27.73.67.73h8.98c.4 0 .72-.33.67-.73-.33-2.23-2.5-3.8-5.16-3.8Z" />
    </svg>
  );
}

export function ListFilledIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M5.5 7.25A1.25 1.25 0 1 0 5.5 9.75 1.25 1.25 0 0 0 5.5 7.25Zm0 3.5a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Zm0 3.5a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5ZM9 8.5c0-.55.45-1 1-1h8a1 1 0 1 1 0 2h-8a1 1 0 0 1-1-1Zm1 3.5a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-8Zm-1 4.5c0-.55.45-1 1-1h8a1 1 0 1 1 0 2h-8a1 1 0 0 1-1-1Z" />
    </svg>
  );
}

export function ClockFilledIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 2.75A9.25 9.25 0 1 0 12 21.25 9.25 9.25 0 0 0 12 2.75Zm.9 4.75a.9.9 0 1 0-1.8 0v4.55c0 .3.15.57.4.74l3 2.02a.9.9 0 0 0 1-1.5L12.9 11.6V7.5Z" />
    </svg>
  );
}

export function TargetFilledIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 2.75A9.25 9.25 0 1 0 12 21.25 9.25 9.25 0 0 0 12 2.75Zm0 2A7.25 7.25 0 1 1 12 19.25 7.25 7.25 0 0 1 12 4.75Zm0 2.8A4.45 4.45 0 1 0 12 16.45 4.45 4.45 0 0 0 12 7.55Zm0 2.15a2.3 2.3 0 1 1 0 4.6 2.3 2.3 0 0 1 0-4.6Z" />
    </svg>
  );
}


export function AlarmFilledIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M7.35 2.95a1 1 0 0 1 0 1.4L5.42 6.28a1 1 0 1 1-1.4-1.4l1.93-1.93a1 1 0 0 1 1.4 0Zm10.7 0 1.93 1.93a1 1 0 0 1-1.4 1.4l-1.93-1.93a1 1 0 1 1 1.4-1.4ZM12 5.1a7.15 7.15 0 1 0 0 14.3 7.15 7.15 0 0 0 0-14.3Zm0 1.9a5.25 5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5Zm.9 2.25a.9.9 0 1 0-1.8 0v3.55c0 .32.17.62.44.78l2.1 1.25a.9.9 0 0 0 .92-1.55l-1.66-.99V9.25Z" />
    </svg>
  );
}

export function ArrowPathFilledIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12.1 3a8.9 8.9 0 0 1 6.35 2.63l.95-.95a.9.9 0 1 1 1.27 1.27l-2.6 2.6a.9.9 0 0 1-1.27 0l-2.6-2.6a.9.9 0 0 1 1.27-1.27l.7.7A7.1 7.1 0 0 0 4.96 10a.9.9 0 1 1-1.78-.3A8.9 8.9 0 0 1 12.1 3Zm8.72 11.3a8.9 8.9 0 0 1-15.27 4.05l-.95.95a.9.9 0 1 1-1.27-1.27l2.6-2.6a.9.9 0 0 1 1.27 0l2.6 2.6a.9.9 0 0 1-1.27 1.27l-.7-.7A7.1 7.1 0 0 0 19.04 14a.9.9 0 0 1 1.78.3Z" />
    </svg>
  );
}

export function CrownFilledIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M4.5 7.5a1.5 1.5 0 0 1 2.85-.65L9.7 10.8a1.3 1.3 0 0 0 2.27-.06l1.6-3.05a1.5 1.5 0 0 1 2.74.06l1.68 3.2a1.5 1.5 0 0 1-1.33 2.2H7.2a1.5 1.5 0 0 1-1.34-.83l-1.2-2.4A1.5 1.5 0 0 1 4.5 7.5Zm1.35 7.35c0-.58.47-1.05 1.05-1.05h10.2a1.05 1.05 0 1 1 0 2.1H6.9c-.58 0-1.05-.47-1.05-1.05Z" />
    </svg>
  );
}

export function CalendarFilledIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M7.5 3.5a1 1 0 0 1 1 1V6h7V4.5a1 1 0 1 1 2 0V6h.8A2.7 2.7 0 0 1 21 8.7v9.8a2.7 2.7 0 0 1-2.7 2.7H5.7A2.7 2.7 0 0 1 3 18.5V8.7A2.7 2.7 0 0 1 5.7 6h.8V4.5a1 1 0 0 1 1-1Zm11.5 7H5v8a.7.7 0 0 0 .7.7h12.6a.7.7 0 0 0 .7-.7v-8Z" />
    </svg>
  );
}

export function MedalFilledIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M7.5 2.8h3.4l1.1 3.4L9.7 10H6.3L4 6.2l1.1-3.4h2.4Zm5.6 0h3.4l2.4 3.4-2.4 3.8h-3.4L10.9 6.2l2.2-3.4ZM12 11.2a5.25 5.25 0 1 0 0 10.5 5.25 5.25 0 0 0 0-10.5Zm-.6 2.25a.6.6 0 0 1 1.2 0v1.6h1.6a.6.6 0 0 1 0 1.2h-1.6v1.6a.6.6 0 0 1-1.2 0v-1.6h-1.6a.6.6 0 1 1 0-1.2h1.6v-1.6Z" />
    </svg>
  );
}

export function GlobeFilledIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 2.75A9.25 9.25 0 1 0 12 21.25 9.25 9.25 0 0 0 12 2.75Zm-6.6 8.3h2.6c.1-1.45.45-2.78.98-3.86A7.47 7.47 0 0 0 5.4 11.05Zm3.58 1.9h6.04c-.1 1.36-.42 2.6-.9 3.6A11.83 11.83 0 0 1 12 16.8c-.77 0-1.47-.09-2.12-.25-.49-1-.8-2.24-.9-3.6Zm0-1.9c.1-1.36.42-2.6.9-3.6.65-.16 1.35-.25 2.12-.25s1.47.1 2.12.25c.49 1 .8 2.24.9 3.6H8.98Zm6.04 1.9h2.58a7.47 7.47 0 0 1-3.58 3.86c.53-1.08.88-2.41 1-3.86Zm2.58-1.9h-2.58c-.12-1.45-.47-2.78-1-3.86a7.47 7.47 0 0 1 3.58 3.86Zm-8.62 5.76A7.47 7.47 0 0 1 5.4 12.95h2.6c.12 1.45.47 2.78.98 3.86Z" />
    </svg>
  );
}

export function ShieldCheckFilledIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 2.75c1.92 1.77 4.25 2.79 6.9 3.06a1 1 0 0 1 .9 1v5.64c0 4.34-2.58 6.97-7.2 8.8a1.5 1.5 0 0 1-1.2 0c-4.62-1.83-7.2-4.46-7.2-8.8V6.8a1 1 0 0 1 .9-.99C7.75 5.54 10.08 4.52 12 2.75Zm3.07 6.78a.95.95 0 0 0-1.34.04l-2.53 2.7-1.12-1.11a.95.95 0 0 0-1.34 1.34l1.82 1.82c.37.37.98.36 1.35-.02l3.2-3.43a.95.95 0 0 0-.04-1.34Z" />
    </svg>
  );
}

export function BadgeCheckFilledIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 2.75c1.1 0 2.11.56 2.7 1.48.29.45.78.77 1.31.85 1.08.17 2 1.04 2.32 2.09.15.5.53.9 1.01 1.1 1 .4 1.66 1.39 1.66 2.48 0 1.1-.66 2.08-1.66 2.49-.48.2-.86.6-1 1.1-.34 1.04-1.25 1.9-2.33 2.08a1.9 1.9 0 0 0-1.3.85 3.21 3.21 0 0 1-5.42 0 1.9 1.9 0 0 0-1.3-.85c-1.08-.17-2-1.04-2.33-2.09-.15-.49-.52-.89-1-1.1A2.68 2.68 0 0 1 3 10.75c0-1.1.66-2.08 1.66-2.49.48-.2.86-.6 1.01-1.1.33-1.04 1.24-1.9 2.32-2.08.53-.08 1.02-.4 1.31-.86A3.2 3.2 0 0 1 12 2.75Zm2.8 6.52a1 1 0 0 0-1.42 0l-2.54 2.53-1.23-1.23a1 1 0 0 0-1.41 1.41l1.94 1.95a1 1 0 0 0 1.41 0l3.25-3.24a1 1 0 0 0 0-1.42Z" />
    </svg>
  );
}
