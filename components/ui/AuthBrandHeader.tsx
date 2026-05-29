import Link from 'next/link';

export default function AuthBrandHeader() {
  return (
    <header className="hidden h-[64px] shrink-0 items-center border-b border-border bg-white px-6 md:flex">
      <Link
        href="/home"
        className="flex items-center gap-3 rounded-[20px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
        aria-label="Product Gym home"
      >
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-[15px] font-black tracking-[-0.04em] text-white shadow-sm shadow-primary/20">
          PG
        </div>
        <div>
          <p className="text-[18px] font-black tracking-[-0.04em] text-[var(--color-ink)]">
            Product Gym
          </p>
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-primary">
            PM practice floor
          </p>
        </div>
      </Link>
    </header>
  );
}
