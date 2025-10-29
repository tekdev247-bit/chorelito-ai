// app/auth/SignupScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  ScrollView,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'react-native';

interface SignupScreenProps {
  onSignup: (phoneNumber: string, name: string) => Promise<void>;
  onLogin: () => void;
  isLoading: boolean;
}

const countryCodes = [
  { code: '+1', country: 'USA', flag: '🇺🇸' },
  { code: '+1', country: 'Canada', flag: '🇨🇦' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+7', country: 'Russia', flag: '🇷🇺' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪' }
];

export const SignupScreen: React.FC<SignupScreenProps> = ({ onSignup, onLogin, isLoading }) => {
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [formattedPhone, setFormattedPhone] = useState('');
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [name, setName] = useState('');

  const handleSignup = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    // Basic phone number validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    if (cleanPhone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    try {
      await onSignup(cleanPhone, name.trim());
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Error', 'Failed to create account. Please try again.');
    }
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
          <View style={styles.titleRow}>
            <Text style={styles.title}>Join ChoreLito!</Text>
            <Image 
              source={require('../../assets/chorelito_logo_no_bkgrd.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.subtitle}>
            Create your account to get started
            {__DEV__ && '\n(Development: Use any phone number)'}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
            autoComplete="name"
            editable={!isLoading}
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="+1 (555) 123-4567"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            autoComplete="tel"
            editable={!isLoading}
          />
          
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={isLoading}
          >
            <LinearGradient
              colors={isLoading ? ['#A0AEC0', '#718096'] : ['#63B3ED', '#8EE3C2']}
              style={styles.buttonGradient}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={onLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>Already have an account? Sign In</Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
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
    width: 40,
    height: 40,
  },
  content: {
    flex: 1,
    padding: 24,
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
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F7FAFC',
    marginBottom: 8,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 24,
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#718096',
    fontSize: 14,
  },
  loginButton: {
    padding: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#63B3ED',
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    color: '#718096',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 16,
  },
});
