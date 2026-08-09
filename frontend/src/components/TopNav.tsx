'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { usePrivy } from '@privy-io/react-auth';

export default function TopNav() {
  const { userAddress, userProfile, logout: appLogout } = useAppContext();
  const { logout: privyLogout } = usePrivy();
  const pathname = usePathname();

  const handleLogout = () => {
    appLogout();
    privyLogout();
  };

  const truncateAddress = (addr: string | null) => {
    if (!addr) return '0x0000...0000';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const role = userProfile?.role;
  const navLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'My Jobs', href: '/my-jobs' },
    { name: 'Find Talent', href: '/find-talent' },
  ];

  const coinBalance = role === 'Client' ? '8,420.75' : '3,210.90';

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white shadow-sm">P</div>
            <div>
              <div className="text-base font-bold tracking-tight text-slate-900">Paradox</div>
            </div>
          </Link>

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
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 sm:flex">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Coin</span>
            <span className="text-sm font-semibold text-slate-900">{coinBalance}</span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 shadow-sm">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-sm font-semibold text-slate-700">{truncateAddress(userAddress)}</span>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
