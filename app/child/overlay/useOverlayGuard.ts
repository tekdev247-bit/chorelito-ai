import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { isUsageAllowed } from '../../lib/policy/isUsageAllowed';

type Policy = {
  quietHours?: { start: string; end: string }[];
  allowedApps?: string[];
};

type ScreenTime = {
  budgetMinutes: number;
  usedMinutes: number;
};

export function useOverlayGuard(
  policy: Policy, 
  screenTime: ScreenTime, 
  now: Date = new Date()
) {
  const [locked, setLocked] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckedRef = useRef<{
    policy: string;
    budgetMinutes: number;
    usedMinutes: number;
    timeKey: string;
    result: boolean;
  } | null>(null);

  // Memoize the policy serialization to avoid unnecessary recalculations
  const policyKey = useMemo(() => {
    if (!policy) return 'no-policy';
    return JSON.stringify(policy);
  }, [policy]);

  // Memoize the time key to avoid unnecessary recalculations
  const timeKey = useMemo(() => {
    // Round to nearest minute to avoid excessive updates
    const roundedTime = new Date(now.getTime());
    roundedTime.setSeconds(0, 0);
    return roundedTime.toISOString();
  }, [now]);

  // Memoized policy check function
  const checkPolicy = useCallback((
    currentPolicy: Policy,
    currentScreenTime: ScreenTime,
    currentTime: Date
  ): boolean => {
    // Check if we can use cached result
    if (lastCheckedRef.current) {
      const { policy: lastPolicy, budgetMinutes, usedMinutes, timeKey: lastTimeKey, result } = lastCheckedRef.current;
      
      if (
        policyKey === lastPolicy &&
        currentScreenTime.budgetMinutes === budgetMinutes &&
        currentScreenTime.usedMinutes === usedMinutes &&
        timeKey === lastTimeKey
      ) {
        return result;
      }
    }

    // Perform the actual policy check
    const result = isUsageAllowed(currentPolicy, currentScreenTime, currentTime);
    
    // Cache the result
    lastCheckedRef.current = {
      policy: policyKey,
      budgetMinutes: currentScreenTime.budgetMinutes,
      usedMinutes: currentScreenTime.usedMinutes,
      timeKey,
      result
    };

    return result;
  }, [policyKey, timeKey]);

  // Debounced update function
  const updateLockedState = useCallback(() => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for debounced update
    debounceTimeoutRef.current = setTimeout(() => {
      const allowed = checkPolicy(policy, screenTime, now);
      setLocked(!allowed);
    }, 100); // 100ms debounce
  }, [policy, screenTime, now, checkPolicy]);

  useEffect(() => {
    updateLockedState();

    // Cleanup timeout on unmount or dependency change
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [updateLockedState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return locked;
}
