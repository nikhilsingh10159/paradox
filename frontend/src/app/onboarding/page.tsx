'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';

export default function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const { userAddress, updateProfile } = useAppContext();
  const router = useRouter();

  // Local state for the form before pushing to context
  const [handle, setHandle] = useState('');
  const [role, setRole] = useState<'Client' | 'Freelancer' | null>(null);
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!userAddress) {
      router.push('/');
    }
  }, [userAddress, router]);

  const addSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentSkill.trim()) {
      e.preventDefault();
      if (!skills.includes(currentSkill.trim())) {
        setSkills([...skills, currentSkill.trim()]);
      }
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }
    
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      if (img.width < 256 || img.height < 256) {
        setAvatarError(`Image is too small (${img.width}x${img.height}px). Minimum is 256x256px.`);
        URL.revokeObjectURL(objectUrl);
      } else {
        setAvatarError(null);
        setAvatarUrl(objectUrl);
      }
    };
    img.src = objectUrl;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFinish = () => {
    setIsDeploying(true);
    updateProfile({ 
      handle, 
      role, 
      bio, 
      skills, 
      avatar: avatarUrl || 'https://i.pravatar.cc/150?u=newuser' 
    });
    
    // Simulate deploying the Soulbound Token
    setTimeout(() => {
      setIsDeploying(false);
      router.push('/dashboard');
    }, 2000);
  };

  if (!userAddress) return null;

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        
        {/* Progress Bar */}
        <div className="flex h-1.5 w-full bg-[#F5F5F7]">
          <div 
            className="h-full bg-black transition-all duration-500 ease-out"
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>

        <div className="p-10 md:p-14">
          
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-3xl font-semibold tracking-tight text-gray-900 mb-2">Set up your profile</h2>
              <p className="text-gray-500 font-medium tracking-tight mb-10">Choose how you'll appear on Web3 Hub.</p>
              
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/png, image/jpeg, image/webp" 
                    onChange={handleFileChange} 
                  />
                  <div 
                    className={`relative w-24 h-24 rounded-full border-2 flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden group ${isDragging ? 'border-[#0066CC] bg-blue-50' : 'border-dashed border-gray-300 bg-[#F5F5F7] hover:bg-gray-50 hover:border-gray-400'}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {avatarUrl ? (
                      <>
                        <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                          <svg className="w-6 h-6 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path></svg>
                          <span className="text-[10px] font-semibold text-white">Change</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <svg className={`w-8 h-8 mb-1 ${isDragging ? 'text-[#0066CC]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        <span className={`text-xs font-semibold ${isDragging ? 'text-[#0066CC]' : 'text-gray-500'}`}>Upload</span>
                      </>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Profile Picture</h3>
                    <p className="text-sm text-gray-500">Must be at least 256x256px.</p>
                    {avatarUrl && (
                      <button onClick={() => setAvatarUrl(null)} className="text-xs text-red-500 hover:text-red-600 font-semibold mt-1 transition-colors">
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>
                {avatarError && <p className="text-sm text-red-500 font-medium">{avatarError}</p>}

                <div>
                  <label className="block text-sm font-semibold tracking-tight text-gray-900 mb-2">Choose a Handle</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">@</span>
                    <input 
                      type="text" 
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      placeholder="alice_dev"
                      className="w-full bg-[#F5F5F7] border border-transparent rounded-2xl pl-10 pr-5 py-4 focus:outline-none focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all font-medium text-gray-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Role */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-3xl font-semibold tracking-tight text-gray-900 mb-2">What brings you here?</h2>
              <p className="text-gray-500 font-medium tracking-tight mb-10">This helps us customize your dashboard experience.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => setRole('Freelancer')}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${role === 'Freelancer' ? 'border-black bg-gray-50' : 'border-gray-100 bg-white hover:border-gray-300'}`}
                >
                  <div className="w-12 h-12 bg-[#F5F5F7] rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">I want to work</h3>
                  <p className="text-sm text-gray-500 font-medium">Find gigs, build on-chain reputation, and get paid securely.</p>
                </button>

                <button 
                  onClick={() => setRole('Client')}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${role === 'Client' ? 'border-black bg-gray-50' : 'border-gray-100 bg-white hover:border-gray-300'}`}
                >
                  <div className="w-12 h-12 bg-[#F5F5F7] rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">I want to hire</h3>
                  <p className="text-sm text-gray-500 font-medium">Create escrows, hire verified talent, and manage projects.</p>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Professional Details */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-3xl font-semibold tracking-tight text-gray-900 mb-2">Professional Details</h2>
              <p className="text-gray-500 font-medium tracking-tight mb-10">Tell the network about what you do.</p>
              
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-semibold tracking-tight text-gray-900 mb-2">Skills (Press Enter)</label>
                  <div className="w-full bg-[#F5F5F7] border border-transparent rounded-2xl p-2 focus-within:bg-white focus-within:border-gray-300 focus-within:ring-4 focus-within:ring-gray-100 transition-all flex flex-wrap gap-2 items-center min-h-[60px]">
                    {skills.map(skill => (
                      <span key={skill} className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-900 flex items-center gap-2">
                        {skill}
                        <button onClick={() => removeSkill(skill)} className="text-gray-400 hover:text-red-500">✕</button>
                      </span>
                    ))}
                    <input 
                      type="text" 
                      value={currentSkill}
                      onChange={(e) => setCurrentSkill(e.target.value)}
                      onKeyDown={addSkill}
                      placeholder={skills.length === 0 ? "e.g. Solidity, UI Design..." : ""}
                      className="flex-1 bg-transparent border-none focus:outline-none px-2 min-w-[120px] text-sm font-medium text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold tracking-tight text-gray-900 mb-2">Short Bio</label>
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="I am a passionate builder..."
                    className="w-full bg-[#F5F5F7] border border-transparent rounded-2xl px-5 py-4 focus:outline-none focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all font-medium text-gray-900 h-32 resize-none"
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Web3 Connection */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-3xl font-semibold tracking-tight text-gray-900 mb-2">Secure your identity</h2>
              <p className="text-gray-500 font-medium tracking-tight mb-10">We will mint a Soulbound Token (SBT) to track your reputation.</p>
              
              <div className="bg-[#F5F5F7] rounded-2xl p-6 mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Wallet Connected</h3>
                    <p className="text-sm text-gray-500 font-medium">{userAddress.substring(0,6)}...{userAddress.substring(userAddress.length-4)}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Verified</span>
              </div>

              <div className="p-6 border-2 border-blue-100 bg-blue-50/50 rounded-2xl">
                <h3 className="font-semibold text-[#0066CC] mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                  Reputation SBT
                </h3>
                <p className="text-sm text-gray-600 font-medium">
                  By completing setup, you agree to deploy an ERC-5192 Soulbound Token to your wallet. This token cannot be transferred and will permanently record your escrow history on Web3 Hub.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-12 flex justify-between items-center border-t border-gray-100 pt-8">
            <button 
              onClick={() => setStep(step - 1)}
              disabled={step === 1 || isDeploying}
              className="text-gray-500 font-semibold hover:text-gray-900 transition-colors disabled:opacity-0"
            >
              Back
            </button>
            
            {step < 4 ? (
              <button 
                onClick={() => setStep(step + 1)}
                disabled={(step === 1 && !handle) || (step === 2 && !role)}
                className="bg-black hover:bg-gray-800 text-white px-8 py-3.5 rounded-2xl font-semibold tracking-tight transition-colors disabled:opacity-50"
              >
                Continue
              </button>
            ) : (
              <button 
                onClick={handleFinish}
                disabled={isDeploying}
                className="bg-[#0066CC] hover:bg-[#0052A3] text-white px-8 py-3.5 rounded-2xl font-semibold tracking-tight transition-colors flex items-center gap-3 disabled:opacity-70"
              >
                {isDeploying ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Minting SBT...
                  </>
                ) : (
                  'Complete Setup'
                )}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
