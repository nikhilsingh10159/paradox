'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import TopNav from '../../components/TopNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userAddress, userProfile } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!userAddress) {
      router.push('/');
    }
  }, [userAddress, router]);

  if (!userAddress) return <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center"><div className="w-8 h-8 border-2 border-gray-400 border-t-black rounded-full animate-spin"></div></div>;

  const role = userProfile?.role;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      {role === 'Client' && <div className="h-1 w-full bg-sky-600" />}
      {role === 'Freelancer' && <div className="h-1 w-full bg-violet-600" />}
      <TopNav />
      <main className="mx-auto w-full max-w-7xl flex-grow px-6 py-10 lg:px-8">
        <div className="space-y-10">{children}</div>
      </main>
    </div>
  );
}
