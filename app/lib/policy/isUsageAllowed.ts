type Policy = {
  quietHours?: { start: string; end: string }[];
  allowedApps?: string[];
};

export function isUsageAllowed(
  policy: Policy, 
  screenTime: { budgetMinutes: number; usedMinutes: number }, 
  now: Date = new Date()
): boolean {
  // Handle null/undefined inputs
  if (!policy || !screenTime || !now) {
    return true; // Default to allowing usage if data is missing
  }

  // Time budget check - if no budget or used >= budget, deny
  if (screenTime.budgetMinutes <= 0 || screenTime.usedMinutes >= screenTime.budgetMinutes) {
    return false;
  }

  // Quiet hours check (supports multiple intervals)
  const quietHours = policy.quietHours;
  if (quietHours && quietHours.length > 0) {
    for (const qh of quietHours) {
      if (!qh.start || !qh.end) continue;

      try {
        const [sH, sM] = qh.start.split(':').map(Number);
        const [eH, eM] = qh.end.split(':').map(Number);
        
        // Validate time format
        if (isNaN(sH) || isNaN(sM) || isNaN(eH) || isNaN(eM)) continue;
        if (sH < 0 || sH > 23 || sM < 0 || sM > 59 || eH < 0 || eH > 23 || eM < 0 || eM > 59) continue;

        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const startMinutes = sH * 60 + sM;
        const endMinutes = eH * 60 + eM;

        // Handle quiet hours that don't cross midnight (e.g., 14:00 to 16:00)
        if (startMinutes < endMinutes) {
          if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
            return false;
          }
        }
        // Handle quiet hours that cross midnight (e.g., 22:00 to 08:00)
        else if (startMinutes > endMinutes) {
          if (currentMinutes >= startMinutes || currentMinutes < endMinutes) {
            return false;
          }
        }
        // Handle edge case where start equals end (24-hour restriction)
        else if (startMinutes === endMinutes) {
          return false; // Always in quiet hours
        }
      } catch (error) {
        console.warn('Invalid quiet hours format:', qh, error);
        continue; // Skip invalid quiet hours entry
      }
    }
  }

  return true;
}
