// app/parent/dashboard/ParentDashboard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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

// Inline ChildrenManagementTab component
interface Child {
  id: string;
  name: string;
  age: number;
  points: number;
  level: number;
  avatar: string;
}

const ChildrenManagementTab: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([
    { id: '1', name: 'Emma', age: 8, points: 450, level: 3, avatar: '👧' },
    { id: '2', name: 'Liam', age: 6, points: 280, level: 2, avatar: '👦' }
  ]);

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#2D3748', marginBottom: 8 }}>
        Manage Children
      </Text>
      <Text style={{ fontSize: 16, color: '#4A5568', marginBottom: 16 }}>
        Edit profiles and view progress
      </Text>

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
              <TouchableOpacity style={childCardStyles.editButton}>
                <Text style={childCardStyles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={childCardStyles.choresButton}>
                <Text style={childCardStyles.choresButtonText}>View Chores</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      ))}

      <TouchableOpacity style={childCardStyles.addButton}>
        <LinearGradient
          colors={enhancedTheme.gradients.primary}
          style={childCardStyles.addButtonGradient}
        >
          <Text style={childCardStyles.addButtonIcon}>+</Text>
          <Text style={childCardStyles.addButtonText}>Add New Child</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
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
    marginTop: 8,
    borderRadius: 20,
    shadowColor: '#63B3ED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3
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
        return <ChildrenManagementTab />;
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