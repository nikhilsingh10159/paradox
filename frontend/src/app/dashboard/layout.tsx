'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import TopNav from '../../components/TopNav';
import ProfileSidebar from '../../components/ProfileSidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userAddress } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!userAddress) {
      router.push('/');
    }
  }, [userAddress, router]);

  if (!userAddress) return <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center"><div className="w-8 h-8 border-2 border-gray-400 border-t-black rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-gray-900 font-sans">
      <TopNav />
      <main className="max-w-7xl mx-auto py-12 px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <ProfileSidebar />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
