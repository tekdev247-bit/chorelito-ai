import { isUsageAllowed } from '../isUsageAllowed';

describe('isUsageAllowed', () => {
  const mockScreenTime = {
    budgetMinutes: 120,
    usedMinutes: 60
  };

  describe('time budget checks', () => {
    it('should allow usage when budget is greater than used', () => {
      const result = isUsageAllowed({}, mockScreenTime, new Date());
      expect(result).toBe(true);
    });

    it('should deny usage when budget equals used', () => {
      const exhaustedScreenTime = {
        budgetMinutes: 60,
        usedMinutes: 60
      };
      const result = isUsageAllowed({}, exhaustedScreenTime, new Date());
      expect(result).toBe(false);
    });

    it('should deny usage when budget is less than used', () => {
      const overScreenTime = {
        budgetMinutes: 60,
        usedMinutes: 90
      };
      const result = isUsageAllowed({}, overScreenTime, new Date());
      expect(result).toBe(false);
    });
  });

  describe('quiet hours checks', () => {
    const policyWithQuietHours = {
      quietHours: [{ start: '22:00', end: '07:00' }]
    };

    it('should deny usage during quiet hours (same day)', () => {
      // 11 PM (23:00)
      const nightTime = new Date();
      nightTime.setHours(23, 0, 0, 0);
      
      const result = isUsageAllowed(policyWithQuietHours, mockScreenTime, nightTime);
      expect(result).toBe(false);
    });

    it('should allow usage outside quiet hours (same day)', () => {
      // 2 PM (14:00)
      const dayTime = new Date();
      dayTime.setHours(14, 0, 0, 0);
      
      const result = isUsageAllowed(policyWithQuietHours, mockScreenTime, dayTime);
      expect(result).toBe(true);
    });

    it('should deny usage during quiet hours (crosses midnight)', () => {
      // 2 AM (02:00)
      const earlyMorning = new Date();
      earlyMorning.setHours(2, 0, 0, 0);
      
      const result = isUsageAllowed(policyWithQuietHours, mockScreenTime, earlyMorning);
      expect(result).toBe(false);
    });

    it('should handle quiet hours that cross midnight correctly', () => {
      const crossMidnightPolicy = {
        quietHours: [{ start: '23:30', end: '06:30' }]
      };

      // 11:45 PM - should be denied
      const lateNight = new Date();
      lateNight.setHours(23, 45, 0, 0);
      expect(isUsageAllowed(crossMidnightPolicy, mockScreenTime, lateNight)).toBe(false);

      // 2:00 AM - should be denied
      const earlyMorning = new Date();
      earlyMorning.setHours(2, 0, 0, 0);
      expect(isUsageAllowed(crossMidnightPolicy, mockScreenTime, earlyMorning)).toBe(false);

      // 7:00 AM - should be allowed
      const morning = new Date();
      morning.setHours(7, 0, 0, 0);
      expect(isUsageAllowed(crossMidnightPolicy, mockScreenTime, morning)).toBe(true);

      // 11:00 AM - should be allowed
      const lateMorning = new Date();
      lateMorning.setHours(11, 0, 0, 0);
      expect(isUsageAllowed(crossMidnightPolicy, mockScreenTime, lateMorning)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty policy', () => {
      const result = isUsageAllowed({}, mockScreenTime, new Date());
      expect(result).toBe(true);
    });

    it('should handle policy without quiet hours', () => {
      const policy = { allowedApps: ['chrome', 'safari'] };
      const result = isUsageAllowed(policy, mockScreenTime, new Date());
      expect(result).toBe(true);
    });

    it('should handle null screen time', () => {
      const result = isUsageAllowed({}, null as any, new Date());
      expect(result).toBe(true);
    });

    it('should handle undefined screen time', () => {
      const result = isUsageAllowed({}, undefined as any, new Date());
      expect(result).toBe(true);
    });
  });

  describe('boundary conditions', () => {
    it('should handle exactly at quiet hour start', () => {
      const policy = {
        quietHours: [{ start: '22:00', end: '07:00' }]
      };

      // Exactly 22:00
      const exactStart = new Date();
      exactStart.setHours(22, 0, 0, 0);
      
      const result = isUsageAllowed(policy, mockScreenTime, exactStart);
      expect(result).toBe(false);
    });

    it('should handle exactly at quiet hour end (same day)', () => {
      const policy = {
        quietHours: [{ start: '22:00', end: '07:00' }]
      };

      // Exactly 07:00
      const exactEnd = new Date();
      exactEnd.setHours(7, 0, 0, 0);
      
      const result = isUsageAllowed(policy, mockScreenTime, exactEnd);
      expect(result).toBe(true);
    });
  });
});
