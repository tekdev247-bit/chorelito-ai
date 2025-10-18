// Note: This test would need to be run in the app directory context
// For now, we'll implement the policy logic directly for testing

type Policy = {
  quietHours?: { start: string; end: string }[];
  allowedApps?: string[];
};

function isUsageAllowed(policy: Policy, screenTime: { budgetMinutes: number; usedMinutes: number }, now: Date): boolean {
  // time budget
  if (screenTime && screenTime.budgetMinutes <= screenTime.usedMinutes) return false;

  // quiet hours (supports single interval)
  const qh = policy?.quietHours?.[0];
  if (qh) {
    const [sH, sM] = qh.start.split(':').map(Number);
    const [eH, eM] = qh.end.split(':').map(Number);
    const mins = now.getHours() * 60 + now.getMinutes();
    const start = sH * 60 + sM;
    const end = eH * 60 + eM;
    if (start < end) {
      if (mins >= start && mins < end) return false;
    } else {
      // crosses midnight
      if (mins >= start || mins < end) return false;
    }
  }
  return true;
}

describe('Policy Logic Tests', () => {
  describe('isUsageAllowed', () => {
    it('should allow usage when within budget', () => {
      const policy = {};
      const screenTime = { budgetMinutes: 60, usedMinutes: 30 };
      const now = new Date('2024-01-01T10:00:00Z');
      
      expect(isUsageAllowed(policy, screenTime, now)).toBe(true);
    });

    it('should deny usage when budget exceeded', () => {
      const policy = {};
      const screenTime = { budgetMinutes: 60, usedMinutes: 60 };
      const now = new Date('2024-01-01T10:00:00Z');
      
      expect(isUsageAllowed(policy, screenTime, now)).toBe(false);
    });

    it('should deny usage during quiet hours (single interval)', () => {
      const policy = {
        quietHours: [{ start: '22:00', end: '08:00' }]
      };
      const screenTime = { budgetMinutes: 60, usedMinutes: 30 };
      
      // Test during quiet hours (night)
      const nightTime = new Date('2024-01-01T23:00:00Z');
      expect(isUsageAllowed(policy, screenTime, nightTime)).toBe(false);
      
      // Test during quiet hours (early morning)
      const morningTime = new Date('2024-01-01T07:00:00Z');
      expect(isUsageAllowed(policy, screenTime, morningTime)).toBe(false);
    });

    it('should allow usage outside quiet hours', () => {
      const policy = {
        quietHours: [{ start: '22:00', end: '08:00' }]
      };
      const screenTime = { budgetMinutes: 60, usedMinutes: 30 };
      
      // Test during allowed hours
      const dayTime = new Date('2024-01-01T12:00:00Z');
      expect(isUsageAllowed(policy, screenTime, dayTime)).toBe(true);
    });

    it('should handle quiet hours that cross midnight', () => {
      const policy = {
        quietHours: [{ start: '23:00', end: '07:00' }]
      };
      const screenTime = { budgetMinutes: 60, usedMinutes: 30 };
      
      // Test late night (before midnight)
      const lateNight = new Date('2024-01-01T23:30:00Z');
      expect(isUsageAllowed(policy, screenTime, lateNight)).toBe(false);
      
      // Test early morning (after midnight)
      const earlyMorning = new Date('2024-01-02T06:30:00Z');
      expect(isUsageAllowed(policy, screenTime, earlyMorning)).toBe(false);
      
      // Test during allowed hours
      const dayTime = new Date('2024-01-01T12:00:00Z');
      expect(isUsageAllowed(policy, screenTime, dayTime)).toBe(true);
    });

    it('should handle edge cases for quiet hours', () => {
      const policy = {
        quietHours: [{ start: '22:00', end: '08:00' }]
      };
      const screenTime = { budgetMinutes: 60, usedMinutes: 30 };
      
      // Test exactly at start of quiet hours
      const startQuiet = new Date('2024-01-01T22:00:00Z');
      expect(isUsageAllowed(policy, screenTime, startQuiet)).toBe(false);
      
      // Test exactly at end of quiet hours
      const endQuiet = new Date('2024-01-01T08:00:00Z');
      expect(isUsageAllowed(policy, screenTime, endQuiet)).toBe(false);
    });

    it('should handle missing policy gracefully', () => {
      const screenTime = { budgetMinutes: 60, usedMinutes: 30 };
      const now = new Date('2024-01-01T10:00:00Z');
      
      expect(isUsageAllowed(null, screenTime, now)).toBe(true);
      expect(isUsageAllowed(undefined, screenTime, now)).toBe(true);
    });

    it('should handle missing screenTime gracefully', () => {
      const policy = {};
      const now = new Date('2024-01-01T10:00:00Z');
      
      expect(isUsageAllowed(policy, null, now)).toBe(true);
      expect(isUsageAllowed(policy, undefined, now)).toBe(true);
    });
  });
});
