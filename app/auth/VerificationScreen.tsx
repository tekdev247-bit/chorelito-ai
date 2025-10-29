// app/auth/VerificationScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'react-native';

interface VerificationScreenProps {
  phoneNumber: string;
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
}

export const VerificationScreen: React.FC<VerificationScreenProps> = ({ 
  phoneNumber, 
  onVerify, 
  onResend, 
  onBack, 
  isLoading 
}) => {
  const [code, setCode] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Focus input on mount
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Resend timer
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleVerify = async () => {
    if (code.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit verification code');
      return;
    }

    try {
      console.log('Attempting verification with code:', code);
      await onVerify(code);
      console.log('Verification completed successfully');
    } catch (error) {
      console.error('Verification error:', error);
      Alert.alert('Error', 'Invalid verification code. Please try again.');
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    try {
      await onResend();
      setResendTimer(60);
      setCanResend(false);
      Alert.alert('Success', 'Verification code sent!');
    } catch (error) {
      console.error('Resend error:', error);
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    }
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `+1 (${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#63B3ED', '#8EE3C2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Verify Your Phone</Text>
            <Image 
              source={require('../../assets/chorelito_logo_no_bkgrd.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to{'\n'}
            {formatPhoneNumber(phoneNumber)}
            {__DEV__ && '\n\n(Development: Use any 6-digit code)'}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.form}>
          <Text style={styles.label}>Verification Code</Text>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="123456"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            editable={!isLoading}
            autoComplete="sms-otp"
          />
          
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleVerify}
            disabled={isLoading || code.length !== 6}
          >
            <LinearGradient
              colors={isLoading ? ['#A0AEC0', '#718096'] : ['#63B3ED', '#8EE3C2']}
              style={styles.buttonGradient}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Verify Code</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>
              Didn't receive the code?{' '}
            </Text>
            <TouchableOpacity
              onPress={handleResend}
              disabled={!canResend || isLoading}
            >
              <Text style={[
                styles.resendButton,
                (!canResend || isLoading) && styles.resendButtonDisabled
              ]}>
                {canResend ? 'Resend' : `Resend in ${resendTimer}s`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF9',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'serif',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 6,
    marginRight: 12,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  logo: {
    width: 35,
    height: 35,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  form: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
    backgroundColor: '#F7FAFC',
    marginBottom: 24,
    fontFamily: 'monospace',
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    color: '#718096',
    fontSize: 14,
  },
  resendButton: {
    color: '#63B3ED',
    fontSize: 14,
    fontWeight: '600',
  },
  resendButtonDisabled: {
    color: '#A0AEC0',
  },
});
