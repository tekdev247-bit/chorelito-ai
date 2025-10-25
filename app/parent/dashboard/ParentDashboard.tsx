// app/parent/dashboard/ParentDashboard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, StyleSheet, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useVoiceSession } from '../../lib/voice/useVoiceSession';

// Enhanced theme
const enhancedTheme = {
  gradients: {
    primary: ['#63B3ED', '#8EE3C2'],
    secondary: ['#FF8C82', '#C3B5F5'],
  },
  shadows: {
    soft: {
      shadowColor: '#63B3ED',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 3
    }
  }
};

// Inline VoiceWave component
const VoiceWave: React.FC<{ onPress?: () => void; isListening?: boolean }> = ({ 
  onPress, 
  isListening = false 
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Always pulsate, not just when listening
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={voiceStyles.container}>
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity onPress={onPress} style={voiceStyles.button}>
          <LinearGradient
            colors={isListening ? ['#FF8C82', '#C3B5F5'] : ['#63B3ED', '#8EE3C2']}
            style={voiceStyles.gradient}
          >
            <Text style={voiceStyles.icon}>🎤</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const voiceStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  button: {
    width: 200,
    height: 200,
    borderRadius: 100,
    shadowColor: '#63B3ED',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 15
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center'
  },
  icon: {
    fontSize: 80
  }
});

// Inline AITopTabs component
const tabs = ['Home', 'Children', 'Chores', 'Reports', 'Settings', 'Help'] as const;

interface AITopTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AITopTabs: React.FC<AITopTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <View style={tabStyles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={tabStyles.scrollContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => onTabChange(tab)}
            style={tabStyles.tab}
          >
            {activeTab === tab ? (
              <LinearGradient
                colors={enhancedTheme.gradients.secondary}
                style={tabStyles.activeTab}
              >
                <Text style={tabStyles.activeTabText}>{tab}</Text>
              </LinearGradient>
            ) : (
              <View style={tabStyles.inactiveTab}>
                <Text style={tabStyles.inactiveTabText}>{tab}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// Home Button Component
const HomeButton: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={homeButtonStyles.container}
      onPress={onPress}
    >
      <LinearGradient
        colors={enhancedTheme.gradients.primary}
        style={homeButtonStyles.button}
      >
        <Text style={homeButtonStyles.icon}>🏠</Text>
        <Text style={homeButtonStyles.text}>Home</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Settings Tab Component
const SettingsTab: React.FC<{ onHomePress: () => void }> = ({ onHomePress }) => {
  const [parentName, setParentName] = useState('Sarah Johnson');
  const [parentPhone, setParentPhone] = useState('+1 (555) 123-4567');
  const [parentAvatar, setParentAvatar] = useState('👩');
  const [defaultDailyLimit, setDefaultDailyLimit] = useState('120');
  const [quietHoursStart, setQuietHoursStart] = useState('07:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('21:00');
  const [maxRequests, setMaxRequests] = useState('3');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerType, setTimePickerType] = useState<'start' | 'end'>('start');
  const [selectedHour, setSelectedHour] = useState(7);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(0);
  
  // Onboarding form state
  const [onboardingParentName, setOnboardingParentName] = useState('');
  const [onboardingParentPhone, setOnboardingParentPhone] = useState('');
  const [onboardingParentAvatar, setOnboardingParentAvatar] = useState('👩');
  const [onboardingDefaultLimit, setOnboardingDefaultLimit] = useState('120');
  const [onboardingQuietStart, setOnboardingQuietStart] = useState('07:00');
  const [onboardingQuietEnd, setOnboardingQuietEnd] = useState('21:00');
  const [onboardingMaxRequests, setOnboardingMaxRequests] = useState('3');
  const [onboardingChildName, setOnboardingChildName] = useState('');
  const [onboardingChildAge, setOnboardingChildAge] = useState('');
  const [onboardingChildAvatar, setOnboardingChildAvatar] = useState('👦');
  const [onboardingChildLimit, setOnboardingChildLimit] = useState('60');
  const [onboardingChildStart, setOnboardingChildStart] = useState('07:00');
  const [onboardingChildEnd, setOnboardingChildEnd] = useState('20:00');

  const openTimePicker = (type: 'start' | 'end') => {
    setTimePickerType(type);
    setShowTimePicker(true);
    
    const currentTime = type === 'start' ? quietHoursStart : quietHoursEnd;
    const [hour, minute] = currentTime.split(':').map(Number);
    setSelectedHour(hour);
    setSelectedMinute(minute);
  };

  const confirmTimeSelection = () => {
    const timeString = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    
    if (timePickerType === 'start') {
      setQuietHoursStart(timeString);
    } else {
      setQuietHoursEnd(timeString);
    }
    
    setShowTimePicker(false);
  };

  // Onboarding navigation
  const nextOnboardingStep = () => {
    if (onboardingStep < 6) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      // Complete onboarding
      completeOnboarding();
    }
  };

  const prevOnboardingStep = () => {
    if (onboardingStep > 0) {
      setOnboardingStep(onboardingStep - 1);
    }
  };

  const completeOnboarding = () => {
    // Update parent info
    setParentName(onboardingParentName);
    setParentPhone(onboardingParentPhone);
    setParentAvatar(onboardingParentAvatar);
    
    // Update default settings
    setDefaultDailyLimit(onboardingDefaultLimit);
    setQuietHoursStart(onboardingQuietStart);
    setQuietHoursEnd(onboardingQuietEnd);
    setMaxRequests(onboardingMaxRequests);
    
    // Add first child
    if (onboardingChildName && onboardingChildAge) {
      const newChild: Child = {
        id: Date.now().toString(),
        name: onboardingChildName,
        age: parseInt(onboardingChildAge),
        points: 0,
        level: 1,
        avatar: onboardingChildAvatar,
        dailyScreenTimeLimit: parseInt(onboardingChildLimit),
        screenTimeStartTime: onboardingChildStart,
        screenTimeEndTime: onboardingChildEnd,
      };
      setChildren([newChild]);
    }
    
    setShowOnboarding(false);
    setActiveTab('Home');
  };

  const skipOnboarding = () => {
    setShowOnboarding(false);
    setActiveTab('Home');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFFDF9' }}>
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#2D3748' }}>
            Settings
          </Text>
          <HomeButton onPress={onHomePress} />
        </View>
      </View>

      <View style={{ padding: 16 }}>
        {/* 1. Account & Security */}
        <View style={settingsStyles.section}>
          <Text style={settingsStyles.sectionTitle}>👤 Account & Security</Text>
          
          <View style={settingsStyles.settingItem}>
            <Text style={settingsStyles.settingLabel}>Parent Name</Text>
            <TextInput
              style={settingsStyles.settingInput}
              value={parentName}
              onChangeText={setParentName}
              placeholder="Enter parent name"
            />
          </View>

          <View style={settingsStyles.settingItem}>
            <Text style={settingsStyles.settingLabel}>Parent Phone</Text>
            <TextInput
              style={settingsStyles.settingInput}
              value={parentPhone}
              onChangeText={setParentPhone}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          </View>

          <View style={settingsStyles.settingItem}>
            <Text style={settingsStyles.settingLabel}>Parent Avatar</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={settingsStyles.avatarScroll}>
              {['👩', '👨', '🧑', '👵', '👴'].map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => setParentAvatar(emoji)}
                  style={[
                    settingsStyles.avatarOption,
                    parentAvatar === emoji && settingsStyles.avatarOptionSelected
                  ]}
                >
                  <Text style={settingsStyles.avatarText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity style={settingsStyles.actionButton}>
            <Text style={settingsStyles.actionButtonText}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[settingsStyles.actionButton, settingsStyles.logoutButton]}>
            <Text style={[settingsStyles.actionButtonText, settingsStyles.logoutButtonText]}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* 2. Screen-Time Policy */}
        <View style={settingsStyles.section}>
          <Text style={settingsStyles.sectionTitle}>⏰ Screen-Time Policy</Text>
          
          <View style={settingsStyles.settingItem}>
            <Text style={settingsStyles.settingLabel}>Default Daily Limit (minutes)</Text>
            <TextInput
              style={settingsStyles.settingInput}
              value={defaultDailyLimit}
              onChangeText={setDefaultDailyLimit}
              placeholder="120"
              keyboardType="numeric"
            />
          </View>

          <View style={settingsStyles.settingItem}>
            <Text style={settingsStyles.settingLabel}>Quiet Hours Start</Text>
            <View style={settingsStyles.timeInputContainer}>
              <TextInput
                style={[settingsStyles.settingInput, settingsStyles.timeInput]}
                value={quietHoursStart}
                onChangeText={setQuietHoursStart}
                placeholder="07:00"
                keyboardType="numeric"
              />
              <TouchableOpacity 
                style={settingsStyles.clockButton}
                onPress={() => openTimePicker('start')}
              >
                <Text style={settingsStyles.clockIcon}>🕐</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={settingsStyles.settingItem}>
            <Text style={settingsStyles.settingLabel}>Quiet Hours End</Text>
            <View style={settingsStyles.timeInputContainer}>
              <TextInput
                style={[settingsStyles.settingInput, settingsStyles.timeInput]}
                value={quietHoursEnd}
                onChangeText={setQuietHoursEnd}
                placeholder="21:00"
                keyboardType="numeric"
              />
              <TouchableOpacity 
                style={settingsStyles.clockButton}
                onPress={() => openTimePicker('end')}
              >
                <Text style={settingsStyles.clockIcon}>🕐</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={settingsStyles.settingItem}>
            <Text style={settingsStyles.settingLabel}>Max "Request More Time" per day</Text>
            <TextInput
              style={settingsStyles.settingInput}
              value={maxRequests}
              onChangeText={setMaxRequests}
              placeholder="3"
              keyboardType="numeric"
            />
          </View>

          <View style={settingsStyles.settingItem}>
            <Text style={settingsStyles.settingLabel}>Preset Increments</Text>
            <View style={settingsStyles.incrementContainer}>
              <TouchableOpacity style={settingsStyles.incrementButton}>
                <Text style={settingsStyles.incrementText}>+5 min</Text>
              </TouchableOpacity>
              <TouchableOpacity style={settingsStyles.incrementButton}>
                <Text style={settingsStyles.incrementText}>+10 min</Text>
              </TouchableOpacity>
              <TouchableOpacity style={settingsStyles.incrementButton}>
                <Text style={settingsStyles.incrementText}>+15 min</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 3. Data & Privacy */}
        <View style={settingsStyles.section}>
          <Text style={settingsStyles.sectionTitle}>🔒 Data & Privacy</Text>
          
          <TouchableOpacity style={settingsStyles.actionButton}>
            <Text style={settingsStyles.actionButtonText}>Export Data (CSV)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={settingsStyles.actionButton}>
            <Text style={settingsStyles.actionButtonText}>Export Data (JSON)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[settingsStyles.actionButton, settingsStyles.dangerButton]}>
            <Text style={[settingsStyles.actionButtonText, settingsStyles.dangerButtonText]}>Delete Household Data</Text>
          </TouchableOpacity>

          <View style={settingsStyles.settingItem}>
            <Text style={settingsStyles.settingLabel}>Camera Permission</Text>
            <Text style={settingsStyles.permissionStatus}>✅ Granted</Text>
          </View>

          <View style={settingsStyles.settingItem}>
            <Text style={settingsStyles.settingLabel}>Microphone Permission</Text>
            <Text style={settingsStyles.permissionStatus}>✅ Granted</Text>
          </View>

          <TouchableOpacity 
            style={settingsStyles.actionButton}
            onPress={() => setShowPrivacyModal(true)}
          >
            <Text style={settingsStyles.actionButtonText}>Privacy Policy</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={settingsStyles.actionButton}
            onPress={() => setShowTermsModal(true)}
          >
            <Text style={settingsStyles.actionButtonText}>Terms of Service</Text>
          </TouchableOpacity>
        </View>

        {/* 4. About */}
        <View style={settingsStyles.section}>
          <Text style={settingsStyles.sectionTitle}>ℹ️ About</Text>
          
          <View style={settingsStyles.settingItem}>
            <Text style={settingsStyles.settingLabel}>Version</Text>
            <Text style={settingsStyles.settingValue}>1.0.0</Text>
          </View>

          <TouchableOpacity style={settingsStyles.actionButton}>
            <Text style={settingsStyles.actionButtonText}>Check for Updates</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={settingsStyles.actionButton}
            onPress={() => setShowCreditsModal(true)}
          >
            <Text style={settingsStyles.actionButtonText}>Credits & Acknowledgments</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[settingsStyles.actionButton, settingsStyles.supportButton]}
            onPress={onHomePress}
          >
            <Text style={[settingsStyles.actionButtonText, settingsStyles.supportButtonText]}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modalContainer}>
            <Text style={modalStyles.modalTitle}>Select Time</Text>
            
            <View style={modalStyles.timePickerContainer}>
              <View style={modalStyles.timePickerColumn}>
                <Text style={modalStyles.timePickerLabel}>Hour</Text>
                <ScrollView style={modalStyles.timePickerScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 24 }, (_, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        modalStyles.timePickerOption,
                        selectedHour === i && modalStyles.timePickerOptionSelected
                      ]}
                      onPress={() => setSelectedHour(i)}
                    >
                      <Text style={[
                        modalStyles.timePickerText,
                        selectedHour === i && modalStyles.timePickerTextSelected
                      ]}>
                        {i.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <View style={modalStyles.timePickerColumn}>
                <Text style={modalStyles.timePickerLabel}>Minute</Text>
                <ScrollView style={modalStyles.timePickerScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 60 }, (_, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        modalStyles.timePickerOption,
                        selectedMinute === i && modalStyles.timePickerOptionSelected
                      ]}
                      onPress={() => setSelectedMinute(i)}
                    >
                      <Text style={[
                        modalStyles.timePickerText,
                        selectedMinute === i && modalStyles.timePickerTextSelected
                      ]}>
                        {i.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={modalStyles.buttonRow}>
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.cancelButton]}
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={modalStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.saveButton]}
                onPress={confirmTimeSelection}
              >
                <LinearGradient
                  colors={enhancedTheme.gradients.primary}
                  style={modalStyles.saveButtonGradient}
                >
                  <Text style={modalStyles.saveButtonText}>Confirm</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Credits Modal */}
      <Modal
        visible={showCreditsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreditsModal(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modalContainer}>
            <View style={modalStyles.modalHeader}>
              <Text style={modalStyles.modalTitle}>Credits & Acknowledgments</Text>
              <TouchableOpacity
                style={modalStyles.closeButton}
                onPress={() => setShowCreditsModal(false)}
              >
                <Text style={modalStyles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={creditsStyles.content}>
              <Text style={creditsStyles.company}>Owned by Tek-247</Text>
              <Text style={creditsStyles.address}>33-9 Robbins Rd #937</Text>
              <Text style={creditsStyles.address}>Springfield, IL</Text>
              
              <View style={creditsStyles.divider} />
              
              <Text style={creditsStyles.sectionTitle}>Developed By:</Text>
              <Text style={creditsStyles.developer}>Terrence Wright & Cursor AI</Text>
              
              <View style={creditsStyles.divider} />
              
              <Text style={creditsStyles.purpose}>
                This app was developed to help parents and children manage screen time and fight screen addiction. 
                Our mission is to create a healthier digital environment for families through AI-powered parenting assistance.
              </Text>
            </View>

            <TouchableOpacity
              style={[modalStyles.button, modalStyles.saveButton]}
              onPress={() => setShowCreditsModal(false)}
            >
              <LinearGradient
                colors={enhancedTheme.gradients.primary}
                style={modalStyles.saveButtonGradient}
              >
                <Text style={modalStyles.saveButtonText}>Close</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modalContainer}>
            <View style={modalStyles.modalHeader}>
              <Text style={modalStyles.modalTitle}>Privacy Policy</Text>
              <TouchableOpacity
                style={modalStyles.closeButton}
                onPress={() => setShowPrivacyModal(false)}
              >
                <Text style={modalStyles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={legalStyles.scrollContent}>
              <Text style={legalStyles.sectionTitle}>1. Information We Collect</Text>
              <Text style={legalStyles.text}>
                We collect information you provide directly to us, such as when you create an account, 
                add children to your household, or use our voice commands. This includes:
              </Text>
              <Text style={legalStyles.bullet}>• Parent and child names, ages, and avatars</Text>
              <Text style={legalStyles.bullet}>• Screen time preferences and limits</Text>
              <Text style={legalStyles.bullet}>• Voice command data (processed locally)</Text>
              <Text style={legalStyles.bullet}>• Usage analytics to improve our service</Text>

              <Text style={legalStyles.sectionTitle}>2. How We Use Your Information</Text>
              <Text style={legalStyles.text}>
                We use the information we collect to:
              </Text>
              <Text style={legalStyles.bullet}>• Provide and maintain our parenting assistance services</Text>
              <Text style={legalStyles.bullet}>• Track and manage screen time for your children</Text>
              <Text style={legalStyles.bullet}>• Generate reports and analytics</Text>
              <Text style={legalStyles.bullet}>• Improve our AI-powered features</Text>

              <Text style={legalStyles.sectionTitle}>3. Data Security</Text>
              <Text style={legalStyles.text}>
                We implement industry-standard security measures to protect your family's data. 
                All data is encrypted in transit and at rest. We never sell your personal information 
                to third parties.
              </Text>

              <Text style={legalStyles.sectionTitle}>4. Children's Privacy</Text>
              <Text style={legalStyles.text}>
                We are committed to protecting children's privacy. We only collect the minimum 
                information necessary to provide our services and never share children's data 
                with third parties without explicit parental consent.
              </Text>

              <Text style={legalStyles.sectionTitle}>5. Your Rights</Text>
              <Text style={legalStyles.text}>
                You have the right to access, update, or delete your family's data at any time. 
                You can export your data or request complete deletion through the app settings.
              </Text>

              <Text style={legalStyles.sectionTitle}>6. Contact Us</Text>
              <Text style={legalStyles.text}>
                If you have questions about this Privacy Policy, please contact us at 
                support@chorelito.com
              </Text>

              <Text style={legalStyles.lastUpdated}>
                Last updated: January 2025
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={[modalStyles.button, modalStyles.saveButton]}
              onPress={() => setShowPrivacyModal(false)}
            >
              <LinearGradient
                colors={enhancedTheme.gradients.primary}
                style={modalStyles.saveButtonGradient}
              >
                <Text style={modalStyles.saveButtonText}>Close</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Terms of Service Modal */}
      <Modal
        visible={showTermsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modalContainer}>
            <View style={modalStyles.modalHeader}>
              <Text style={modalStyles.modalTitle}>Terms of Service</Text>
              <TouchableOpacity
                style={modalStyles.closeButton}
                onPress={() => setShowTermsModal(false)}
              >
                <Text style={modalStyles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={legalStyles.scrollContent}>
              <Text style={legalStyles.sectionTitle}>1. Acceptance of Terms</Text>
              <Text style={legalStyles.text}>
                By using Chorelito AI, you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our service.
              </Text>

              <Text style={legalStyles.sectionTitle}>2. Description of Service</Text>
              <Text style={legalStyles.text}>
                Chorelito AI is an AI-powered parenting assistant that helps families manage 
                screen time, track chores, and promote healthy digital habits. Our service 
                includes voice commands, progress tracking, and family management tools.
              </Text>

              <Text style={legalStyles.sectionTitle}>3. User Responsibilities</Text>
              <Text style={legalStyles.text}>
                As a user, you agree to:
              </Text>
              <Text style={legalStyles.bullet}>• Provide accurate information about your family</Text>
              <Text style={legalStyles.bullet}>• Use the service responsibly and in accordance with these terms</Text>
              <Text style={legalStyles.bullet}>• Respect your children's privacy and well-being</Text>
              <Text style={legalStyles.bullet}>• Not misuse the AI features or attempt to circumvent safety measures</Text>

              <Text style={legalStyles.sectionTitle}>4. Prohibited Uses</Text>
              <Text style={legalStyles.text}>
                You may not use our service to:
              </Text>
              <Text style={legalStyles.bullet}>• Harm or exploit children in any way</Text>
              <Text style={legalStyles.bullet}>• Share inappropriate content</Text>
              <Text style={legalStyles.bullet}>• Attempt to reverse engineer our AI systems</Text>
              <Text style={legalStyles.bullet}>• Use the service for any illegal activities</Text>

              <Text style={legalStyles.sectionTitle}>5. AI and Voice Features</Text>
              <Text style={legalStyles.text}>
                Our AI features are designed to assist with parenting tasks. While we strive 
                for accuracy, AI-generated suggestions should be reviewed by parents before 
                implementation. Voice data is processed locally and not stored on our servers.
              </Text>

              <Text style={legalStyles.sectionTitle}>6. Limitation of Liability</Text>
              <Text style={legalStyles.text}>
                Chorelito AI is provided "as is" without warranties. We are not liable for 
                any damages arising from the use of our service. Parents remain responsible 
                for their children's safety and well-being.
              </Text>

              <Text style={legalStyles.sectionTitle}>7. Termination</Text>
              <Text style={legalStyles.text}>
                We may terminate or suspend your account at any time for violation of these 
                terms. You may delete your account and data at any time through the app settings.
              </Text>

              <Text style={legalStyles.sectionTitle}>8. Changes to Terms</Text>
              <Text style={legalStyles.text}>
                We may update these terms from time to time. Continued use of the service 
                constitutes acceptance of any changes.
              </Text>

              <Text style={legalStyles.sectionTitle}>9. Contact Information</Text>
              <Text style={legalStyles.text}>
                For questions about these Terms of Service, contact us at support@chorelito.com
              </Text>

              <Text style={legalStyles.lastUpdated}>
                Last updated: January 2025
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={[modalStyles.button, modalStyles.saveButton]}
              onPress={() => setShowTermsModal(false)}
            >
              <LinearGradient
                colors={enhancedTheme.gradients.primary}
                style={modalStyles.saveButtonGradient}
              >
                <Text style={modalStyles.saveButtonText}>Close</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// Home Tab Component  
const HomeTab: React.FC = () => {
  const { listening, partial, finalText, lastMessage, error, isProcessing, start, stop, clearError } = useVoiceSession();
  const [showTranscript, setShowTranscript] = useState(false);

  const handleVoicePress = async () => {
    if (listening) {
      await stop();
    } else {
      await start();
      setShowTranscript(true);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFFDF9' }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#2D3748', marginBottom: 24, textAlign: 'center' }}>
          Welcome to your AI powered parenting assistance
        </Text>

        {/* Voice Command Button */}
        <View style={voiceStyles.container}>
          <VoiceWave onPress={handleVoicePress} isListening={listening} />
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#718096', marginTop: 16, textAlign: 'center' }}>
            {listening ? 'Listening...' : isProcessing ? 'Processing...' : 'Tap to give voice command'}
          </Text>
          
          {/* Voice Transcript Display */}
          {showTranscript && (partial || finalText || lastMessage || error) && (
            <View style={voiceTranscriptStyles.container}>
              {listening && partial && (
                <View style={voiceTranscriptStyles.section}>
                  <Text style={voiceTranscriptStyles.label}>You said:</Text>
                  <Text style={voiceTranscriptStyles.text}>{partial}</Text>
                </View>
              )}
              
              {finalText && !listening && (
                <View style={voiceTranscriptStyles.section}>
                  <Text style={voiceTranscriptStyles.label}>Command:</Text>
                  <Text style={voiceTranscriptStyles.text}>{finalText}</Text>
                </View>
              )}
              
              {lastMessage && (
                <View style={voiceTranscriptStyles.section}>
                  <Text style={voiceTranscriptStyles.label}>Response:</Text>
                  <Text style={[voiceTranscriptStyles.text, voiceTranscriptStyles.response]}>{lastMessage}</Text>
                </View>
              )}
              
              {error && (
                <View style={voiceTranscriptStyles.section}>
                  <Text style={voiceTranscriptStyles.label}>Error:</Text>
                  <Text style={[voiceTranscriptStyles.text, voiceTranscriptStyles.error]}>{error}</Text>
                </View>
              )}
              
              <TouchableOpacity 
                style={voiceTranscriptStyles.closeButton}
                onPress={() => {
                  setShowTranscript(false);
                  clearError();
                }}
              >
                <Text style={voiceTranscriptStyles.closeButtonText}>Clear</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Voice Commands List */}
        <View style={{ marginTop: 32 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#2D3748', marginBottom: 16, textAlign: 'center' }}>
            🎤 Voice Commands
          </Text>
          
          <View style={voiceCommandStyles.container}>
            <View style={voiceCommandStyles.commandItem}>
              <Text style={voiceCommandStyles.commandIcon}>👶</Text>
              <Text style={voiceCommandStyles.commandText}>"Add a new child"</Text>
            </View>
            
            <View style={voiceCommandStyles.commandItem}>
              <Text style={voiceCommandStyles.commandIcon}>🧹</Text>
              <Text style={voiceCommandStyles.commandText}>"Create a new chore"</Text>
            </View>
            
            <View style={voiceCommandStyles.commandItem}>
              <Text style={voiceCommandStyles.commandIcon}>📊</Text>
              <Text style={voiceCommandStyles.commandText}>"Show me reports"</Text>
            </View>
            
            <View style={voiceCommandStyles.commandItem}>
              <Text style={voiceCommandStyles.commandIcon}>⚙️</Text>
              <Text style={voiceCommandStyles.commandText}>"Open settings"</Text>
            </View>
            
            <View style={voiceCommandStyles.commandItem}>
              <Text style={voiceCommandStyles.commandIcon}>❓</Text>
              <Text style={voiceCommandStyles.commandText}>"I need help"</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

// Inline ChoresManagementTab component
interface Chore {
  id: string;
  name: string;
  points: number;
  emoji: string;
  assignedTo: string;
  completed: boolean;
}

const ChoresManagementTab: React.FC<{ onHomePress: () => void }> = ({ onHomePress }) => {
  const [chores, setChores] = useState<Chore[]>([
    { id: '1', name: 'Clean room', points: 5, emoji: '🧹', assignedTo: 'Emma', completed: true },
    { id: '2', name: 'Do dishes', points: 10, emoji: '🍽️', assignedTo: 'Emma', completed: true },
    { id: '3', name: 'Homework', points: 15, emoji: '📚', assignedTo: 'Liam', completed: false },
    { id: '4', name: 'Take out trash', points: 5, emoji: '🗑️', assignedTo: 'Liam', completed: false },
    { id: '5', name: 'Feed pet', points: 10, emoji: '🐶', assignedTo: 'Emma', completed: false },
  ]);
  
  // Modal states
  const [showAssignChore, setShowAssignChore] = useState(false);
  const [showAssignDetails, setShowAssignDetails] = useState(false);
  const [showEditChore, setShowEditChore] = useState(false);
  const [showNewChore, setShowNewChore] = useState(false);
  
  // Form states
  const [selectedChore, setSelectedChore] = useState<Chore | null>(null);
  const [newChoreName, setNewChoreName] = useState('');
  const [newChorePoints, setNewChorePoints] = useState('');
  const [newChoreEmoji, setNewChoreEmoji] = useState('🧹');
  const [newChoreAssignedTo, setNewChoreAssignedTo] = useState('Emma');
  const [aiManaged, setAiManaged] = useState(false);

  const choreEmojis = ['🧹', '🍽️', '📚', '🗑️', '🐶', '🌱', '🧺', '🚗', '🛏️', '🍳'];
  const childNames = ['Emma', 'Liam', 'Unassigned'];

  const handleAssignChore = () => {
    if (selectedChore && newChoreAssignedTo) {
      setChores(chores.map(c =>
        c.id === selectedChore.id
          ? { ...c, assignedTo: newChoreAssignedTo }
          : c
      ));
      Alert.alert('Success', `${selectedChore.name} has been assigned to ${newChoreAssignedTo}!`);
      setShowAssignDetails(false);
      setSelectedChore(null);
      setNewChoreAssignedTo('Emma');
    }
  };

  const handleEditChore = () => {
    if (selectedChore && newChoreName && newChorePoints) {
      setChores(chores.map(c =>
        c.id === selectedChore.id
          ? { ...c, name: newChoreName, points: parseInt(newChorePoints), emoji: newChoreEmoji }
          : c
      ));
      Alert.alert('Success', `${newChoreName} has been updated!`);
      setShowEditChore(false);
      setSelectedChore(null);
      setNewChoreName('');
      setNewChorePoints('');
      setNewChoreEmoji('🧹');
      setAiManaged(false);
    }
  };

  const handleNewChore = () => {
    if (newChoreName && newChorePoints) {
      const newChore: Chore = {
        id: (chores.length + 1).toString(),
        name: newChoreName,
        points: parseInt(newChorePoints),
        emoji: newChoreEmoji,
        assignedTo: newChoreAssignedTo,
        completed: false
      };
      setChores([...chores, newChore]);
      Alert.alert('Success', `${newChoreName} has been added!`);
      setShowNewChore(false);
      setNewChoreName('');
      setNewChorePoints('');
      setNewChoreEmoji('🧹');
      setNewChoreAssignedTo('Emma');
    } else {
      Alert.alert('Error', 'Please fill in all required fields');
    }
  };

  const openAssignChore = () => {
    setSelectedChore(null);
    setNewChoreAssignedTo('Emma');
    setShowAssignChore(true);
  };

  const openEditChore = () => {
    setSelectedChore(null); // Start with no chore selected to show the selection list
    setNewChoreName('');
    setNewChorePoints('');
    setNewChoreEmoji('🧹');
    setAiManaged(false);
    setShowEditChore(true);
  };

  const openNewChore = () => {
    setNewChoreName('');
    setNewChorePoints('');
    setNewChoreEmoji('🧹');
    setNewChoreAssignedTo('Emma');
    setShowNewChore(true);
  };

  const selectChoreForAssignment = (chore: Chore) => {
    setSelectedChore(chore);
    setNewChoreAssignedTo(chore.assignedTo);
    setShowAssignChore(false); // Close selection modal
    setShowAssignDetails(true); // Open assignment details modal
  };

  const selectChoreForEdit = (chore: Chore) => {
    setSelectedChore(chore);
    setNewChoreName(chore.name);
    setNewChorePoints(chore.points.toString());
    setNewChoreEmoji(chore.emoji);
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#2D3748' }}>
          Manage Chores
        </Text>
        <HomeButton onPress={onHomePress} />
      </View>

      {/* Three Action Buttons */}
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
        <TouchableOpacity
          style={{
            flex: 1,
            padding: 16,
            backgroundColor: '#63B3ED',
            borderRadius: 12,
            alignItems: 'center'
          }}
          onPress={openAssignChore}
        >
          <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 14 }}>Assign Chore</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            padding: 16,
            backgroundColor: '#FF8C82',
            borderRadius: 12,
            alignItems: 'center'
          }}
          onPress={openEditChore}
        >
          <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 14 }}>Edit Chore</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            padding: 16,
            backgroundColor: '#8EE3C2',
            borderRadius: 12,
            alignItems: 'center'
          }}
          onPress={openNewChore}
        >
          <Text style={{ color: '#0C1B2A', fontWeight: '600', fontSize: 14 }}>New Chore</Text>
        </TouchableOpacity>
      </View>

      {/* Chore List */}
      {chores.map((chore) => (
        <View
          key={chore.id}
          style={[
            childCardStyles.childCard,
            { opacity: chore.completed ? 0.7 : 1 }
          ]}
        >
          <LinearGradient
            colors={chore.completed 
              ? ['rgba(142, 227, 194, 0.2)', 'rgba(142, 227, 194, 0.1)']
              : ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']
            }
            style={childCardStyles.cardGradient}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 40, marginRight: 16 }}>{chore.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ 
                  fontSize: 18, 
                  fontWeight: 'bold', 
                  color: '#2D3748',
                  textDecorationLine: chore.completed ? 'line-through' : 'none'
                }}>
                  {chore.name}
                </Text>
                <Text style={{ fontSize: 14, color: '#4A5568', marginTop: 4 }}>
                  Assigned to: {chore.assignedTo}
                </Text>
                <Text style={{ fontSize: 12, color: '#63B3ED', marginTop: 2 }}>
                  {chore.points} points
                </Text>
              </View>
              <View style={[
                childCardStyles.levelBadge,
                { 
                  backgroundColor: chore.completed ? '#8EE3C2' : 'rgba(99, 179, 237, 0.2)',
                  width: 36,
                  height: 36,
                  paddingHorizontal: 0
                }
              ]}>
                <Text style={{ fontSize: 20 }}>
                  {chore.completed ? '✓' : '○'}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      ))}

      {/* Select Chore Modal (Step 1) */}
      <Modal
        visible={showAssignChore}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAssignChore(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modalContainer}>
            <Text style={modalStyles.modalTitle}>Select Chore to Assign</Text>
            
            <Text style={modalStyles.label}>Choose a chore:</Text>
            <ScrollView style={{ maxHeight: 400, marginBottom: 16 }}>
              {chores.map((chore) => (
                <TouchableOpacity
                  key={chore.id}
                  onPress={() => selectChoreForAssignment(chore)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    borderRadius: 12,
                    marginBottom: 12,
                    backgroundColor: 'rgba(99, 179, 237, 0.05)',
                    borderWidth: 2,
                    borderColor: 'transparent'
                  }}
                >
                  <Text style={{ fontSize: 32, marginRight: 16 }}>{chore.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#2D3748' }}>
                      {chore.name}
                    </Text>
                    <Text style={{ fontSize: 14, color: '#4A5568', marginTop: 2 }}>
                      {chore.points} points • Currently: {chore.assignedTo}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 20, color: '#63B3ED' }}>→</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={modalStyles.buttonRow}>
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.cancelButton, { flex: 1 }]}
                onPress={() => setShowAssignChore(false)}
              >
                <Text style={modalStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Assign Chore Details Modal (Step 2) */}
      <Modal
        visible={showAssignDetails}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAssignDetails(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modalContainer}>
            <Text style={modalStyles.modalTitle}>Assign Chore</Text>
            
            {selectedChore && (
              <>
                {/* Chore Display */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 16,
                  backgroundColor: 'rgba(99, 179, 237, 0.1)',
                  borderRadius: 12,
                  marginBottom: 24
                }}>
                  <Text style={{ fontSize: 40, marginRight: 16 }}>{selectedChore.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#2D3748' }}>
                      {selectedChore.name}
                    </Text>
                    <Text style={{ fontSize: 16, color: '#63B3ED', marginTop: 4 }}>
                      {selectedChore.points} points
                    </Text>
                  </View>
                </View>

                <Text style={modalStyles.label}>Assign To:</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
                  {childNames.map((name) => (
                    <TouchableOpacity
                      key={name}
                      onPress={() => setNewChoreAssignedTo(name)}
                      style={{
                        flex: 1,
                        padding: 16,
                        borderRadius: 12,
                        alignItems: 'center',
                        backgroundColor: newChoreAssignedTo === name 
                          ? '#63B3ED' 
                          : 'rgba(99, 179, 237, 0.1)'
                      }}
                    >
                      <Text style={{ 
                        fontWeight: '600',
                        fontSize: 16,
                        color: newChoreAssignedTo === name ? '#FFF' : '#63B3ED'
                      }}>
                        {name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={modalStyles.buttonRow}>
                  <TouchableOpacity
                    style={[modalStyles.button, modalStyles.cancelButton]}
                    onPress={() => setShowAssignDetails(false)}
                  >
                    <Text style={modalStyles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[modalStyles.button, modalStyles.saveButton]}
                    onPress={handleAssignChore}
                  >
                    <LinearGradient
                      colors={enhancedTheme.gradients.primary}
                      style={modalStyles.saveButtonGradient}
                    >
                      <Text style={modalStyles.saveButtonText}>Assign</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Edit Chore Modal */}
      <Modal
        visible={showEditChore}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditChore(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modalContainer}>
            <Text style={modalStyles.modalTitle}>Edit Chore</Text>
            
            {!selectedChore ? (
              <>
                <Text style={modalStyles.label}>Choose a chore to edit:</Text>
                <ScrollView style={{ maxHeight: 400, marginBottom: 16 }}>
                  {chores.map((chore) => (
                    <TouchableOpacity
                      key={chore.id}
                      onPress={() => selectChoreForEdit(chore)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 16,
                        backgroundColor: 'rgba(99, 179, 237, 0.1)',
                        borderRadius: 12,
                        marginBottom: 8
                      }}
                    >
                      <Text style={{ fontSize: 24, marginRight: 12 }}>{chore.emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: '600', color: '#2D3748' }}>
                          {chore.name}
                        </Text>
                        <Text style={{ fontSize: 14, color: '#4A5568' }}>
                          {chore.points} points • Assigned to {chore.assignedTo}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 20, color: '#63B3ED' }}>→</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <View style={modalStyles.buttonRow}>
                  <TouchableOpacity
                    style={[modalStyles.button, modalStyles.cancelButton, { flex: 1 }]}
                    onPress={() => setShowEditChore(false)}
                  >
                    <Text style={modalStyles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={modalStyles.label}>Chore Icon</Text>
                  <View style={{ marginBottom: 12 }}>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ paddingVertical: 8 }}
                    >
                      {choreEmojis.map((emoji) => (
                        <TouchableOpacity
                          key={emoji}
                          onPress={() => setNewChoreEmoji(emoji)}
                          style={[
                            modalStyles.avatarOption,
                            newChoreEmoji === emoji && modalStyles.avatarOptionSelected,
                            { marginRight: 8 }
                          ]}
                        >
                          <Text style={modalStyles.avatarText}>{emoji}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  <Text style={modalStyles.label}>Chore Name</Text>
                  <TextInput
                    style={modalStyles.input}
                    value={newChoreName}
                    onChangeText={setNewChoreName}
                    placeholder="Enter chore name"
                    placeholderTextColor="#999"
                  />

                  <Text style={modalStyles.label}>Points</Text>
                  <TextInput
                    style={modalStyles.input}
                    value={newChorePoints}
                    onChangeText={setNewChorePoints}
                    placeholder="Enter points value"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />

                  <TouchableOpacity
                    onPress={() => setAiManaged(!aiManaged)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 12,
                      backgroundColor: 'rgba(99, 179, 237, 0.1)',
                      borderRadius: 12,
                      marginBottom: 16
                    }}
                  >
                    <View style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: '#63B3ED',
                      backgroundColor: aiManaged ? '#63B3ED' : 'transparent',
                      marginRight: 12,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {aiManaged && <Text style={{ color: '#FFF', fontSize: 16 }}>✓</Text>}
                    </View>
                    <Text style={{ flex: 1, color: '#2D3748', fontWeight: '600' }}>
                      Managed by AI
                    </Text>
                  </TouchableOpacity>
                </ScrollView>

                <View style={modalStyles.buttonRow}>
                  <TouchableOpacity
                    style={[modalStyles.button, modalStyles.cancelButton]}
                    onPress={() => setShowEditChore(false)}
                  >
                    <Text style={modalStyles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[modalStyles.button, modalStyles.saveButton]}
                    onPress={handleEditChore}
                  >
                    <LinearGradient
                      colors={enhancedTheme.gradients.primary}
                      style={modalStyles.saveButtonGradient}
                    >
                      <Text style={modalStyles.saveButtonText}>Save</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* New Chore Modal */}
      <Modal
        visible={showNewChore}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNewChore(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modalContainer}>
            <Text style={modalStyles.modalTitle}>New Chore</Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={modalStyles.label}>Chore Icon</Text>
              <View style={{ marginBottom: 12 }}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingVertical: 8 }}
                >
                  {choreEmojis.map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      onPress={() => setNewChoreEmoji(emoji)}
                      style={[
                        modalStyles.avatarOption,
                        newChoreEmoji === emoji && modalStyles.avatarOptionSelected,
                        { marginRight: 8 }
                      ]}
                    >
                      <Text style={modalStyles.avatarText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <Text style={modalStyles.label}>Chore Name</Text>
              <TextInput
                style={modalStyles.input}
                value={newChoreName}
                onChangeText={setNewChoreName}
                placeholder="Enter chore name"
                placeholderTextColor="#999"
              />

              <Text style={modalStyles.label}>Points</Text>
              <TextInput
                style={modalStyles.input}
                value={newChorePoints}
                onChangeText={setNewChorePoints}
                placeholder="Enter points value"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />

              <Text style={modalStyles.label}>Assign To</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                {childNames.map((name) => (
                  <TouchableOpacity
                    key={name}
                    onPress={() => setNewChoreAssignedTo(name)}
                    style={{
                      flex: 1,
                      padding: 12,
                      borderRadius: 12,
                      alignItems: 'center',
                      backgroundColor: newChoreAssignedTo === name 
                        ? '#63B3ED' 
                        : 'rgba(99, 179, 237, 0.1)'
                    }}
                  >
                    <Text style={{ 
                      fontWeight: '600',
                      color: newChoreAssignedTo === name ? '#FFF' : '#63B3ED'
                    }}>
                      {name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={modalStyles.buttonRow}>
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.cancelButton]}
                onPress={() => setShowNewChore(false)}
              >
                <Text style={modalStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.saveButton]}
                onPress={handleNewChore}
              >
                <LinearGradient
                  colors={enhancedTheme.gradients.primary}
                  style={modalStyles.saveButtonGradient}
                >
                  <Text style={modalStyles.saveButtonText}>Save</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// Inline HelpTab component
const HelpTab: React.FC<{ onHomePress: () => void }> = ({ onHomePress }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    // Simulate sending email
    setShowConfirmation(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFFDF9' }}>
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#2D3748' }}>
            Need Help?
          </Text>
          <HomeButton onPress={onHomePress} />
        </View>
      </View>
      <View style={helpStyles.container}>
        <Text style={helpStyles.subtitle}>
          Send us a message and we'll get back to you within 48 hours
        </Text>

        <View style={helpStyles.form}>
          <Text style={helpStyles.label}>Your Name</Text>
          <TextInput
            style={helpStyles.input}
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            placeholder="Enter your name"
            placeholderTextColor="#999"
          />

          <Text style={helpStyles.label}>Email Address</Text>
          <TextInput
            style={helpStyles.input}
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            placeholder="your.email@example.com"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={helpStyles.label}>Subject</Text>
          <TextInput
            style={helpStyles.input}
            value={formData.subject}
            onChangeText={(value) => handleInputChange('subject', value)}
            placeholder="What can we help you with?"
            placeholderTextColor="#999"
          />

          <Text style={helpStyles.label}>Message</Text>
          <TextInput
            style={[helpStyles.input, helpStyles.textArea]}
            value={formData.message}
            onChangeText={(value) => handleInputChange('message', value)}
            placeholder="Please describe your question or issue in detail..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          <TouchableOpacity style={helpStyles.submitButton} onPress={handleSubmit}>
            <LinearGradient
              colors={enhancedTheme.gradients.primary}
              style={helpStyles.submitButtonGradient}
            >
              <Text style={helpStyles.submitButtonText}>Send Message</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={helpStyles.contactInfo}>
          <Text style={helpStyles.contactTitle}>Other Ways to Reach Us</Text>
          <View style={helpStyles.contactItem}>
            <Text style={helpStyles.contactIcon}>📧</Text>
            <Text style={helpStyles.contactText}>support@chorelito.com</Text>
          </View>
          <View style={helpStyles.contactItem}>
            <Text style={helpStyles.contactIcon}>⏰</Text>
            <Text style={helpStyles.contactText}>Response time: Typically within 48 hours</Text>
          </View>
        </View>
      </View>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmation}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowConfirmation(false)}
      >
        <View style={helpStyles.modalOverlay}>
          <View style={helpStyles.modalContainer}>
            <Text style={helpStyles.modalIcon}>✅</Text>
            <Text style={helpStyles.modalTitle}>Message Sent!</Text>
            <Text style={helpStyles.modalMessage}>
              Thank you for contacting us. We'll review your message and get back to you typically within 48 hours.
            </Text>
            <TouchableOpacity
              style={helpStyles.modalButton}
              onPress={() => setShowConfirmation(false)}
            >
              <LinearGradient
                colors={enhancedTheme.gradients.primary}
                style={helpStyles.modalButtonGradient}
              >
                <Text style={helpStyles.modalButtonText}>Got it</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// Inline ReportsTab component
const ReportsTab: React.FC<{ onHomePress: () => void }> = ({ onHomePress }) => {
  // Mock data for reports
  const children = [
    { id: '1', name: 'Emma', age: 8, points: 450, level: 3, avatar: '👧', completionRate: 85 },
    { id: '2', name: 'Liam', age: 6, points: 280, level: 2, avatar: '👦', completionRate: 72 }
  ];

  const chores = [
    { id: '1', name: 'Clean room', points: 5, emoji: '🧹', assignedTo: 'Emma', completed: true, frequency: 'Daily' },
    { id: '2', name: 'Do dishes', points: 10, emoji: '🍽️', assignedTo: 'Emma', completed: true, frequency: 'Daily' },
    { id: '3', name: 'Homework', points: 15, emoji: '📚', assignedTo: 'Liam', completed: false, frequency: 'Daily' },
    { id: '4', name: 'Take out trash', points: 5, emoji: '🗑️', assignedTo: 'Liam', completed: false, frequency: 'Weekly' },
    { id: '5', name: 'Feed pet', points: 10, emoji: '🐶', assignedTo: 'Emma', completed: false, frequency: 'Daily' }
  ];

  const achievements = [
    { id: '1', title: 'Chore Master', description: 'Completed 10 chores in a row', child: 'Emma', date: '2 days ago', emoji: '🏆' },
    { id: '2', title: 'Helping Hand', description: 'Helped with extra chores', child: 'Liam', date: '1 week ago', emoji: '🤝' },
    { id: '3', title: 'Early Bird', description: 'Completed morning routine 5 days straight', child: 'Emma', date: '3 days ago', emoji: '🌅' }
  ];

  const screenTimeData = [
    { child: 'Emma', today: 45, limit: 60, weekly: 280, weeklyLimit: 420 },
    { child: 'Liam', today: 30, limit: 45, weekly: 180, weeklyLimit: 315 }
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFFDF9' }}>
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#2D3748' }}>
            Reports & Analytics
          </Text>
          <HomeButton onPress={onHomePress} />
        </View>
      </View>
      <View style={reportsStyles.container}>
        {/* Overview Cards */}
        <View style={reportsStyles.section}>
          <Text style={reportsStyles.sectionTitle}>📊 Overview</Text>
          <View style={reportsStyles.overviewGrid}>
            <View style={reportsStyles.overviewCard}>
              <Text style={reportsStyles.overviewNumber}>78%</Text>
              <Text style={reportsStyles.overviewLabel}>Avg Completion</Text>
            </View>
            <View style={reportsStyles.overviewCard}>
              <Text style={reportsStyles.overviewNumber}>12</Text>
              <Text style={reportsStyles.overviewLabel}>Chores This Week</Text>
            </View>
            <View style={reportsStyles.overviewCard}>
              <Text style={reportsStyles.overviewNumber}>730</Text>
              <Text style={reportsStyles.overviewLabel}>Total Points</Text>
            </View>
            <View style={reportsStyles.overviewCard}>
              <Text style={reportsStyles.overviewNumber}>3</Text>
              <Text style={reportsStyles.overviewLabel}>Achievements</Text>
            </View>
          </View>
        </View>

        {/* Child Progress */}
        <View style={reportsStyles.section}>
          <Text style={reportsStyles.sectionTitle}>👥 Child Progress</Text>
          {children.map((child) => (
            <View key={child.id} style={reportsStyles.childCard}>
              <LinearGradient
                colors={['rgba(99, 179, 237, 0.1)', 'rgba(99, 179, 237, 0.05)']}
                style={reportsStyles.childCardGradient}
              >
                <View style={reportsStyles.childHeader}>
                  <Text style={reportsStyles.childAvatar}>{child.avatar}</Text>
                  <View style={reportsStyles.childInfo}>
                    <Text style={reportsStyles.childName}>{child.name}</Text>
                    <Text style={reportsStyles.childAge}>Age {child.age} • Level {child.level}</Text>
                  </View>
                  <View style={reportsStyles.pointsBadge}>
                    <Text style={reportsStyles.pointsText}>{child.points}</Text>
                  </View>
                </View>
                
                <View style={reportsStyles.progressSection}>
                  <Text style={reportsStyles.progressLabel}>Completion Rate</Text>
                  <View style={reportsStyles.progressBar}>
                    <View style={[reportsStyles.progressFill, { width: `${child.completionRate}%` }]} />
                  </View>
                  <Text style={reportsStyles.progressText}>{child.completionRate}%</Text>
                </View>
              </LinearGradient>
            </View>
          ))}
        </View>

        {/* Chore Analytics */}
        <View style={reportsStyles.section}>
          <Text style={reportsStyles.sectionTitle}>📈 Chore Analytics</Text>
          <View style={reportsStyles.choreStats}>
            <View style={reportsStyles.choreStatCard}>
              <Text style={reportsStyles.choreStatTitle}>Most Completed</Text>
              <View style={reportsStyles.choreStatItem}>
                <Text style={reportsStyles.choreStatEmoji}>🧹</Text>
                <Text style={reportsStyles.choreStatName}>Clean room</Text>
                <Text style={reportsStyles.choreStatValue}>95%</Text>
              </View>
            </View>
            
            <View style={reportsStyles.choreStatCard}>
              <Text style={reportsStyles.choreStatTitle}>Needs Attention</Text>
              <View style={reportsStyles.choreStatItem}>
                <Text style={reportsStyles.choreStatEmoji}>📚</Text>
                <Text style={reportsStyles.choreStatName}>Homework</Text>
                <Text style={reportsStyles.choreStatValue}>40%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Screen Time Insights */}
        <View style={reportsStyles.section}>
          <Text style={reportsStyles.sectionTitle}>⏰ Screen Time Insights</Text>
          {screenTimeData.map((data, index) => (
            <View key={index} style={reportsStyles.screenTimeCard}>
              <View style={reportsStyles.screenTimeHeader}>
                <Text style={reportsStyles.screenTimeChild}>{data.child}</Text>
                <Text style={reportsStyles.screenTimeStatus}>
                  {data.today < data.limit ? '✅' : '⚠️'} {data.today}/{data.limit} min today
                </Text>
              </View>
              <View style={reportsStyles.screenTimeBar}>
                <View style={[reportsStyles.screenTimeFill, { width: `${(data.today / data.limit) * 100}%` }]} />
              </View>
              <Text style={reportsStyles.screenTimeWeekly}>
                Weekly: {data.weekly}/{data.weeklyLimit} minutes
              </Text>
            </View>
          ))}
        </View>

        {/* Recent Achievements */}
        <View style={reportsStyles.section}>
          <Text style={reportsStyles.sectionTitle}>🏆 Recent Achievements</Text>
          {achievements.map((achievement) => (
            <View key={achievement.id} style={reportsStyles.achievementCard}>
              <Text style={reportsStyles.achievementEmoji}>{achievement.emoji}</Text>
              <View style={reportsStyles.achievementContent}>
                <Text style={reportsStyles.achievementTitle}>{achievement.title}</Text>
                <Text style={reportsStyles.achievementDescription}>{achievement.description}</Text>
                <Text style={reportsStyles.achievementMeta}>
                  {achievement.child} • {achievement.date}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

// Inline ChildrenManagementTab component
interface Child {
  id: string;
  name: string;
  age: number;
  points: number;
  level: number;
  avatar: string;
  dailyScreenTimeLimit: number; // in minutes
  screenTimeStartTime: string; // e.g., "07:00"
  screenTimeEndTime: string; // e.g., "20:00"
}

const ChildrenManagementTab: React.FC<{ onHomePress: () => void }> = ({ onHomePress }) => {
  const [children, setChildren] = useState<Child[]>([
    { id: '1', name: 'Emma', age: 8, points: 450, level: 3, avatar: '👧', dailyScreenTimeLimit: 60, screenTimeStartTime: '07:00', screenTimeEndTime: '20:00' },
    { id: '2', name: 'Liam', age: 6, points: 280, level: 2, avatar: '👦', dailyScreenTimeLimit: 45, screenTimeStartTime: '08:00', screenTimeEndTime: '19:00' }
  ]);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [showAddChild, setShowAddChild] = useState(false);
  const [selectedChildChores, setSelectedChildChores] = useState<Child | null>(null);
  
  // Form state
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editDailyScreenTime, setEditDailyScreenTime] = useState('');
  const [editScreenTimeStart, setEditScreenTimeStart] = useState('');
  const [editScreenTimeEnd, setEditScreenTimeEnd] = useState('');
  const [newChildName, setNewChildName] = useState('');
  const [newChildAge, setNewChildAge] = useState('');
  const [newChildAvatar, setNewChildAvatar] = useState('👶');
  const [newChildDailyScreenTime, setNewChildDailyScreenTime] = useState('60');
  const [newChildScreenTimeStart, setNewChildScreenTimeStart] = useState('07:00');
  const [newChildScreenTimeEnd, setNewChildScreenTimeEnd] = useState('20:00');
  
  // Time picker states
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerType, setTimePickerType] = useState<'start' | 'end' | 'newStart' | 'newEnd'>('start');
  const [selectedHour, setSelectedHour] = useState(7);
  const [selectedMinute, setSelectedMinute] = useState(0);

  const handleEditProfile = (child: Child) => {
    setEditingChild(child);
    setEditName(child.name);
    setEditAge(child.age.toString());
    setEditAvatar(child.avatar);
    setEditDailyScreenTime(child.dailyScreenTimeLimit.toString());
    setEditScreenTimeStart(child.screenTimeStartTime);
    setEditScreenTimeEnd(child.screenTimeEndTime);
  };

  const handleSaveProfile = () => {
    if (editingChild) {
      setChildren(children.map(c => 
        c.id === editingChild.id 
          ? { 
              ...c, 
              name: editName, 
              age: parseInt(editAge) || c.age, 
              avatar: editAvatar,
              dailyScreenTimeLimit: parseInt(editDailyScreenTime) || c.dailyScreenTimeLimit,
              screenTimeStartTime: editScreenTimeStart || c.screenTimeStartTime,
              screenTimeEndTime: editScreenTimeEnd || c.screenTimeEndTime
            }
          : c
      ));
      Alert.alert('Success', `${editName}'s profile has been updated!`);
      setEditingChild(null);
    }
  };

  const handleViewChores = (child: Child) => {
    setSelectedChildChores(child);
  };

  const handleAddNewChild = () => {
    setShowAddChild(true);
    setNewChildName('');
    setNewChildAge('');
    setNewChildAvatar('👶');
  };


  const handleSaveNewChild = () => {
    if (newChildName && newChildAge) {
      const newChild: Child = {
        id: (children.length + 1).toString(),
        name: newChildName,
        age: parseInt(newChildAge),
        points: 0,
        level: 1,
        avatar: newChildAvatar,
        dailyScreenTimeLimit: parseInt(newChildDailyScreenTime) || 60,
        screenTimeStartTime: newChildScreenTimeStart || '07:00',
        screenTimeEndTime: newChildScreenTimeEnd || '20:00'
      };
      setChildren([...children, newChild]);
      Alert.alert('Success', `${newChildName} has been added!`);
      setShowAddChild(false);
    } else {
      Alert.alert('Error', 'Please fill in all required fields');
    }
  };

  // Time picker functions
  const openTimePicker = (type: 'start' | 'end' | 'newStart' | 'newEnd') => {
    setTimePickerType(type);
    setShowTimePicker(true);
    
    // Parse current time based on type
    let currentTime = '';
    switch (type) {
      case 'start':
        currentTime = editScreenTimeStart;
        break;
      case 'end':
        currentTime = editScreenTimeEnd;
        break;
      case 'newStart':
        currentTime = newChildScreenTimeStart;
        break;
      case 'newEnd':
        currentTime = newChildScreenTimeEnd;
        break;
    }
    
    const [hour, minute] = currentTime.split(':').map(Number);
    setSelectedHour(hour);
    setSelectedMinute(minute);
  };

  const confirmTimeSelection = () => {
    const timeString = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    
    switch (timePickerType) {
      case 'start':
        setEditScreenTimeStart(timeString);
        break;
      case 'end':
        setEditScreenTimeEnd(timeString);
        break;
      case 'newStart':
        setNewChildScreenTimeStart(timeString);
        break;
      case 'newEnd':
        setNewChildScreenTimeEnd(timeString);
        break;
    }
    
    setShowTimePicker(false);
  };

  const avatarOptions = ['👧', '👦', '👶', '🧒', '👨', '👩', '🧑', '👴', '👵'];

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#2D3748' }}>
            Manage Children
          </Text>
          <HomeButton onPress={onHomePress} />
        </View>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
        {children.map((child) => (
        <View key={child.id} style={childCardStyles.childCard}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
            style={childCardStyles.cardGradient}
          >
            <View style={childCardStyles.childHeader}>
              <Text style={childCardStyles.avatar}>{child.avatar}</Text>
              <View style={childCardStyles.childInfo}>
                <Text style={childCardStyles.childName}>{child.name}</Text>
                <Text style={childCardStyles.childAge}>Age {child.age}</Text>
              </View>
              <View style={childCardStyles.levelBadge}>
                <Text style={childCardStyles.levelText}>Lvl {child.level}</Text>
              </View>
            </View>

            <View style={childCardStyles.stats}>
              <View style={childCardStyles.stat}>
                <Text style={childCardStyles.statValue}>{child.points}</Text>
                <Text style={childCardStyles.statLabel}>Points</Text>
              </View>
              <View style={childCardStyles.divider} />
              <View style={childCardStyles.stat}>
                <Text style={childCardStyles.statValue}>85%</Text>
                <Text style={childCardStyles.statLabel}>Completed</Text>
              </View>
            </View>

            <View style={childCardStyles.actions}>
              <TouchableOpacity 
                style={childCardStyles.editButton}
                onPress={() => handleEditProfile(child)}
              >
                <Text style={childCardStyles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={childCardStyles.choresButton}
                onPress={() => handleViewChores(child)}
              >
                <Text style={childCardStyles.choresButtonText}>View Chores</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
        ))}
      </ScrollView>

      {/* Sticky Add New Child Button */}
      <View style={{ padding: 16, paddingTop: 8 }}>
        <TouchableOpacity 
          style={childCardStyles.addButton}
          onPress={handleAddNewChild}
        >
          <LinearGradient
            colors={enhancedTheme.gradients.primary}
            style={childCardStyles.addButtonGradient}
          >
            <Text style={childCardStyles.addButtonIcon}>+</Text>
            <Text style={childCardStyles.addButtonText}>Add New Child</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Edit Profile Modal */}
      <Modal
        visible={!!editingChild}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditingChild(null)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modalContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={modalStyles.modalTitle}>Edit Profile</Text>
              
              <Text style={modalStyles.label}>Avatar</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={modalStyles.avatarScroll}>
              {avatarOptions.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => setEditAvatar(emoji)}
                  style={[
                    modalStyles.avatarOption,
                    editAvatar === emoji && modalStyles.avatarOptionSelected
                  ]}
                >
                  <Text style={modalStyles.avatarText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={modalStyles.rowContainer}>
              <View style={modalStyles.halfWidth}>
                <Text style={modalStyles.label}>Name</Text>
                <TextInput
                  style={modalStyles.input}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter name"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={modalStyles.halfWidth}>
                <Text style={modalStyles.label}>Age</Text>
                <TextInput
                  style={modalStyles.input}
                  value={editAge}
                  onChangeText={setEditAge}
                  placeholder="Enter age"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={modalStyles.label}>Daily Screen Time Limit (minutes)</Text>
            <TextInput
              style={modalStyles.input}
              value={editDailyScreenTime}
              onChangeText={setEditDailyScreenTime}
              placeholder="e.g., 60"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />

            <Text style={modalStyles.label}>Begin Time</Text>
            <View style={modalStyles.timeInputContainer}>
              <TextInput
                style={[modalStyles.input, modalStyles.timeInput]}
                value={editScreenTimeStart}
                onChangeText={setEditScreenTimeStart}
                placeholder="07:00"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
              <TouchableOpacity 
                style={modalStyles.clockButton}
                onPress={() => openTimePicker('start')}
              >
                <Text style={modalStyles.clockIcon}>🕐</Text>
              </TouchableOpacity>
            </View>

            <Text style={modalStyles.label}>End Time</Text>
            <View style={modalStyles.timeInputContainer}>
              <TextInput
                style={[modalStyles.input, modalStyles.timeInput]}
                value={editScreenTimeEnd}
                onChangeText={setEditScreenTimeEnd}
                placeholder="20:00"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
              <TouchableOpacity 
                style={modalStyles.clockButton}
                onPress={() => openTimePicker('end')}
              >
                <Text style={modalStyles.clockIcon}>🕐</Text>
              </TouchableOpacity>
            </View>
            </ScrollView>

            <View style={modalStyles.buttonRow}>
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.cancelButton]}
                onPress={() => setEditingChild(null)}
              >
                <Text style={modalStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.saveButton]}
                onPress={handleSaveProfile}
              >
                <LinearGradient
                  colors={enhancedTheme.gradients.primary}
                  style={modalStyles.saveButtonGradient}
                >
                  <Text style={modalStyles.saveButtonText}>Save</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* View Chores Modal */}
      <Modal
        visible={!!selectedChildChores}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedChildChores(null)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modalContainer}>
            <Text style={modalStyles.modalTitle}>{selectedChildChores?.name}'s Chores</Text>
            
            <View style={modalStyles.choreList}>
              <View style={modalStyles.choreItem}>
                <Text style={modalStyles.choreEmoji}>🧹</Text>
                <View style={modalStyles.choreInfo}>
                  <Text style={modalStyles.choreName}>Clean room</Text>
                  <Text style={modalStyles.chorePoints}>5 points</Text>
                </View>
                <View style={modalStyles.choreStatus}>
                  <Text style={modalStyles.choreStatusText}>✓</Text>
                </View>
              </View>

              <View style={modalStyles.choreItem}>
                <Text style={modalStyles.choreEmoji}>🍽️</Text>
                <View style={modalStyles.choreInfo}>
                  <Text style={modalStyles.choreName}>Do dishes</Text>
                  <Text style={modalStyles.chorePoints}>10 points</Text>
                </View>
                <View style={modalStyles.choreStatus}>
                  <Text style={modalStyles.choreStatusText}>✓</Text>
                </View>
              </View>

              <View style={modalStyles.choreItem}>
                <Text style={modalStyles.choreEmoji}>📚</Text>
                <View style={modalStyles.choreInfo}>
                  <Text style={modalStyles.choreName}>Homework</Text>
                  <Text style={modalStyles.chorePoints}>15 points</Text>
                </View>
                <View style={[modalStyles.choreStatus, modalStyles.choreStatusPending]}>
                  <Text style={modalStyles.choreStatusTextPending}>○</Text>
                </View>
              </View>

              <View style={modalStyles.choreItem}>
                <Text style={modalStyles.choreEmoji}>🗑️</Text>
                <View style={modalStyles.choreInfo}>
                  <Text style={modalStyles.choreName}>Take out trash</Text>
                  <Text style={modalStyles.chorePoints}>5 points</Text>
                </View>
                <View style={[modalStyles.choreStatus, modalStyles.choreStatusPending]}>
                  <Text style={modalStyles.choreStatusTextPending}>○</Text>
                </View>
              </View>
            </View>

            <View style={modalStyles.buttonRow}>
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.fullButton]}
                onPress={() => setSelectedChildChores(null)}
              >
                <LinearGradient
                  colors={enhancedTheme.gradients.primary}
                  style={modalStyles.saveButtonGradient}
                >
                  <Text style={modalStyles.saveButtonText}>Close</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add New Child Modal */}
      <Modal
        visible={showAddChild}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddChild(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modalContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={modalStyles.modalTitle}>Add New Child</Text>
              
              <Text style={modalStyles.label}>Avatar</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={modalStyles.avatarScroll}>
              {avatarOptions.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => setNewChildAvatar(emoji)}
                  style={[
                    modalStyles.avatarOption,
                    newChildAvatar === emoji && modalStyles.avatarOptionSelected
                  ]}
                >
                  <Text style={modalStyles.avatarText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={modalStyles.rowContainer}>
              <View style={modalStyles.halfWidth}>
                <Text style={modalStyles.label}>Name</Text>
                <TextInput
                  style={modalStyles.input}
                  value={newChildName}
                  onChangeText={setNewChildName}
                  placeholder="Enter name"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={modalStyles.halfWidth}>
                <Text style={modalStyles.label}>Age</Text>
                <TextInput
                  style={modalStyles.input}
                  value={newChildAge}
                  onChangeText={setNewChildAge}
                  placeholder="Enter age"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={modalStyles.label}>Daily Screen Time Limit (minutes)</Text>
            <TextInput
              style={modalStyles.input}
              value={newChildDailyScreenTime}
              onChangeText={setNewChildDailyScreenTime}
              placeholder="e.g., 60"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />

            <Text style={modalStyles.label}>Begin Time</Text>
            <View style={modalStyles.timeInputContainer}>
              <TextInput
                style={[modalStyles.input, modalStyles.timeInput]}
                value={newChildScreenTimeStart}
                onChangeText={setNewChildScreenTimeStart}
                placeholder="07:00"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
              <TouchableOpacity 
                style={modalStyles.clockButton}
                onPress={() => openTimePicker('newStart')}
              >
                <Text style={modalStyles.clockIcon}>🕐</Text>
              </TouchableOpacity>
            </View>

            <Text style={modalStyles.label}>End Time</Text>
            <View style={modalStyles.timeInputContainer}>
              <TextInput
                style={[modalStyles.input, modalStyles.timeInput]}
                value={newChildScreenTimeEnd}
                onChangeText={setNewChildScreenTimeEnd}
                placeholder="20:00"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
              <TouchableOpacity 
                style={modalStyles.clockButton}
                onPress={() => openTimePicker('newEnd')}
              >
                <Text style={modalStyles.clockIcon}>🕐</Text>
              </TouchableOpacity>
            </View>
            </ScrollView>

            <View style={modalStyles.buttonRow}>
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.cancelButton]}
                onPress={() => setShowAddChild(false)}
              >
                <Text style={modalStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.saveButton]}
                onPress={handleSaveNewChild}
              >
                <LinearGradient
                  colors={enhancedTheme.gradients.primary}
                  style={modalStyles.saveButtonGradient}
                >
                  <Text style={modalStyles.saveButtonText}>Add Child</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modalContainer}>
            <Text style={modalStyles.modalTitle}>Select Time</Text>
            
            <View style={modalStyles.timePickerContainer}>
              <View style={modalStyles.timePickerColumn}>
                <Text style={modalStyles.timePickerLabel}>Hour</Text>
                <ScrollView style={modalStyles.timePickerScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 24 }, (_, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        modalStyles.timePickerOption,
                        selectedHour === i && modalStyles.timePickerOptionSelected
                      ]}
                      onPress={() => setSelectedHour(i)}
                    >
                      <Text style={[
                        modalStyles.timePickerText,
                        selectedHour === i && modalStyles.timePickerTextSelected
                      ]}>
                        {i.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <View style={modalStyles.timePickerColumn}>
                <Text style={modalStyles.timePickerLabel}>Minute</Text>
                <ScrollView style={modalStyles.timePickerScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 60 }, (_, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        modalStyles.timePickerOption,
                        selectedMinute === i && modalStyles.timePickerOptionSelected
                      ]}
                      onPress={() => setSelectedMinute(i)}
                    >
                      <Text style={[
                        modalStyles.timePickerText,
                        selectedMinute === i && modalStyles.timePickerTextSelected
                      ]}>
                        {i.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={modalStyles.buttonRow}>
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.cancelButton]}
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={modalStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.saveButton]}
                onPress={confirmTimeSelection}
              >
                <LinearGradient
                  colors={enhancedTheme.gradients.primary}
                  style={modalStyles.saveButtonGradient}
                >
                  <Text style={modalStyles.saveButtonText}>Confirm</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const childCardStyles = StyleSheet.create({
  childCard: {
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: '#63B3ED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3
  },
  cardGradient: {
    padding: 16,
    borderRadius: 20
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  avatar: {
    fontSize: 32,
    marginRight: 12
  },
  childInfo: {
    flex: 1
  },
  childName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748'
  },
  childAge: {
    fontSize: 14,
    color: '#4A5568'
  },
  levelBadge: {
    backgroundColor: '#8EE3C2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12
  },
  levelText: {
    color: '#0C1B2A',
    fontWeight: '600',
    fontSize: 12
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(99, 179, 237, 0.1)',
    borderRadius: 12
  },
  stat: {
    alignItems: 'center'
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748'
  },
  statLabel: {
    fontSize: 12,
    color: '#4A5568',
    marginTop: 2
  },
  divider: {
    width: 1,
    backgroundColor: '#E2E8F0'
  },
  actions: {
    flexDirection: 'row',
    gap: 8
  },
  editButton: {
    flex: 1,
    padding: 12,
    backgroundColor: 'rgba(99, 179, 237, 0.1)',
    borderRadius: 12,
    alignItems: 'center'
  },
  editButtonText: {
    color: '#63B3ED',
    fontWeight: '600'
  },
  choresButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#63B3ED',
    borderRadius: 12,
    alignItems: 'center'
  },
  choresButtonText: {
    color: '#FFF',
    fontWeight: '600'
  },
  addButton: {
    borderRadius: 20,
    shadowColor: '#63B3ED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8
  },
  addButtonGradient: {
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  addButtonIcon: {
    fontSize: 20,
    color: '#FFF',
    marginRight: 8
  },
  addButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600'
  }
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContainer: {
    backgroundColor: '#FFFDF9',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F7FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#718096',
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 8,
    marginTop: 12
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#2D3748',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  avatarScroll: {
    marginBottom: 12
  },
  avatarOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(99, 179, 237, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  avatarOptionSelected: {
    borderColor: '#63B3ED',
    backgroundColor: 'rgba(99, 179, 237, 0.2)'
  },
  avatarText: {
    fontSize: 28
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24
  },
  button: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden'
  },
  fullButton: {
    flex: 1
  },
  cancelButton: {
    backgroundColor: 'rgba(99, 179, 237, 0.1)',
    padding: 14,
    alignItems: 'center',
    borderRadius: 12
  },
  cancelButtonText: {
    color: '#63B3ED',
    fontWeight: '600',
    fontSize: 16
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden'
  },
  saveButtonGradient: {
    padding: 14,
    alignItems: 'center',
    borderRadius: 12
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16
  },
  choreList: {
    marginTop: 12
  },
  choreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  choreEmoji: {
    fontSize: 32,
    marginRight: 12
  },
  choreInfo: {
    flex: 1
  },
  choreName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748'
  },
  chorePoints: {
    fontSize: 14,
    color: '#4A5568',
    marginTop: 2
  },
  choreStatus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8EE3C2',
    alignItems: 'center',
    justifyContent: 'center'
  },
  choreStatusText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold'
  },
  choreStatusPending: {
    backgroundColor: 'rgba(99, 179, 237, 0.1)',
    borderWidth: 2,
    borderColor: '#63B3ED'
  },
  choreStatusTextPending: {
    fontSize: 18,
    color: '#63B3ED',
    fontWeight: 'bold'
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  timeInput: {
    flex: 1
  },
  clockButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 179, 237, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#63B3ED'
  },
  clockIcon: {
    fontSize: 20
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  halfWidth: {
    flex: 1,
    marginRight: 8
  },
  timePickerContainer: {
    flexDirection: 'row',
    height: 200,
    marginBottom: 20
  },
  timePickerColumn: {
    flex: 1,
    marginHorizontal: 8
  },
  timePickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 8
  },
  timePickerScroll: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: '#F7FAFC'
  },
  timePickerOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  timePickerOptionSelected: {
    backgroundColor: 'rgba(99, 179, 237, 0.1)',
    borderColor: '#63B3ED'
  },
  timePickerText: {
    fontSize: 16,
    color: '#4A5568'
  },
  timePickerTextSelected: {
    color: '#63B3ED',
    fontWeight: '600'
  }
});

const homeButtonStyles = StyleSheet.create({
  container: {
    marginLeft: 12
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#63B3ED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  icon: {
    fontSize: 16,
    marginRight: 6
  },
  text: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14
  }
});

const voiceCommandStyles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  commandItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  commandIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 30
  },
  commandText: {
    fontSize: 16,
    color: '#2D3748',
    fontWeight: '500'
  }
});

const settingsStyles = StyleSheet.create({
  section: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16
  },
  settingItem: {
    marginBottom: 16
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8
  },
  settingInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F7FAFC'
  },
  settingValue: {
    fontSize: 16,
    color: '#4A5568',
    fontWeight: '500'
  },
  avatarScroll: {
    marginBottom: 8
  },
  avatarOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F7FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  avatarOptionSelected: {
    borderColor: '#63B3ED',
    backgroundColor: 'rgba(99, 179, 237, 0.1)'
  },
  avatarText: {
    fontSize: 24
  },
  actionButton: {
    backgroundColor: '#63B3ED',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600'
  },
  logoutButton: {
    backgroundColor: '#E53E3E'
  },
  logoutButtonText: {
    color: '#FFF'
  },
  dangerButton: {
    backgroundColor: '#E53E3E'
  },
  dangerButtonText: {
    color: '#FFF'
  },
  supportButton: {
    backgroundColor: '#38A169'
  },
  supportButtonText: {
    color: '#FFF'
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  timeInput: {
    flex: 1,
    marginRight: 8
  },
  clockButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 179, 237, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#63B3ED'
  },
  clockIcon: {
    fontSize: 20
  },
  incrementContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  incrementButton: {
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center'
  },
  incrementText: {
    fontSize: 14,
    color: '#2D3748',
    fontWeight: '500'
  },
  permissionStatus: {
    fontSize: 16,
    color: '#38A169',
    fontWeight: '500'
  }
});

// Credits Modal Styles
const creditsStyles = StyleSheet.create({
  content: {
    padding: 20,
    alignItems: 'center',
  },
  company: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
    textAlign: 'center',
  },
  address: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 4,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    width: '100%',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
    textAlign: 'center',
  },
  developer: {
    fontSize: 16,
    color: '#4A5568',
    marginBottom: 8,
    textAlign: 'center',
  },
  purpose: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

// Legal Document Styles
const legalStyles = StyleSheet.create({
  scrollContent: {
    maxHeight: 400,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginTop: 16,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
    marginBottom: 8,
  },
  bullet: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
    marginLeft: 16,
    marginBottom: 4,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#718096',
    fontStyle: 'italic',
    marginTop: 16,
    textAlign: 'center',
  },
});

const tabStyles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    ...enhancedTheme.shadows.soft
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  tab: {
    marginRight: 12
  },
  activeTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center'
  },
  activeTabText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14
  },
  inactiveTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 179, 237, 0.1)',
    minWidth: 80,
    alignItems: 'center'
  },
  inactiveTabText: {
    color: '#63B3ED',
    fontWeight: '500',
    fontSize: 14
  }
});

// Reports styles
const reportsStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  overviewCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    ...enhancedTheme.shadows.soft
  },
  overviewNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#63B3ED'
  },
  overviewLabel: {
    fontSize: 12,
    color: '#4A5568',
    marginTop: 4,
    textAlign: 'center'
  },
  childCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    ...enhancedTheme.shadows.soft
  },
  childCardGradient: {
    padding: 16
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  childAvatar: {
    fontSize: 32,
    marginRight: 12
  },
  childInfo: {
    flex: 1
  },
  childName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748'
  },
  childAge: {
    fontSize: 14,
    color: '#4A5568'
  },
  pointsBadge: {
    backgroundColor: '#8EE3C2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  pointsText: {
    color: '#0C1B2A',
    fontWeight: '600',
    fontSize: 14
  },
  progressSection: {
    marginTop: 8
  },
  progressLabel: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 8
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(99, 179, 237, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#63B3ED',
    borderRadius: 4
  },
  progressText: {
    fontSize: 12,
    color: '#63B3ED',
    fontWeight: '600',
    textAlign: 'right'
  },
  choreStats: {
    flexDirection: 'row',
    gap: 12
  },
  choreStatCard: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    ...enhancedTheme.shadows.soft
  },
  choreStatTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 12
  },
  choreStatItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  choreStatEmoji: {
    fontSize: 20,
    marginRight: 8
  },
  choreStatName: {
    flex: 1,
    fontSize: 14,
    color: '#2D3748',
    fontWeight: '500'
  },
  choreStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#63B3ED'
  },
  screenTimeCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...enhancedTheme.shadows.soft
  },
  screenTimeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  screenTimeChild: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748'
  },
  screenTimeStatus: {
    fontSize: 14,
    color: '#4A5568'
  },
  screenTimeBar: {
    height: 6,
    backgroundColor: 'rgba(99, 179, 237, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8
  },
  screenTimeFill: {
    height: '100%',
    backgroundColor: '#63B3ED',
    borderRadius: 3
  },
  screenTimeWeekly: {
    fontSize: 12,
    color: '#4A5568'
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    ...enhancedTheme.shadows.soft
  },
  achievementEmoji: {
    fontSize: 24,
    marginRight: 12
  },
  achievementContent: {
    flex: 1
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4
  },
  achievementDescription: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 4
  },
  achievementMeta: {
    fontSize: 12,
    color: '#63B3ED',
    fontWeight: '500'
  }
});

// Help styles
const helpStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFDF9'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: '#4A5568',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24
  },
  form: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    ...enhancedTheme.shadows.soft
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
    marginTop: 16
  },
  input: {
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2D3748',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top'
  },
  submitButton: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden'
  },
  submitButtonGradient: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 12
  },
  submitButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16
  },
  contactInfo: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    ...enhancedTheme.shadows.soft
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 16,
    textAlign: 'center'
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  contactIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24
  },
  contactText: {
    fontSize: 16,
    color: '#4A5568',
    flex: 1
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...enhancedTheme.shadows.soft
  },
  modalIcon: {
    fontSize: 48,
    marginBottom: 16
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 12,
    textAlign: 'center'
  },
  modalMessage: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24
  },
  modalButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%'
  },
  modalButtonGradient: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 12
  },
  modalButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16
  }
});

// Onboarding Flow Component
const OnboardingFlow: React.FC<{
  step: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  // Parent Profile
  parentName: string;
  setParentName: (name: string) => void;
  parentPhone: string;
  setParentPhone: (phone: string) => void;
  parentAvatar: string;
  setParentAvatar: (avatar: string) => void;
  // Screen Time Policy
  defaultLimit: string;
  setDefaultLimit: (limit: string) => void;
  quietStart: string;
  setQuietStart: (start: string) => void;
  quietEnd: string;
  setQuietEnd: (end: string) => void;
  maxRequests: string;
  setMaxRequests: (requests: string) => void;
  // First Child
  childName: string;
  setChildName: (name: string) => void;
  childAge: string;
  setChildAge: (age: string) => void;
  childAvatar: string;
  setChildAvatar: (avatar: string) => void;
  childLimit: string;
  setChildLimit: (limit: string) => void;
  childStart: string;
  setChildStart: (start: string) => void;
  childEnd: string;
  setChildEnd: (end: string) => void;
}> = ({ 
  step, onNext, onPrev, onSkip,
  parentName, setParentName,
  parentPhone, setParentPhone,
  parentAvatar, setParentAvatar,
  defaultLimit, setDefaultLimit,
  quietStart, setQuietStart,
  quietEnd, setQuietEnd,
  maxRequests, setMaxRequests,
  childName, setChildName,
  childAge, setChildAge,
  childAvatar, setChildAvatar,
  childLimit, setChildLimit,
  childStart, setChildStart,
  childEnd, setChildEnd
}) => {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerType, setTimePickerType] = useState<'start' | 'end'>('start');
  const [selectedHour, setSelectedHour] = useState(7);
  const [selectedMinute, setSelectedMinute] = useState(0);

  const openTimePicker = (type: 'start' | 'end') => {
    setTimePickerType(type);
    setShowTimePicker(true);
    
    const currentTime = type === 'start' ? quietStart : quietEnd;
    const [hour, minute] = currentTime.split(':').map(Number);
    setSelectedHour(hour);
    setSelectedMinute(minute);
  };

  const confirmTimeSelection = () => {
    const timeString = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    
    if (timePickerType === 'start') {
      setQuietStart(timeString);
    } else {
      setQuietEnd(timeString);
    }
    
    setShowTimePicker(false);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={onboardingStyles.stepContainer}>
            <Text style={onboardingStyles.stepTitle}>Welcome to Chorelito AI! 🎉</Text>
            <Text style={onboardingStyles.stepDescription}>
              Your AI-powered parenting assistant to help manage screen time and create healthy digital habits for your family.
            </Text>
            <View style={onboardingStyles.featureList}>
              <View style={onboardingStyles.featureItem}>
                <Text style={onboardingStyles.featureIcon}>🎯</Text>
                <Text style={onboardingStyles.featureText}>Smart screen time management</Text>
              </View>
              <View style={onboardingStyles.featureItem}>
                <Text style={onboardingStyles.featureIcon}>🎤</Text>
                <Text style={onboardingStyles.featureText}>Voice commands for easy control</Text>
              </View>
              <View style={onboardingStyles.featureItem}>
                <Text style={onboardingStyles.featureIcon}>📊</Text>
                <Text style={onboardingStyles.featureText}>Progress tracking and reports</Text>
              </View>
              <View style={onboardingStyles.featureItem}>
                <Text style={onboardingStyles.featureIcon}>🤖</Text>
                <Text style={onboardingStyles.featureText}>AI-powered parenting assistance</Text>
              </View>
            </View>
          </View>
        );

      case 1:
        return (
          <View style={onboardingStyles.stepContainer}>
            <Text style={onboardingStyles.stepTitle}>Let's set up your profile 👤</Text>
            <Text style={onboardingStyles.stepDescription}>
              Tell us about yourself so we can personalize your experience.
            </Text>
            
            <View style={onboardingStyles.inputGroup}>
              <Text style={onboardingStyles.inputLabel}>Your Name</Text>
              <TextInput
                style={onboardingStyles.textInput}
                value={parentName}
                onChangeText={setParentName}
                placeholder="Enter your name"
              />
            </View>

            <View style={onboardingStyles.inputGroup}>
              <Text style={onboardingStyles.inputLabel}>Phone Number</Text>
              <TextInput
                style={onboardingStyles.textInput}
                value={parentPhone}
                onChangeText={setParentPhone}
                placeholder="+1 (555) 123-4567"
                keyboardType="phone-pad"
              />
            </View>

            <View style={onboardingStyles.inputGroup}>
              <Text style={onboardingStyles.inputLabel}>Choose Your Avatar</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={onboardingStyles.avatarScroll}>
                {['👩', '👨', '🧑', '👵', '👴'].map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    onPress={() => setParentAvatar(emoji)}
                    style={[
                      onboardingStyles.avatarOption,
                      parentAvatar === emoji && onboardingStyles.avatarOptionSelected
                    ]}
                  >
                    <Text style={onboardingStyles.avatarText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        );

      case 2:
        return (
          <View style={onboardingStyles.stepContainer}>
            <Text style={onboardingStyles.stepTitle}>Screen Time Policy ⏰</Text>
            <Text style={onboardingStyles.stepDescription}>
              Set your family's default screen time rules. You can customize these for each child later.
            </Text>
            
            <View style={onboardingStyles.inputGroup}>
              <Text style={onboardingStyles.inputLabel}>Default Daily Limit (minutes)</Text>
              <TextInput
                style={onboardingStyles.textInput}
                value={defaultLimit}
                onChangeText={setDefaultLimit}
                placeholder="120"
                keyboardType="numeric"
              />
            </View>

            <View style={onboardingStyles.inputGroup}>
              <Text style={onboardingStyles.inputLabel}>Quiet Hours Start</Text>
              <View style={onboardingStyles.timeInputContainer}>
                <TextInput
                  style={[onboardingStyles.textInput, onboardingStyles.timeInput]}
                  value={quietStart}
                  onChangeText={setQuietStart}
                  placeholder="07:00"
                  keyboardType="numeric"
                />
                <TouchableOpacity 
                  style={onboardingStyles.clockButton}
                  onPress={() => openTimePicker('start')}
                >
                  <Text style={onboardingStyles.clockIcon}>🕐</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={onboardingStyles.inputGroup}>
              <Text style={onboardingStyles.inputLabel}>Quiet Hours End</Text>
              <View style={onboardingStyles.timeInputContainer}>
                <TextInput
                  style={[onboardingStyles.textInput, onboardingStyles.timeInput]}
                  value={quietEnd}
                  onChangeText={setQuietEnd}
                  placeholder="21:00"
                  keyboardType="numeric"
                />
                <TouchableOpacity 
                  style={onboardingStyles.clockButton}
                  onPress={() => openTimePicker('end')}
                >
                  <Text style={onboardingStyles.clockIcon}>🕐</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={onboardingStyles.inputGroup}>
              <Text style={onboardingStyles.inputLabel}>Max "Request More Time" per day</Text>
              <TextInput
                style={onboardingStyles.textInput}
                value={maxRequests}
                onChangeText={setMaxRequests}
                placeholder="3"
                keyboardType="numeric"
              />
            </View>
          </View>
        );

      case 3:
        return (
          <View style={onboardingStyles.stepContainer}>
            <Text style={onboardingStyles.stepTitle}>Add Your First Child 👶</Text>
            <Text style={onboardingStyles.stepDescription}>
              Let's create a profile for your first child. You can add more children later.
            </Text>
            
            <View style={onboardingStyles.inputGroup}>
              <Text style={onboardingStyles.inputLabel}>Child's Name</Text>
              <TextInput
                style={onboardingStyles.textInput}
                value={childName}
                onChangeText={setChildName}
                placeholder="Enter child's name"
              />
            </View>

            <View style={onboardingStyles.inputGroup}>
              <Text style={onboardingStyles.inputLabel}>Age</Text>
              <TextInput
                style={onboardingStyles.textInput}
                value={childAge}
                onChangeText={setChildAge}
                placeholder="8"
                keyboardType="numeric"
              />
            </View>

            <View style={onboardingStyles.inputGroup}>
              <Text style={onboardingStyles.inputLabel}>Choose Avatar</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={onboardingStyles.avatarScroll}>
                {['👦', '👧', '🧒', '👶'].map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    onPress={() => setChildAvatar(emoji)}
                    style={[
                      onboardingStyles.avatarOption,
                      childAvatar === emoji && onboardingStyles.avatarOptionSelected
                    ]}
                  >
                    <Text style={onboardingStyles.avatarText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={onboardingStyles.inputGroup}>
              <Text style={onboardingStyles.inputLabel}>Daily Screen Time Limit (minutes)</Text>
              <TextInput
                style={onboardingStyles.textInput}
                value={childLimit}
                onChangeText={setChildLimit}
                placeholder="60"
                keyboardType="numeric"
              />
            </View>

            <View style={onboardingStyles.inputGroup}>
              <Text style={onboardingStyles.inputLabel}>Screen Time Allowed From</Text>
              <View style={onboardingStyles.timeInputContainer}>
                <TextInput
                  style={[onboardingStyles.textInput, onboardingStyles.timeInput]}
                  value={childStart}
                  onChangeText={setChildStart}
                  placeholder="07:00"
                  keyboardType="numeric"
                />
                <TouchableOpacity 
                  style={onboardingStyles.clockButton}
                  onPress={() => openTimePicker('start')}
                >
                  <Text style={onboardingStyles.clockIcon}>🕐</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={onboardingStyles.inputGroup}>
              <Text style={onboardingStyles.inputLabel}>Screen Time Allowed Until</Text>
              <View style={onboardingStyles.timeInputContainer}>
                <TextInput
                  style={[onboardingStyles.textInput, onboardingStyles.timeInput]}
                  value={childEnd}
                  onChangeText={setChildEnd}
                  placeholder="20:00"
                  keyboardType="numeric"
                />
                <TouchableOpacity 
                  style={onboardingStyles.clockButton}
                  onPress={() => openTimePicker('end')}
                >
                  <Text style={onboardingStyles.clockIcon}>🕐</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );

      case 4:
        return (
          <View style={onboardingStyles.stepContainer}>
            <Text style={onboardingStyles.stepTitle}>Permissions & Privacy 🔒</Text>
            <Text style={onboardingStyles.stepDescription}>
              We need a few permissions to provide the best experience for your family.
            </Text>
            
            <View style={onboardingStyles.permissionItem}>
              <Text style={onboardingStyles.permissionIcon}>🎤</Text>
              <View style={onboardingStyles.permissionContent}>
                <Text style={onboardingStyles.permissionTitle}>Microphone Access</Text>
                <Text style={onboardingStyles.permissionDescription}>
                  Required for voice commands and AI assistance
                </Text>
              </View>
              <Text style={onboardingStyles.permissionStatus}>✅ Granted</Text>
            </View>

            <View style={onboardingStyles.permissionItem}>
              <Text style={onboardingStyles.permissionIcon}>📷</Text>
              <View style={onboardingStyles.permissionContent}>
                <Text style={onboardingStyles.permissionTitle}>Camera Access</Text>
                <Text style={onboardingStyles.permissionDescription}>
                  Optional for profile photos and family moments
                </Text>
              </View>
              <Text style={onboardingStyles.permissionStatus}>✅ Granted</Text>
            </View>

            <View style={onboardingStyles.permissionItem}>
              <Text style={onboardingStyles.permissionIcon}>📱</Text>
              <View style={onboardingStyles.permissionContent}>
                <Text style={onboardingStyles.permissionTitle}>Screen Time Monitoring</Text>
                <Text style={onboardingStyles.permissionDescription}>
                  Essential for tracking and managing screen time
                </Text>
              </View>
              <Text style={onboardingStyles.permissionStatus}>✅ Granted</Text>
            </View>

            <View style={onboardingStyles.privacyNote}>
              <Text style={onboardingStyles.privacyNoteText}>
                🔐 Your family's data is encrypted and never shared with third parties. 
                We're committed to protecting your privacy.
              </Text>
            </View>
          </View>
        );

      case 5:
        return (
          <View style={onboardingStyles.stepContainer}>
            <Text style={onboardingStyles.stepTitle}>You're All Set! 🎉</Text>
            <Text style={onboardingStyles.stepDescription}>
              Welcome to your AI-powered parenting journey! Here's what you can do next:
            </Text>
            
            <View style={onboardingStyles.nextStepsList}>
              <View style={onboardingStyles.nextStepItem}>
                <Text style={onboardingStyles.nextStepIcon}>🎤</Text>
                <Text style={onboardingStyles.nextStepText}>Try voice commands on the Home screen</Text>
              </View>
              <View style={onboardingStyles.nextStepItem}>
                <Text style={onboardingStyles.nextStepIcon}>👶</Text>
                <Text style={onboardingStyles.nextStepText}>Add more children in the Children tab</Text>
              </View>
              <View style={onboardingStyles.nextStepItem}>
                <Text style={onboardingStyles.nextStepIcon}>🧹</Text>
                <Text style={onboardingStyles.nextStepText}>Create chores in the Chores tab</Text>
              </View>
              <View style={onboardingStyles.nextStepItem}>
                <Text style={onboardingStyles.nextStepIcon}>⚙️</Text>
                <Text style={onboardingStyles.nextStepText}>Customize settings anytime</Text>
              </View>
            </View>

            <View style={onboardingStyles.completionMessage}>
              <Text style={onboardingStyles.completionMessageText}>
                Ready to start managing screen time with AI assistance? Let's go! 🚀
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={onboardingStyles.container}>
      <LinearGradient
        colors={['#63B3ED', '#8EE3C2']}
        style={onboardingStyles.header}
      >
        <Text style={onboardingStyles.headerTitle}>Chorelito AI</Text>
        <Text style={onboardingStyles.headerSubtitle}>Setup</Text>
      </LinearGradient>

      <ScrollView 
        style={onboardingStyles.scrollContent}
        contentContainerStyle={onboardingStyles.scrollContentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={onboardingStyles.progressContainer}>
          <View style={onboardingStyles.progressBar}>
            <View 
              style={[
                onboardingStyles.progressFill, 
                { width: `${((step + 1) / 6) * 100}%` }
              ]} 
            />
          </View>
          <Text style={onboardingStyles.progressText}>
            Step {step + 1} of 6
          </Text>
        </View>

        {renderStep()}

        {/* Navigation buttons inside ScrollView */}
        <View style={onboardingStyles.footerInline}>
          <View style={onboardingStyles.buttonRow}>
            {step > 0 && (
              <TouchableOpacity
                style={[onboardingStyles.button, onboardingStyles.backButton]}
                onPress={onPrev}
              >
                <Text style={onboardingStyles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[onboardingStyles.button, onboardingStyles.skipButton]}
              onPress={onSkip}
            >
              <Text style={onboardingStyles.skipButtonText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[onboardingStyles.button, onboardingStyles.nextButton]}
              onPress={onNext}
            >
              <LinearGradient
                colors={enhancedTheme.gradients.primary}
                style={onboardingStyles.nextButtonGradient}
              >
                <Text style={onboardingStyles.nextButtonText}>
                  {step === 5 ? 'Get Started' : 'Next'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modalContainer}>
            <Text style={modalStyles.modalTitle}>Select Time</Text>
            
            <View style={modalStyles.timePickerContainer}>
              <View style={modalStyles.timePickerColumn}>
                <Text style={modalStyles.timePickerLabel}>Hour</Text>
                <ScrollView style={modalStyles.timePickerScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 24 }, (_, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        modalStyles.timePickerOption,
                        selectedHour === i && modalStyles.timePickerOptionSelected
                      ]}
                      onPress={() => setSelectedHour(i)}
                    >
                      <Text style={[
                        modalStyles.timePickerText,
                        selectedHour === i && modalStyles.timePickerTextSelected
                      ]}>
                        {i.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <View style={modalStyles.timePickerColumn}>
                <Text style={modalStyles.timePickerLabel}>Minute</Text>
                <ScrollView style={modalStyles.timePickerScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 60 }, (_, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        modalStyles.timePickerOption,
                        selectedMinute === i && modalStyles.timePickerOptionSelected
                      ]}
                      onPress={() => setSelectedMinute(i)}
                    >
                      <Text style={[
                        modalStyles.timePickerText,
                        selectedMinute === i && modalStyles.timePickerTextSelected
                      ]}>
                        {i.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={modalStyles.buttonRow}>
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.cancelButton]}
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={modalStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.saveButton]}
                onPress={confirmTimeSelection}
              >
                <LinearGradient
                  colors={enhancedTheme.gradients.primary}
                  style={modalStyles.saveButtonGradient}
                >
                  <Text style={modalStyles.saveButtonText}>Confirm</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export const ParentDashboard: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [showOnboarding, setShowOnboarding] = useState(true); // Set to true to test onboarding
  const [onboardingStep, setOnboardingStep] = useState(0);
  
  // Onboarding form state
  const [onboardingParentName, setOnboardingParentName] = useState('');
  const [onboardingParentPhone, setOnboardingParentPhone] = useState('');
  const [onboardingParentAvatar, setOnboardingParentAvatar] = useState('👩');
  const [onboardingDefaultLimit, setOnboardingDefaultLimit] = useState('120');
  const [onboardingQuietStart, setOnboardingQuietStart] = useState('07:00');
  const [onboardingQuietEnd, setOnboardingQuietEnd] = useState('21:00');
  const [onboardingMaxRequests, setOnboardingMaxRequests] = useState('3');
  const [onboardingChildName, setOnboardingChildName] = useState('');
  const [onboardingChildAge, setOnboardingChildAge] = useState('');
  const [onboardingChildAvatar, setOnboardingChildAvatar] = useState('👦');
  const [onboardingChildLimit, setOnboardingChildLimit] = useState('60');
  const [onboardingChildStart, setOnboardingChildStart] = useState('07:00');
  const [onboardingChildEnd, setOnboardingChildEnd] = useState('20:00');

  const handleVoicePress = () => {
    setIsListening(!isListening);
    // TODO: Wire up actual voice recognition here
    setTimeout(() => setIsListening(false), 3000); // Auto-stop after 3 seconds for demo
  };

  const handleHomePress = () => {
    setActiveTab('Home'); // Navigate to home screen with voice command button
  };

  // Onboarding navigation
  const nextOnboardingStep = () => {
    if (onboardingStep < 5) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      // Complete onboarding
      completeOnboarding();
    }
  };

  const completeOnboarding = () => {
    // TODO: Save onboarding data to persistent storage or context
    // For now, just close onboarding and go to home
    console.log('Onboarding completed with data:', {
      parentName: onboardingParentName,
      parentPhone: onboardingParentPhone,
      childName: onboardingChildName,
      childAge: onboardingChildAge
    });
    
    setShowOnboarding(false);
    setActiveTab('Home');
  };

  const prevOnboardingStep = () => {
    if (onboardingStep > 0) {
      setOnboardingStep(onboardingStep - 1);
    }
  };

  const skipOnboarding = () => {
    setShowOnboarding(false);
    setActiveTab('Home');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Home':
        return <HomeTab />;
      case 'Children':
        return <ChildrenManagementTab onHomePress={handleHomePress} />;
      case 'Chores':
        return <ChoresManagementTab onHomePress={handleHomePress} />;
      case 'Reports':
        return <ReportsTab onHomePress={handleHomePress} />;
      case 'Settings':
        return <SettingsTab onHomePress={handleHomePress} />;
      case 'Help':
        return <HelpTab onHomePress={handleHomePress} />;
      default:
        return (
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 20, color: '#2D3748' }}>Welcome!</Text>
          </View>
        );
    }
  };

  // Show onboarding if it's the first time
  if (showOnboarding) {
    return <OnboardingFlow 
      step={onboardingStep}
      onNext={nextOnboardingStep}
      onPrev={prevOnboardingStep}
      onSkip={skipOnboarding}
      // Step 0: Welcome
      // Step 1: Parent Profile
      parentName={onboardingParentName}
      setParentName={setOnboardingParentName}
      parentPhone={onboardingParentPhone}
      setParentPhone={setOnboardingParentPhone}
      parentAvatar={onboardingParentAvatar}
      setParentAvatar={setOnboardingParentAvatar}
      // Step 2: Screen Time Policy
      defaultLimit={onboardingDefaultLimit}
      setDefaultLimit={setOnboardingDefaultLimit}
      quietStart={onboardingQuietStart}
      setQuietStart={setOnboardingQuietStart}
      quietEnd={onboardingQuietEnd}
      setQuietEnd={setOnboardingQuietEnd}
      maxRequests={onboardingMaxRequests}
      setMaxRequests={setOnboardingMaxRequests}
      // Step 3: First Child
      childName={onboardingChildName}
      setChildName={setOnboardingChildName}
      childAge={onboardingChildAge}
      setChildAge={setOnboardingChildAge}
      childAvatar={onboardingChildAvatar}
      setChildAvatar={setOnboardingChildAvatar}
      childLimit={onboardingChildLimit}
      setChildLimit={setOnboardingChildLimit}
      childStart={onboardingChildStart}
      setChildStart={setOnboardingChildStart}
      childEnd={onboardingChildEnd}
      setChildEnd={setOnboardingChildEnd}
    />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFDF9' }}>
      <LinearGradient
        colors={['#63B3ED', '#8EE3C2']}
        style={{
          padding: 24,
          paddingTop: 60,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20
        }}
      >
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#FFF', marginBottom: 4 }}>
          Chorelito AI
        </Text>
        <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.9)' }}>
          Parent Dashboard
        </Text>
      </LinearGradient>

      {/* AI Top Tabs Navigation */}
      <AITopTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      {renderTabContent()}

    </View>
  );
};

// Onboarding Styles
const onboardingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF9',
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 20,
    paddingBottom: 20,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#63B3ED',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 12,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: '#718096',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  featureList: {
    marginTop: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#4A5568',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FFF',
    color: '#2D3748',
  },
  avatarScroll: {
    marginTop: 8,
  },
  avatarOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F7FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarOptionSelected: {
    borderColor: '#63B3ED',
    backgroundColor: '#EBF8FF',
  },
  avatarText: {
    fontSize: 24,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInput: {
    flex: 1,
    marginRight: 12,
  },
  clockButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F7FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  clockIcon: {
    fontSize: 20,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    marginBottom: 12,
  },
  permissionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  permissionContent: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  permissionDescription: {
    fontSize: 14,
    color: '#718096',
  },
  permissionStatus: {
    fontSize: 16,
    color: '#38A169',
    fontWeight: '600',
  },
  privacyNote: {
    backgroundColor: '#EBF8FF',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  privacyNoteText: {
    fontSize: 14,
    color: '#2B6CB0',
    lineHeight: 20,
    textAlign: 'center',
  },
  nextStepsList: {
    marginTop: 20,
  },
  nextStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  nextStepIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  nextStepText: {
    fontSize: 16,
    color: '#4A5568',
    flex: 1,
  },
  completionMessage: {
    backgroundColor: '#F0FFF4',
    padding: 20,
    borderRadius: 12,
    marginTop: 24,
    alignItems: 'center',
  },
  completionMessageText: {
    fontSize: 16,
    color: '#22543D',
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#FFFDF9',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    minHeight: 100,
  },
  footerInline: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 20,
    backgroundColor: '#FFFDF9',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 30,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  backButtonText: {
    fontSize: 16,
    color: '#4A5568',
    fontWeight: '600',
  },
  skipButton: {
    backgroundColor: 'transparent',
  },
  skipButtonText: {
    fontSize: 16,
    color: '#718096',
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: 'transparent',
  },
  nextButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
});

// Voice Transcript Styles
const voiceTranscriptStyles = StyleSheet.create({
  container: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  section: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#718096',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  text: {
    fontSize: 14,
    color: '#2D3748',
    lineHeight: 20,
  },
  response: {
    color: '#38A169',
    fontWeight: '500',
  },
  error: {
    color: '#E53E3E',
    fontWeight: '500',
  },
  closeButton: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#EDF2F7',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    color: '#4A5568',
    fontWeight: '600',
  },
});