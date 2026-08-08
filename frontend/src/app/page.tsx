'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';

export default function LoginPage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [showGooglePopup, setShowGooglePopup] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const router = useRouter();
  const { login } = useAppContext();

  const handleGoogleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowGooglePopup(true);
  };

  const handleAccountSelect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail.trim()) return;
    setIsConnecting(true);
    setShowGooglePopup(false);
    // Simulate auth delay processing the chosen account
    setTimeout(() => {
      login(googleEmail);
      if (authMode === 'signup') {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    }, 1500);
  };

  const handleGitHubClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setTimeout(() => {
      login(`github_user_${Math.floor(Math.random() * 1000)}`);
      if (authMode === 'signup') {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-6 relative">
      
      {/* Central Content */}
      <div className="w-full max-w-lg flex flex-col items-center text-center mb-12">
        <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center font-semibold text-white text-3xl mb-8 shadow-sm">
          in
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 mb-4">
          Web3 Hub. Pro escrow.
        </h1>
        <p className="text-lg md:text-xl text-gray-500 font-medium tracking-tight max-w-md">
          Build your on-chain reputation and secure zero-fee escrows.
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-[400px] bg-white p-8 md:p-10 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 mb-1">
            {authMode === 'login' ? 'Sign In' : 'Create Account'}
          </h2>
          <p className="text-sm text-gray-500 font-medium tracking-tight">
            {authMode === 'login' ? 'Welcome back to your dashboard.' : 'Join the professional network.'}
          </p>
        </div>

        <div className="space-y-4">
          <button 
            type="button"
            onClick={handleGoogleClick}
            disabled={isConnecting}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 p-4 rounded-2xl font-medium tracking-tight transition-colors disabled:opacity-70 shadow-sm"
          >
            {isConnecting && !showGooglePopup ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>
          
          <button 
            type="button"
            onClick={handleGitHubClick}
            disabled={isConnecting}
            className="w-full flex items-center justify-center gap-3 bg-[#24292F] hover:bg-[#1b1f23] text-white p-4 rounded-2xl font-medium tracking-tight transition-colors disabled:opacity-70 shadow-sm"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"></path></svg>
            Continue with GitHub
          </button>
        </div>

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-gray-500 text-sm font-medium tracking-tight">
            {authMode === 'login' ? "Not registered yet?" : "Already have an account?"}
            <button 
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="text-[#0066CC] hover:text-[#004C99] ml-2 font-semibold transition-colors"
            >
              {authMode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <p className="text-center text-gray-400 text-xs font-medium tracking-tight mt-6 px-4">
          By continuing, you agree to our <a href="#" className="text-gray-600 underline hover:text-black">Terms of Service</a>.
        </p>
      </div>

      {/* Simulated Google OAuth Popup Modal */}
      {showGooglePopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col relative animate-in fade-in zoom-in duration-200">
            {/* Google Header */}
            <div className="p-8 pb-4 text-center">
              <svg className="w-12 h-12 mx-auto mb-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <h2 className="text-[24px] font-normal text-[#202124]">Sign in</h2>
              <p className="text-[16px] text-[#202124] mt-2 font-medium">to continue to Web3 Hub</p>
            </div>
            
            {/* Account Input Form */}
            <form onSubmit={handleAccountSelect} className="px-8 pb-8">
              <input 
                type="email" 
                required
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
                placeholder="Email or phone"
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-4 focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] text-[16px] text-[#202124]"
                autoFocus
              />
              <div className="flex justify-between items-center mt-8">
                <button 
                  type="button"
                  onClick={() => setShowGooglePopup(false)}
                  className="text-[#1a73e8] font-medium hover:bg-blue-50 px-3 py-2 rounded transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!googleEmail.trim()}
                  className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-6 py-2.5 rounded font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
