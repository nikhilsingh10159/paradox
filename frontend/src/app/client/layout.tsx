'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { userAddress, userProfile } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!userAddress) {
      router.push('/');
    } else if (userProfile.role && userProfile.role !== 'Client') {
      router.push('/dashboard');
    }
  }, [userAddress, userProfile.role, router]);

  if (!userAddress) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="h-1 w-full bg-blue-600" />
      {children}
    </div>
  );
}
