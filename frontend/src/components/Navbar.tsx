'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { usePrivy } from '@privy-io/react-auth';
import { useEscrowContract } from '@/hooks/useEscrowContract';

const landingNavLinks = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'How It Works', href: '#how-it-works' },
  { name: 'Pricing', href: '#pricing' },
];

const appNavLinks = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'My Jobs', href: '/my-jobs' },
  { name: 'Find Talent', href: '/find-talent' },
  { name: 'Escrow Vault', href: '/escrow-vault' },
];

export default function Navbar() {
  const { userAddress, userProfile, logout: appLogout } = useAppContext();
  const { authenticated, login, logout: privyLogout } = usePrivy();
  const { isDemo } = useEscrowContract();
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  const navLinks = isLandingPage ? landingNavLinks : appNavLinks;

  const handleLogout = () => {
    appLogout();
    privyLogout();
  };

  const truncateAddress = (addr: string | null) => {
    if (!addr) return '0x0000...0000';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const role = userProfile?.role;

  return (
    <>
      {isDemo && (
        <div className="bg-amber-100 px-4 py-1.5 text-center text-xs font-semibold tracking-wide text-amber-900 border-b border-amber-200">
          🚧 DEMO MODE: No smart contract detected. Transactions will be simulated locally.
        </div>
      )}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href={authenticated ? '/dashboard' : '/'}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
              P
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900">Paradox</span>
          </Link>

          {isLandingPage && (
            <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          )}

          {!isLandingPage && (
            <div className="hidden items-center gap-8 md:flex">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-sm font-semibold transition-colors ${
                      isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-4">
            {!authenticated ? (
              <button
                onClick={() => login()}
                className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Log In / Sign Up
              </button>
            ) : (
              <>
                {role && (
                  <div className="hidden items-center gap-2 rounded-full border border-gray-200 bg-gray-100 px-3 py-1.5 sm:flex">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      Role
                    </span>
                    <span className="text-sm font-semibold text-slate-900">{role}</span>
                  </div>
                )}

                <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-slate-50 px-3 py-1.5 shadow-sm">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-sm font-semibold text-slate-700">
                    {truncateAddress(userAddress)}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-gray-300 hover:text-slate-900"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
