'use client';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';

export default function Home() {
  const { ready, authenticated, login: privyLogin, logout: privyLogout, user } = usePrivy();
  const { login: appLogin, hasProfile } = useAppContext();
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isRouting, setIsRouting] = useState(false);

  useEffect(() => {
    if (ready && authenticated && user && !isRouting) {
      setIsRouting(true);
      const address = user.email?.address || user.wallet?.address || user.google?.email || user.github?.username || 'Unknown';
      const exists = hasProfile(address);
      const intent = typeof window !== 'undefined' ? sessionStorage.getItem('authIntent') : null;

      if (intent === 'login') {
        if (exists) {
          appLogin(address);
          sessionStorage.removeItem('authIntent');
          router.push('/dashboard');
        } else {
          privyLogout();
          setAuthError('Account not found. Please sign up first.');
          sessionStorage.removeItem('authIntent');
          setIsRouting(false);
        }
      } else if (intent === 'signup') {
        appLogin(address);
        sessionStorage.removeItem('authIntent');
        if (exists) {
          router.push('/dashboard');
        } else {
          router.push('/onboarding');
        }
      } else {
        // Auto-routing for returning users (e.g. they refreshed the page)
        appLogin(address);
        if (exists) {
          router.push('/dashboard');
        } else {
          router.push('/onboarding');
        }
      }
    }
  }, [ready, authenticated, user, hasProfile, appLogin, router, privyLogout, isRouting]);

  const handleAuth = (intent: 'login' | 'signup') => {
    setAuthError(null);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('authIntent', intent);
    }
    privyLogin();
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <div className="text-gray-500 font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-10 text-center">
        <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center font-semibold text-white text-2xl mx-auto mb-6">in</div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-2">Web3 Hub</h1>
        <p className="text-gray-500 font-medium tracking-tight mb-8">Connect your wallet or social account to get started.</p>
        
        {authError && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
            {authError}
          </div>
        )}

        <div className="space-y-4">
          <button 
            onClick={() => handleAuth('login')}
            className="w-full bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-2xl font-semibold tracking-tight transition-colors"
          >
            Log In
          </button>
          
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-100"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">or</span>
            <div className="flex-grow border-t border-gray-100"></div>
          </div>

          <button 
            onClick={() => handleAuth('signup')}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 px-8 py-4 rounded-2xl font-semibold tracking-tight transition-colors"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}