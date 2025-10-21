// app/parent/dashboard/ParentDashboard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, StyleSheet, Alert, Modal, TextInput } from 'react-native';
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
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [showAddChild, setShowAddChild] = useState(false);
  const [selectedChildChores, setSelectedChildChores] = useState<Child | null>(null);
  
  // Form state
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [newChildName, setNewChildName] = useState('');
  const [newChildAge, setNewChildAge] = useState('');
  const [newChildAvatar, setNewChildAvatar] = useState('👶');

  const handleEditProfile = (child: Child) => {
    setEditingChild(child);
    setEditName(child.name);
    setEditAge(child.age.toString());
    setEditAvatar(child.avatar);
  };

  const handleSaveProfile = () => {
    if (editingChild) {
      setChildren(children.map(c => 
        c.id === editingChild.id 
          ? { ...c, name: editName, age: parseInt(editAge) || c.age, avatar: editAvatar }
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
        avatar: newChildAvatar
      };
      setChildren([...children, newChild]);
      Alert.alert('Success', `${newChildName} has been added!`);
      setShowAddChild(false);
    } else {
      Alert.alert('Error', 'Please fill in all required fields');
    }
  };

  const avatarOptions = ['👧', '👦', '👶', '🧒', '👨', '👩', '🧑', '👴', '👵'];

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

      {/* Edit Profile Modal */}
      <Modal
        visible={!!editingChild}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditingChild(null)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modalContainer}>
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

            <Text style={modalStyles.label}>Name</Text>
            <TextInput
              style={modalStyles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="Enter name"
              placeholderTextColor="#999"
            />

            <Text style={modalStyles.label}>Age</Text>
            <TextInput
              style={modalStyles.input}
              value={editAge}
              onChangeText={setEditAge}
              placeholder="Enter age"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />

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

            <Text style={modalStyles.label}>Name</Text>
            <TextInput
              style={modalStyles.input}
              value={newChildName}
              onChangeText={setNewChildName}
              placeholder="Enter name"
              placeholderTextColor="#999"
            />

            <Text style={modalStyles.label}>Age</Text>
            <TextInput
              style={modalStyles.input}
              value={newChildAge}
              onChangeText={setNewChildAge}
              placeholder="Enter age"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />

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
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 20,
    textAlign: 'center'
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