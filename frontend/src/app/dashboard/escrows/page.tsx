'use client';
import EscrowDashboard from '../../../components/EscrowDashboard';
import { useAppContext } from '@/context/AppContext';

export default function EscrowsPage() {
  const { userProfile } = useAppContext();
  const isClient = userProfile?.role === 'Client';

  return (
    <>
      <div className="bg-white rounded-[28px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-2">
          {isClient ? 'My Jobs' : 'My Gigs'}
        </h1>
        <p className="text-gray-500 font-medium tracking-tight">
          {isClient ? 'Manage your posted jobs and review deliverables.' : 'Track your active gigs and submit deliverables.'}
        </p>
      </div>
      
      <EscrowDashboard />
    </>
  );
}
