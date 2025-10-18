import { renderHook } from '@testing-library/react-hooks';
import { useOverlayGuard } from '../useOverlayGuard';

// Mock the isUsageAllowed function
jest.mock('../../lib/policy/isUsageAllowed', () => ({
  isUsageAllowed: jest.fn()
}));

import { isUsageAllowed } from '../../lib/policy/isUsageAllowed';

const mockIsUsageAllowed = isUsageAllowed as jest.MockedFunction<typeof isUsageAllowed>;

describe('useOverlayGuard', () => {
  const mockPolicy = {
    quietHours: [{ start: '22:00', end: '07:00' }]
  };

  const mockScreenTime = {
    budgetMinutes: 120,
    usedMinutes: 60
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return locked when usage is not allowed', () => {
    mockIsUsageAllowed.mockReturnValue(false);

    const { result } = renderHook(() => 
      useOverlayGuard(mockPolicy, mockScreenTime)
    );

    expect(result.current).toBe(true);
    expect(mockIsUsageAllowed).toHaveBeenCalledWith(mockPolicy, mockScreenTime, expect.any(Date));
  });

  it('should return unlocked when usage is allowed', () => {
    mockIsUsageAllowed.mockReturnValue(true);

    const { result } = renderHook(() => 
      useOverlayGuard(mockPolicy, mockScreenTime)
    );

    expect(result.current).toBe(false);
    expect(mockIsUsageAllowed).toHaveBeenCalledWith(mockPolicy, mockScreenTime, expect.any(Date));
  });

  it('should update when screen time changes', () => {
    mockIsUsageAllowed.mockReturnValue(true);

    const { result, rerender } = renderHook(
      ({ policy, screenTime }) => useOverlayGuard(policy, screenTime),
      {
        initialProps: { policy: mockPolicy, screenTime: mockScreenTime }
      }
    );

    expect(result.current).toBe(false);

    // Change screen time to exhausted
    const exhaustedScreenTime = {
      budgetMinutes: 60,
      usedMinutes: 60
    };

    mockIsUsageAllowed.mockReturnValue(false);

    rerender({ policy: mockPolicy, screenTime: exhaustedScreenTime });

    expect(result.current).toBe(true);
  });

  it('should update when policy changes', () => {
    mockIsUsageAllowed.mockReturnValue(true);

    const { result, rerender } = renderHook(
      ({ policy, screenTime }) => useOverlayGuard(policy, screenTime),
      {
        initialProps: { policy: mockPolicy, screenTime: mockScreenTime }
      }
    );

    expect(result.current).toBe(false);

    // Change policy to add quiet hours
    const newPolicy = {
      quietHours: [{ start: '22:00', end: '07:00' }]
    };

    mockIsUsageAllowed.mockReturnValue(false);

    rerender({ policy: newPolicy, screenTime: mockScreenTime });

    expect(result.current).toBe(true);
  });

  it('should handle null/undefined inputs gracefully', () => {
    mockIsUsageAllowed.mockReturnValue(true);

    const { result } = renderHook(() => 
      useOverlayGuard(null as any, null as any)
    );

    expect(result.current).toBe(false);
    expect(mockIsUsageAllowed).toHaveBeenCalledWith(null, null, expect.any(Date));
  });

  it('should use provided date instead of current time', () => {
    const customDate = new Date('2024-01-15T14:30:00Z');
    mockIsUsageAllowed.mockReturnValue(false);

    const { result } = renderHook(() => 
      useOverlayGuard(mockPolicy, mockScreenTime, customDate)
    );

    expect(result.current).toBe(true);
    expect(mockIsUsageAllowed).toHaveBeenCalledWith(mockPolicy, mockScreenTime, customDate);
  });
});
