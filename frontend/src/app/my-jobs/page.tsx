'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import EscrowDashboard from '@/components/EscrowDashboard';

export default function MyJobsPage() {
  const { userProfile } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (userProfile?.role === 'Client') {
      router.replace('/client');
    }
  }, [userProfile?.role, router]);

  if (userProfile?.role === 'Client') {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <header className="mb-8 rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Operations</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">My Gigs</h1>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
             Review workflow and milestone releases across all active contracts.
            </div>
          </div>
        </header>

        <EscrowDashboard />
      </main>
    </div>
  );
}
