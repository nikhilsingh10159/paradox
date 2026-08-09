'use client';

import { useCallback, useState } from 'react';
import { useToast } from '@/components/Toast';

export function useBlockchainAction() {
  const { showToast } = useToast();
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const execute = useCallback(
    async (key: string, label: string, action: () => void | Promise<void>) => {
      setLoadingKey(key);
      showToast(`${label} — awaiting wallet confirmation...`, 'info');
      try {
        await new Promise((resolve) => setTimeout(resolve, 1600));
        await action();
        showToast(`${label} confirmed on-chain`, 'success');
      } catch {
        showToast(`${label} failed. Transaction reverted.`, 'error');
      } finally {
        setLoadingKey(null);
      }
    },
    [showToast],
  );

  const isLoading = useCallback((key: string) => loadingKey === key, [loadingKey]);

  return { execute, isLoading, loadingKey };
}
