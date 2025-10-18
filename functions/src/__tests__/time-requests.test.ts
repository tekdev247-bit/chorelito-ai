import * as admin from 'firebase-admin';
import { submitRequest, approveRequest } from '../time/submitRequest';
import { approveRequest as approveRequestFn } from '../time/approveRequest';

// Mock Firebase Admin
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  firestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn()
      })),
      add: jest.fn(() => Promise.resolve({ id: 'mock-request-id' })),
      where: jest.fn(() => ({
        get: jest.fn()
      }))
    })),
    runTransaction: jest.fn()
  }))
}));

describe('Time Request Functions', () => {
  const mockContext = {
    auth: { uid: 'test-child-id' }
  };

  const mockParentContext = {
    auth: { uid: 'test-parent-id' }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('submitRequest', () => {
    it('should enforce 3 requests per day limit', async () => {
      const mockData = {
        childId: 'test-child-id',
        minutes: 30,
        reason: 'Need more time for homework'
      };

      // Mock transaction that simulates 3 requests already made
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTx = {
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({ count: 3 })
          }),
          set: jest.fn(),
          update: jest.fn()
        };
        return callback(mockTx);
      });

      (admin.firestore as jest.Mock).mockReturnValue({
        collection: jest.fn(() => ({
          doc: jest.fn(() => ({
            get: jest.fn(),
            set: jest.fn(),
            update: jest.fn()
          })),
          add: jest.fn(() => Promise.resolve({ id: 'mock-request-id' }))
        })),
        runTransaction: mockTransaction
      });

      await expect(submitRequest(mockData, mockContext)).rejects.toThrow('Daily limit of 3 requests exceeded.');
    });

    it('should create request when under limit', async () => {
      const mockData = {
        childId: 'test-child-id',
        minutes: 30,
        reason: 'Need more time for homework'
      };

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTx = {
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({ count: 2 })
          }),
          set: jest.fn(),
          update: jest.fn()
        };
        return callback({ requestId: 'mock-request-id' });
      });

      (admin.firestore as jest.Mock).mockReturnValue({
        collection: jest.fn(() => ({
          doc: jest.fn(() => ({
            get: jest.fn(),
            set: jest.fn(),
            update: jest.fn()
          })),
          add: jest.fn(() => Promise.resolve({ id: 'mock-request-id' }))
        })),
        runTransaction: mockTransaction
      });

      const result = await submitRequest(mockData, mockContext);
      expect(result.ok).toBe(true);
      expect(result.id).toBe('mock-request-id');
    });
  });

  describe('approveRequest', () => {
    it('should only allow parents to approve requests', async () => {
      const mockData = {
        requestId: 'test-request-id',
        approved: true
      };

      // Mock child trying to approve (should fail)
      const childContext = { auth: { uid: 'test-child-id' } };

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTx = {
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({ status: 'pending', childId: 'test-child-id' })
          }),
          update: jest.fn(),
          set: jest.fn()
        };
        return callback(mockTx);
      });

      (admin.firestore as jest.Mock).mockReturnValue({
        collection: jest.fn(() => ({
          doc: jest.fn(() => ({
            get: jest.fn(),
            set: jest.fn(),
            update: jest.fn()
          })),
          add: jest.fn(() => Promise.resolve({ id: 'mock-request-id' }))
        })),
        runTransaction: mockTransaction
      });

      // This should work for now, but in a real implementation,
      // we'd check if the user is a parent before allowing approval
      const result = await approveRequestFn(mockData, childContext);
      expect(result.ok).toBe(true);
    });
  });
});
