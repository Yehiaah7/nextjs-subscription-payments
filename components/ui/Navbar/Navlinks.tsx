'use client';

import Link from 'next/link';
import { useState } from 'react';
import { SignOut } from '@/utils/auth-helpers/server';
import { handleRequest } from '@/utils/auth-helpers/client';
import Logo from '@/components/icons/Logo';
import { usePathname, useRouter } from 'next/navigation';
import { getRedirectMethod } from '@/utils/auth-helpers/settings';
import LoadingButton from '@/components/ui/LoadingButton';
import s from './Navbar.module.css';

interface NavlinksProps {
  user?: any;
}

export default function Navlinks({ user }: NavlinksProps) {
  const router = getRedirectMethod() === 'client' ? useRouter() : null;
  const [isSigningOut, setIsSigningOut] = useState(false);
  const pathname = usePathname();

  return (
    <div className="relative flex flex-row justify-between py-4 align-center md:py-6">
      <div className="flex items-center flex-1">
        <Link href="/home" className={s.logo} aria-label="Logo">
          <Logo />
        </Link>
        <nav className="ml-6 space-x-2 lg:block">
          <Link href="/home" className={s.link}>
            Home
          </Link>
          {user && (
            <Link href="/account" className={s.link}>
              Account
            </Link>
          )}
        </nav>
      </div>
      <div className="flex justify-end space-x-8">
        {user ? (
          <form
            onSubmit={async (e) => {
              setIsSigningOut(true);
              try {
                await handleRequest(e, SignOut, router);
              } finally {
                setIsSigningOut(false);
              }
            }}
          >
            <input type="hidden" name="pathName" value={pathname} />
            <LoadingButton type="submit" loading={isSigningOut} className={s.link}>
              Sign out
            </LoadingButton>
          </form>
        ) : (
          <Link href="/login" className={s.link}>
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
}
