'use client';

import { useWallets } from '@privy-io/react-auth';
import { BrowserProvider, Contract } from 'ethers';
import { ESCROW_CONTRACT_ADDRESS, ESCROW_ABI } from '@/config/contracts';
import { useState, useEffect } from 'react';

export function useEscrowContract() {
  const { wallets } = useWallets();
  const [contract, setContract] = useState<Contract | null>(null);
  const [isDemo, setIsDemo] = useState(true);

  useEffect(() => {
    async function initContract() {
      if (wallets.length > 0) {
        try {
          const wallet = wallets[0];
          await wallet.switchChain(31337); // Localhost Hardhat
          const provider = await wallet.getEthersProvider();
          const signer = await provider.getSigner();
          
          const escrow = new Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer);
          setContract(escrow);
          
          // Check if contract is actually deployed at address (if code length > 2 it's deployed)
          const code = await provider.getCode(ESCROW_CONTRACT_ADDRESS);
          if (code !== '0x') {
            setIsDemo(false);
          } else {
            setIsDemo(true);
            setContract(null);
          }
        } catch (e) {
          console.error("Failed to connect to contract:", e);
          setIsDemo(true);
          setContract(null);
        }
      } else {
        setIsDemo(true);
        setContract(null);
      }
    }
    
    initContract();
  }, [wallets]);

  return { contract, isDemo };
}
