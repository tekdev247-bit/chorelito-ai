// app/auth/AuthFlow.tsx
import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../lib/authContext';
import { LoginScreen } from './LoginScreen';
import { SignupScreen } from './SignupScreen';
import { VerificationScreen } from './VerificationScreen';

type AuthStep = 'login' | 'signup' | 'verification';

export const AuthFlow: React.FC = () => {
  const { 
    sendVerificationCode, 
    verifyCode, 
    createParentAccount, 
    isLoading: authLoading 
  } = useAuth();
  
  const [currentStep, setCurrentStep] = useState<AuthStep>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [userName, setUserName] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleLogin = async (phone: string) => {
    setIsLoading(true);
    setIsTransitioning(true);
    try {
      setPhoneNumber(phone);
      const verificationId = await sendVerificationCode(phone);
      setVerificationId(verificationId);
      setTimeout(() => {
        setCurrentStep('verification');
        setIsTransitioning(false);
      }, 300);
    } catch (error) {
      console.error('Login error:', error);
      setIsTransitioning(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (phone: string, name: string) => {
    setIsLoading(true);
    setIsTransitioning(true);
    try {
      setPhoneNumber(phone);
      setUserName(name);
      const verificationId = await sendVerificationCode(phone);
      setVerificationId(verificationId);
      setTimeout(() => {
        setCurrentStep('verification');
        setIsTransitioning(false);
      }, 300);
    } catch (error) {
      console.error('Signup error:', error);
      setIsTransitioning(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (code: string) => {
    setIsLoading(true);
    try {
      console.log('Verifying code:', code, 'with verificationId:', verificationId);
      await verifyCode(verificationId, code);
      console.log('Verification successful');
      
      // If this was a signup, create the parent account
      if (currentStep === 'verification' && userName) {
        console.log('Creating parent account for:', userName, phoneNumber);
        await createParentAccount(phoneNumber, userName);
        console.log('Parent account created');
      }
    } catch (error) {
      console.error('Verification error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      const newVerificationId = await sendVerificationCode(phoneNumber);
      setVerificationId(newVerificationId);
    } catch (error) {
      console.error('Resend error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      if (currentStep === 'verification') {
        setCurrentStep(userName ? 'signup' : 'login');
      } else {
        setCurrentStep('login');
      }
      setIsTransitioning(false);
    }, 200);
  };

  if (authLoading || isTransitioning) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#63B3ED" />
      </View>
    );
  }

  switch (currentStep) {
    case 'login':
      return (
        <LoginScreen
          onLogin={handleLogin}
          onSignup={() => setCurrentStep('signup')}
          isLoading={isLoading}
        />
      );
    
    case 'signup':
      return (
        <SignupScreen
          onSignup={handleSignup}
          onLogin={() => setCurrentStep('login')}
          isLoading={isLoading}
        />
      );
    
    case 'verification':
      return (
        <VerificationScreen
          phoneNumber={phoneNumber}
          onVerify={handleVerify}
          onResend={handleResend}
          onBack={handleBack}
          isLoading={isLoading}
        />
      );
    
    default:
      return (
        <LoginScreen
          onLogin={handleLogin}
          onSignup={() => setCurrentStep('signup')}
          isLoading={isLoading}
        />
      );
  }
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFDF9',
  },
});
