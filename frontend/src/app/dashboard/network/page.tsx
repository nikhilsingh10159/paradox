'use client';
import React, { useState } from 'react';

const mockProfiles = [
  { id: 1, name: "Alice Freelancer", address: "0x8B2...4D1A", tier: "T1", role: "Smart Contract Auditor", escrowed: "$45,200", skills: ["Solidity", "Foundry", "Security"], avatar: "https://i.pravatar.cc/150?u=alice" },
  { id: 2, name: "Bob Builder", address: "0xC4F...99E2", tier: "T2", role: "Frontend Developer", escrowed: "$12,400", skills: ["React", "Next.js", "Tailwind"], avatar: "https://i.pravatar.cc/150?u=bob" },
  { id: 3, name: "Charlie Node", address: "0x2A1...9F0B", tier: "T1", role: "DeFi Architect", escrowed: "$89,000", skills: ["DeFi", "Tokenomics", "Go"], avatar: "https://i.pravatar.cc/150?u=charlie" },
  { id: 4, name: "Diana Designer", address: "0x9D4...2B3C", tier: "T3", role: "UI/UX Designer", escrowed: "$5,100", skills: ["Figma", "User Research"], avatar: "https://i.pravatar.cc/150?u=diana" },
];

export default function NetworkPage() {
  const [dmProfile, setDmProfile] = useState<typeof mockProfiles[0] | null>(null);
  const [messages, setMessages] = useState<{sender: 'me' | 'them', text: string}[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const openDM = (profile: typeof mockProfiles[0]) => {
    setDmProfile(profile);
    setMessages([
      { sender: 'them', text: `Hi there! I'm ${profile.name}. Let me know how I can help with your next Web3 project.` }
    ]);
  };

  const closeDM = () => {
    setDmProfile(null);
    setMessages([]);
    setNewMessage("");
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { sender: 'me', text: newMessage }]);
    setNewMessage("");
    setIsTyping(true);

    // Mock auto-reply
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        sender: 'them', 
        text: "That sounds interesting! Let's draft up the milestones and open an Escrow contract for this." 
      }]);
    }, 1500);
  };

  return (
    <>
      <div className="bg-white rounded-[28px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mb-10">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-2">Freelancer Network</h1>
            <p className="text-gray-500 font-medium tracking-tight">
              Discover and hire top-tier talent with verified on-chain reputation.
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <input 
              type="text" 
              placeholder="Search by skill or address..."
              className="w-full sm:w-64 bg-[#F5F5F7] border border-transparent rounded-2xl px-5 py-3 focus:outline-none focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-200 transition-all text-sm font-medium text-gray-900"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-0">
        {mockProfiles.map(profile => (
          <div key={profile.id} className="bg-white rounded-[28px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-5 mb-8">
              <img 
                src={profile.avatar} 
                alt={`${profile.name} Avatar`}
                className="w-16 h-16 rounded-full border border-gray-200 object-cover shrink-0 shadow-sm"
              />
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-gray-900">{profile.name}</h3>
                <p className="text-sm font-medium text-gray-500 mb-3">{profile.role}</p>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-[#F5F5F7] rounded-lg text-xs font-semibold text-gray-700 tracking-tight">Tier {profile.tier.substring(1)}</span>
                  <span className="text-xs font-medium text-gray-400">{profile.address}</span>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Verified Skills</p>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map(skill => (
                  <span key={skill} className="px-3 py-1.5 bg-blue-50 text-[#0066CC] rounded-full text-xs font-medium tracking-tight">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-auto border-t border-gray-100 pt-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 tracking-tight mb-1">Total Escrowed</p>
                <p className="text-lg font-semibold text-gray-900 tracking-tight">{profile.escrowed}</p>
              </div>
              <button 
                onClick={() => openDM(profile)}
                className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-2xl text-sm font-semibold tracking-tight transition-colors"
              >
                Hire / Message
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DM Modal */}
      {dmProfile && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col h-[600px] max-h-[90vh] animate-in fade-in zoom-in duration-200 border border-gray-100">
            
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
              <div className="flex items-center gap-4">
                <img src={dmProfile.avatar} alt="Avatar" className="w-12 h-12 rounded-full border border-gray-200" />
                <div>
                  <h3 className="font-semibold text-gray-900 tracking-tight">{dmProfile.name}</h3>
                  <p className="text-xs text-green-600 font-medium">● Online</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="bg-[#F5F5F7] hover:bg-[#E8E8ED] text-black px-4 py-2 rounded-full text-xs font-semibold transition-colors">
                  Propose Escrow
                </button>
                <button onClick={closeDM} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F5F5F7] text-gray-500 hover:text-gray-900 transition-colors">
                  ✕
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#F5F5F7] flex flex-col gap-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm font-medium tracking-tight ${
                    msg.sender === 'me' 
                      ? 'bg-[#0066CC] text-white rounded-br-sm' 
                      : 'bg-white text-gray-900 border border-gray-100 rounded-bl-sm shadow-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 px-5 py-4 rounded-2xl rounded-bl-sm shadow-sm flex gap-1 items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
              <form onSubmit={sendMessage} className="flex gap-3">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message ${dmProfile.name.split(' ')[0]}...`}
                  className="flex-1 bg-[#F5F5F7] border border-transparent rounded-full px-5 py-3 focus:outline-none focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all text-sm font-medium text-gray-900"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="w-12 h-12 flex items-center justify-center bg-black hover:bg-gray-800 text-white rounded-full transition-colors disabled:opacity-50"
                >
                  <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                </button>
              </form>
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}
