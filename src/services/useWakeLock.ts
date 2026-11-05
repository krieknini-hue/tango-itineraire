import { useEffect, useState } from 'react';
import { wakeLockService } from './wakeLockService';

export function useWakeLock(enabled: boolean) {
  const [isActive, setIsActive] = useState<boolean>(wakeLockService.isActive);
  const isSupported = wakeLockService.isSupported();

  useEffect(() => {
    const unsubscribe = wakeLockService.subscribe((active) => {
      setIsActive(active);
    });

    if (enabled) {
      wakeLockService.request();
    } else {
      wakeLockService.release();
    }

    return () => {
      unsubscribe();
      if (enabled) {
        wakeLockService.release();
      }
    };
  }, [enabled]);

  return { isActive, isSupported };
}
