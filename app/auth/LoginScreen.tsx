// app/auth/LoginScreen.tsx
import React, { useState, useEffect } from 'react';
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
  Modal,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'react-native';

interface LoginScreenProps {
  onLogin: (phoneNumber: string) => Promise<void>;
  onSignup: () => void;
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

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onSignup, isLoading }) => {
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [formattedPhone, setFormattedPhone] = useState('');
  const [showCountryModal, setShowCountryModal] = useState(false);

  const formatPhoneNumber = (input: string) => {
    const cleaned = input.replace(/\D/g, '');
    const limited = cleaned.slice(0, 10);
    
    if (limited.length === 0) return '';
    if (limited.length <= 3) return limited;
    if (limited.length <= 6) return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
    return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
  };

  const getFullPhoneNumber = () => {
    const cleaned = formattedPhone.replace(/\D/g, '');
    return `${selectedCountry.code}${cleaned}`;
  };

  const handleLogin = async () => {
    if (!formattedPhone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    const cleanPhone = formattedPhone.replace(/\D/g, '');
    
    if (cleanPhone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    try {
      const fullPhone = getFullPhoneNumber();
      await onLogin(fullPhone);
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to send verification code. Please try again.');
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
            <Text style={styles.title}>Welcome Back!</Text>
            <Image 
              source={require('../../assets/chorelito_logo_no_bkgrd.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.subtitle}>
            Sign in to continue managing chores
            {__DEV__ && '\n(Development: Use any phone number)'}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.form}>
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.phoneInputContainer}>
            <TouchableOpacity 
              style={styles.countryButton}
              onPress={() => setShowCountryModal(true)}
            >
              <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
              <Text style={styles.countryCode}>{selectedCountry.code}</Text>
              <Text style={styles.countryArrow}>▼</Text>
            </TouchableOpacity>
            <TextInput
              style={[styles.input, styles.phoneInput]}
              placeholder="(555) 123-4567"
              value={formattedPhone}
              onChangeText={(text) => {
                const formatted = formatPhoneNumber(text);
                setFormattedPhone(formatted);
              }}
              keyboardType="phone-pad"
              maxLength={14}
              editable={!isLoading}
            />
          </View>
          
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <LinearGradient
              colors={isLoading ? ['#A0AEC0', '#718096'] : ['#63B3ED', '#8EE3C2']}
              style={styles.buttonGradient}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Send Verification Code</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.signupButton}
            onPress={onSignup}
            disabled={isLoading}
          >
            <Text style={styles.signupButtonText}>Create New Account</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Country Selection Modal */}
      <Modal
        visible={showCountryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCountryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity onPress={() => setShowCountryModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.countryList}>
              {countryCodes.map((country, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.countryOption,
                    selectedCountry.code === country.code && styles.countryOptionSelected
                  ]}
                  onPress={() => {
                    setSelectedCountry(country);
                    setShowCountryModal(false);
                  }}
                >
                  <Text style={styles.countryFlag}>{country.flag}</Text>
                  <Text style={styles.countryName}>{country.country}</Text>
                  <Text style={styles.countryCodeText}>{country.code}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    fontSize: 16,
    backgroundColor: '#F7FAFC',
    marginBottom: 24,
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
  signupButton: {
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#63B3ED',
    borderRadius: 12,
  },
  signupButtonText: {
    color: '#63B3ED',
    fontSize: 16,
    fontWeight: '600',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  countryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F7FAFC',
    gap: 6,
  },
  countryFlag: {
    fontSize: 24,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  countryArrow: {
    fontSize: 10,
    color: '#718096',
  },
  phoneInput: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
  },
  closeButton: {
    fontSize: 24,
    color: '#718096',
    fontWeight: '300',
  },
  countryList: {
    maxHeight: 400,
  },
  countryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F7FAFC',
  },
  countryOptionSelected: {
    backgroundColor: '#EDF2F7',
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
    marginLeft: 12,
  },
  countryCodeText: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '600',
  },
});
