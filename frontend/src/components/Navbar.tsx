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
  { name: 'Messages', href: '/messages' },
];

export default function Navbar() {
  const { userAddress, userProfile, updateProfile, logout: appLogout } = useAppContext();
  const { authenticated, login, logout: privyLogout, user } = usePrivy();
  const { isDemo } = useEscrowContract();
  const pathname = usePathname();

  const [isEditingName, setIsEditingName] = React.useState(false);
  const [customNameInput, setCustomNameInput] = React.useState('');
  const [hasPrompted, setHasPrompted] = React.useState(true);

  const isLandingPage = pathname === '/';
  const navLinks = authenticated ? appNavLinks : (isLandingPage ? landingNavLinks : appNavLinks);

  // Check if handle prompt was already dismissed for this wallet
  React.useEffect(() => {
    if (typeof window !== 'undefined' && userAddress) {
      const dismissed = localStorage.getItem(`paradox_name_dismissed_${userAddress}`);
      setHasPrompted(dismissed === 'true');
    }
  }, [userAddress]);

  // Prompt user ONCE for display username if authenticated, handle is empty, and not dismissed
  React.useEffect(() => {
    if (authenticated && userAddress && userProfile && !userProfile.handle && !hasPrompted && !isEditingName) {
      const defaultName = user?.email?.address ? user.email.address.split('@')[0] : '';
      setCustomNameInput(defaultName);
      setIsEditingName(true);
    }
  }, [authenticated, userAddress, userProfile, hasPrompted, isEditingName, user?.email?.address]);

  const handleLogout = () => {
    appLogout();
    privyLogout();
  };

  const handleDismissPrompt = () => {
    if (typeof window !== 'undefined' && userAddress) {
      localStorage.setItem(`paradox_name_dismissed_${userAddress}`, 'true');
    }
    setHasPrompted(true);
    setIsEditingName(false);
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = customNameInput.trim().replace(/^@/, '');
    if (cleanName) {
      updateProfile({ handle: cleanName });
      handleDismissPrompt();
    }
  };

  const truncateAddress = (addr: string | null) => {
    if (!addr) return '0x0000...0000';
    if (!addr.startsWith('0x') && addr.includes('@')) {
      return addr;
    }
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // User identity label: User Handle > User Email > Truncated Hex Address
  const userHandle = userProfile?.handle;
  const displayLabel = userHandle
    ? `@${userHandle}`
    : user?.email?.address
      ? user.email.address
      : truncateAddress(userAddress || user?.wallet?.address || null);

  const currentRole = userProfile?.role || 'Client';

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

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-semibold transition-colors ${
                    isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

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
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Role
                  </span>
                  <select
                    value={currentRole}
                    onChange={(e) => updateProfile({ role: e.target.value as 'Client' | 'Freelancer' })}
                    className="bg-transparent text-sm font-semibold text-slate-900 focus:outline-none cursor-pointer"
                  >
                    <option value="Client">Client</option>
                    <option value="Freelancer">Freelancer</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCustomNameInput(userProfile?.handle || '');
                    setIsEditingName(true);
                  }}
                  title="Click to change your display username"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 shadow-xs transition hover:border-slate-300 hover:bg-slate-100"
                >
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-sm font-semibold text-slate-800">
                    {displayLabel}
                  </span>
                  <span className="text-xs text-slate-400">✏️</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-600 transition hover:border-gray-300 hover:text-slate-900"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Display Name Modal Prompt */}
      {isEditingName && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-1">Choose Your Display Name</h3>
            <p className="text-xs font-medium text-slate-500 mb-5">
              Enter the username or handle you want shown across Paradox instead of your email or address.
            </p>

            <form onSubmit={handleSaveName} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Display Username
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">@</span>
                  <input
                    type="text"
                    required
                    value={customNameInput}
                    onChange={(e) => setCustomNameInput(e.target.value)}
                    placeholder="alex_builder"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-3 text-sm font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDismissPrompt}
                  className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  {userProfile?.handle ? 'Cancel' : 'Remind Me Later'}
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-700 shadow-sm"
                >
                  Save Username
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
