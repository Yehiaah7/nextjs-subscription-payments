import { PropsWithChildren } from 'react';

export default function HomeLayout({ children }: PropsWithChildren) {
  return (
    <>
      <div
        data-layout-marker="true"
        className="fixed left-2 top-2 z-[9999] rounded bg-black/80 px-2 py-1 text-[10px] font-semibold text-white"
      >
        LAYOUT_MARKER: app/(tabs)/home/layout.tsx | BUILD_STAMP: 2026-03-10-xx
      </div>
      {children}
    </>
  );
}
