// app/parent/dashboard/ParentDashboard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChildManagement } from '../../child/ChildManagement';

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
    width: 180,
    height: 180,
    borderRadius: 90,
    shadowColor: '#63B3ED',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 15
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center'
  },
  icon: {
    fontSize: 72
  }
});

// Inline AITopTabs component
const tabs = ['Children', 'Chores', 'Reports', 'AI Settings', 'Help'] as const;

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

export const ParentDashboard: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [activeTab, setActiveTab] = useState('Children');

  const handleVoicePress = () => {
    setIsListening(!isListening);
    // TODO: Wire up actual voice recognition here
    setTimeout(() => setIsListening(false), 3000); // Auto-stop after 3 seconds for demo
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Children':
        return <ChildManagement />;
      case 'Chores':
        return (
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 20, color: '#2D3748' }}>Chores coming soon...</Text>
          </View>
        );
      case 'Reports':
        return (
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 20, color: '#2D3748' }}>Reports coming soon...</Text>
          </View>
        );
      case 'AI Settings':
        return (
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 20, color: '#2D3748' }}>AI Settings coming soon...</Text>
          </View>
        );
      case 'Help':
        return (
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 20, color: '#2D3748' }}>Help coming soon...</Text>
          </View>
        );
      default:
        return (
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 20, color: '#2D3748' }}>Welcome!</Text>
          </View>
        );
    }
  };

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

      {/* Only show voice button and examples on non-Children tabs */}
      {activeTab !== 'Children' && (
        <ScrollView style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#2D3748', marginTop: 20 }}>
          Welcome to Chorelito AI!
        </Text>
        <Text style={{ fontSize: 16, color: '#4A5568', marginTop: 12 }}>
          Your AI-powered parenting assistant
        </Text>

        {/* Voice Control with Pulsating Button */}
        <View style={{
          marginTop: 24,
          backgroundColor: 'rgba(99, 179, 237, 0.1)',
          padding: 30,
          borderRadius: 20,
          alignItems: 'center'
        }}>
          <VoiceWave onPress={handleVoicePress} isListening={isListening} />
          <Text style={{ fontSize: 12, color: '#4A5568', marginTop: 16, textAlign: 'center' }}>
            {isListening ? 'Listening to your command...' : 'Tap to give a voice command'}
          </Text>
        </View>
        
        <View style={{
          marginTop: 24,
          backgroundColor: 'rgba(99, 179, 237, 0.1)',
          padding: 20,
          borderRadius: 16
        }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#2D3748', marginBottom: 8 }}>
            💬 Voice Commands:
          </Text>
          <Text style={{ fontSize: 14, color: '#4A5568', marginTop: 4 }}>
            • "Add child Emma"
          </Text>
          <Text style={{ fontSize: 14, color: '#4A5568', marginTop: 4 }}>
            • "Assign chore dishes to Sarah"
          </Text>
          <Text style={{ fontSize: 14, color: '#4A5568', marginTop: 4 }}>
            • "Show usage for Emma"
          </Text>
          <Text style={{ fontSize: 14, color: '#4A5568', marginTop: 4 }}>
            • "Grant bonus 30 minutes to Liam"
          </Text>
        </View>
        </ScrollView>
      )}
    </View>
  );
};