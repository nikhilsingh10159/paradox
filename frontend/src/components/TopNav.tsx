'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';

export default function TopNav() {
  const { userAddress, logout } = useAppContext();
  const pathname = usePathname();

  const truncateAddress = (addr: string | null) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const navLinks = [
    { name: 'Home', href: '/dashboard' },
    { name: 'Escrows', href: '/dashboard/escrows' },
    { name: 'Network', href: '/dashboard/network' },
  ];

  return (
    <nav className="bg-white/70 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center font-semibold text-white text-sm">in</div>
              <span className="font-semibold text-lg text-gray-900 tracking-tight">Web3 Hub</span>
            </Link>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link 
                    key={link.name}
                    href={link.href} 
                    className={`inline-flex items-center text-sm font-medium tracking-tight transition-colors border-b-2 ${
                      isActive 
                        ? 'border-black text-gray-900' 
                        : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-gray-900 text-sm font-medium tracking-tight">
              {truncateAddress(userAddress)}
            </button>
            <button onClick={logout} className="text-[#0066CC] hover:text-[#004C99] text-sm font-medium tracking-tight transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
