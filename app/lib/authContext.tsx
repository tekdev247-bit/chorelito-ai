// app/lib/authContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  signInWithPhoneNumber, 
  PhoneAuthProvider, 
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from './firebase';
import { parentService } from './firestore';

interface AuthContextType {
  parentId: string | null;
  phoneNumber: string | null;
  user: User | null;
  setParentId: (id: string, phone?: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  // Phone auth methods
  sendVerificationCode: (phoneNumber: string) => Promise<string>;
  verifyCode: (verificationId: string, code: string) => Promise<void>;
  createParentAccount: (phoneNumber: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [parentId, setParentIdState] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumberState] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isInitialized) {
        // First load - show loading for a minimum time to prevent flicker
        setTimeout(() => {
          setIsInitialized(true);
        }, 500);
      }

      if (user) {
        // User is signed in
        const phone = user.phoneNumber;
        setUser(user);
        setPhoneNumberState(phone);
        
        // Try to find existing parent or create new one
        try {
          const existingParent = await parentService.findByPhone(phone || '');
          if (existingParent) {
            setParentIdState(existingParent.id);
            await AsyncStorage.setItem('parentId', existingParent.id);
            await AsyncStorage.setItem('phoneNumber', phone || '');
          }
        } catch (error) {
          console.error('Error finding parent:', error);
        }
      } else {
        // User is signed out
        setUser(null);
        setParentIdState(null);
        setPhoneNumberState(null);
        await clearAuth();
      }
      
      if (isInitialized) {
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, [isInitialized]);

  const sendVerificationCode = async (phoneNumber: string): Promise<string> => {
    try {
      // For development/testing, return a mock verification ID
      if (__DEV__) {
        console.log('Development mode: Mock verification code sent');
        return 'mock-verification-id';
      }
      
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone);
      return confirmation.verificationId;
    } catch (error) {
      console.error('Error sending verification code:', error);
      // In development, provide a fallback
      if (__DEV__) {
        console.log('Using mock verification for development');
        return 'mock-verification-id';
      }
      throw error;
    }
  };

  const verifyCode = async (verificationId: string, code: string): Promise<void> => {
    try {
      // For development/testing, accept any 6-digit code
      if (__DEV__ && verificationId === 'mock-verification-id') {
        console.log('Development mode: Mock verification successful');
        // Create a mock user for development
        const mockUser = {
          uid: 'dev-user-' + Date.now(),
          phoneNumber: '+1234567890',
          displayName: null,
          email: null,
          photoURL: null,
          emailVerified: false,
          isAnonymous: false,
          metadata: {},
          providerData: [],
          refreshToken: 'mock-refresh-token',
          tenantId: null,
          delete: async () => {},
          getIdToken: async () => 'mock-id-token',
          getIdTokenResult: async () => ({}),
          reload: async () => {},
          toJSON: () => ({}),
        } as any;
        
        console.log('Setting mock user:', mockUser.uid);
        setUser(mockUser);
        setPhoneNumberState('+1234567890');
        
        // Create a mock parent account for development
        try {
          const parentId = await parentService.saveParent(mockUser.uid, {
            name: 'Dev User',
            phone: '+1234567890',
            avatar: '👩',
            settings: {
              defaultDailyLimit: 120,
              quietHoursStart: '07:00',
              quietHoursEnd: '21:00',
              maxRequests: 3,
            },
          });
          console.log('Created mock parent account:', parentId);
          setParentIdState(parentId);
          await AsyncStorage.setItem('parentId', parentId);
          await AsyncStorage.setItem('phoneNumber', '+1234567890');
        } catch (parentError) {
          console.error('Error creating mock parent:', parentError);
        }
        
        return;
      }
      
      const credential = PhoneAuthProvider.credential(verificationId, code);
      await signInWithCredential(auth, credential);
    } catch (error) {
      console.error('Error verifying code:', error);
      throw error;
    }
  };

  const createParentAccount = async (phoneNumber: string, name: string): Promise<void> => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const parentData = {
        name,
        phoneNumber,
        avatar: '👩', // Default avatar
        dailyScreenTimeLimit: 120,
        screenTimeStartTime: '07:00',
        screenTimeEndTime: '21:00',
        maxRequestsPerDay: 3,
        presetIncrements: [5, 10, 15],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const parentId = await parentService.saveParent(user.uid, parentData);
      setParentIdState(parentId);
      await AsyncStorage.setItem('parentId', parentId);
      await AsyncStorage.setItem('phoneNumber', phoneNumber);
    } catch (error) {
      console.error('Error creating parent account:', error);
      throw error;
    }
  };

  const setParentId = async (id: string, phone?: string) => {
    try {
      await AsyncStorage.setItem('parentId', id);
      setParentIdState(id);
      
      if (phone) {
        await AsyncStorage.setItem('phoneNumber', phone);
        setPhoneNumberState(phone);
      }
    } catch (error) {
      console.error('Error saving auth state:', error);
    }
  };

  const clearAuth = async () => {
    try {
      await firebaseSignOut(auth);
      await AsyncStorage.removeItem('parentId');
      await AsyncStorage.removeItem('phoneNumber');
      setParentIdState(null);
      setPhoneNumberState(null);
    } catch (error) {
      console.error('Error clearing auth state:', error);
    }
  };

  const value = {
    parentId,
    phoneNumber,
    user,
    setParentId,
    clearAuth,
    isAuthenticated: !!user && !!parentId,
    isLoading,
    sendVerificationCode,
    verifyCode,
    createParentAccount,
  };

  // Debug logging
  console.log('Auth state:', { 
    hasUser: !!user, 
    hasParentId: !!parentId, 
    isAuthenticated: !!user && !!parentId,
    isLoading 
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
