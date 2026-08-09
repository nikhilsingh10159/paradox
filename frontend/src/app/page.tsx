'use client';

import { useGatedAction } from '@/hooks/useGatedAction';
import { usePrivy } from '@privy-io/react-auth';
import { useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import EscrowDashboard from '@/components/EscrowDashboard';
import HeroSection from '@/components/HeroSection';
import FeaturedGrid from '@/components/FeaturedGrid';
import FeaturesSection from '@/components/FeaturesSection';
import HowItWorks from '@/components/HowItWorks';

export default function Home() {
  const { handleGatedAction } = useGatedAction();
  const { ready, authenticated, user } = usePrivy();
  const { login: appLogin } = useAppContext();

  useEffect(() => {
    if (ready && authenticated && user) {
      const address =
        user.email?.address ||
        user.wallet?.address ||
        user.google?.email ||
        user.github?.username ||
        'Unknown';
      appLogin(address);
    }
  }, [ready, authenticated, user, appLogin]);

  const handlePostJob = () => {
    handleGatedAction(() => {
      console.log('Opening post job modal');
    });
  };

  const handleExploreTalent = () => {
    document.getElementById('showcase')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-7xl px-6 lg:px-8">
        <HeroSection onPostJob={handlePostJob} onExploreTalent={handleExploreTalent} />

        {authenticated && (
          <section className="mb-16">
            <EscrowDashboard />
          </section>
        )}

        <FeaturedGrid />

        <FeaturesSection />

        <HowItWorks />

        <section id="pricing" className="mt-24 scroll-mt-24 pb-24">
          <div className="text-center">
            <span className="inline-block rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
              TRANSPARENT PRICING
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900">Simple Pricing</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-500">
              No subscriptions. No hidden charges. Pay only when work is completed.
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-4xl font-extrabold text-slate-900">
              2.5<span className="text-2xl text-slate-500">%</span>
            </p>
            <p className="mt-2 font-semibold text-slate-900">Platform fee per contract</p>
            <p className="mt-3 text-sm text-slate-500">
              Funds are released from escrow only after milestone approval — you stay in control
              every step of the way.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
