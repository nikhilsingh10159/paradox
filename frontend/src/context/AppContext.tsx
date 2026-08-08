'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type EscrowStatus = 'Funded' | 'Under AI Review' | 'Disputed' | 'Released';

export interface Escrow {
  id: string;
  freelancerAddress: string;
  amount: number;
  status: EscrowStatus;
  description: string;
  deliverableLink?: string;
  payoutSplit?: { freelancer: number; client: number };
}

export interface UserProfile {
  handle: string;
  role: 'Client' | 'Freelancer' | null;
  skills: string[];
  bio: string;
  avatar: string;
}

interface AppContextType {
  userAddress: string | null;
  userProfile: UserProfile;
  login: (address: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  escrows: Escrow[];
  createEscrow: (freelancerAddress: string, amount: number, description: string) => void;
  updateEscrowStatus: (id: string, newStatus: EscrowStatus, extras?: Partial<Escrow>) => void;
  totalEarnings: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    handle: '',
    role: null,
    skills: [],
    bio: '',
    avatar: 'https://i.pravatar.cc/150?u=newuser'
  });
  const [escrows, setEscrows] = useState<Escrow[]>([
    {
      id: "1024",
      freelancerAddress: "0x8B2...4D1A",
      amount: 1000,
      status: "Funded",
      description: "Build a responsive React Dashboard"
    }
  ]);

  const login = (address: string) => {
    setUserAddress(address);
  };

  const logout = () => {
    setUserAddress(null);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
  };

  const createEscrow = (freelancerAddress: string, amount: number, description: string) => {
    const newEscrow: Escrow = {
      id: Math.floor(Math.random() * 10000).toString(),
      freelancerAddress,
      amount,
      status: "Funded",
      description
    };
    setEscrows([newEscrow, ...escrows]);
  };

  const updateEscrowStatus = (id: string, newStatus: EscrowStatus, extras?: Partial<Escrow>) => {
    setEscrows(prev => prev.map(e => 
      e.id === id ? { ...e, status: newStatus, ...extras } : e
    ));
  };

  const totalEarnings = escrows
    .filter(e => e.status === 'Released')
    .reduce((acc, curr) => {
      // if there's a split, only count client's refund for this mock (assuming user is client)
      if (curr.payoutSplit) {
        return acc + curr.amount * (curr.payoutSplit.client / 100);
      }
      return acc + curr.amount; // full refund/release
    }, 0);

  return (
    <AppContext.Provider value={{ userAddress, userProfile, login, logout, updateProfile, escrows, createEscrow, updateEscrowStatus, totalEarnings }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
