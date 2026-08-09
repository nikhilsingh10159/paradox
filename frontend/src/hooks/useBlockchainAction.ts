'use client';

import { useCallback, useState } from 'react';
import { useToast } from '@/components/Toast';
import { useEscrowContract } from './useEscrowContract';
import { parseUnits } from 'ethers';

export function useBlockchainAction() {
  const { showToast } = useToast();
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const { contract, isDemo } = useEscrowContract();

  const execute = useCallback(
    async (
      key: string, 
      label: string, 
      demoAction: () => void | Promise<void>,
      realAction?: (contract: any) => Promise<any>
    ) => {
      setLoadingKey(key);
      
      try {
        if (isDemo || !contract || !realAction) {
          showToast(`[DEMO] ${label} — simulating...`, 'info');
          await new Promise((resolve) => setTimeout(resolve, 1600));
          await demoAction();
          showToast(`[DEMO] ${label} simulated successfully`, 'success');
        } else {
          showToast(`${label} — awaiting wallet confirmation...`, 'info');
          const tx = await realAction(contract);
          showToast(`${label} transaction submitted. Waiting for confirmation...`, 'info');
          await tx.wait();
          await demoAction(); // Update local state
          showToast(`${label} confirmed on-chain`, 'success');
        }
      } catch (err: any) {
        console.error(err);
        showToast(`${label} failed. ${err.reason || err.message || 'Transaction reverted.'}`, 'error');
      } finally {
        setLoadingKey(null);
      }
    },
    [showToast, contract, isDemo],
  );

  const isLoading = useCallback((key: string) => loadingKey === key, [loadingKey]);

  return { execute, isLoading, loadingKey, isDemo };
}
