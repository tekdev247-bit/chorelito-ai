// app/parent/dashboard/ParentDashboard.tsx - Simplified version for testing
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const ParentDashboard: React.FC = () => {
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

      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#2D3748', marginTop: 20 }}>
          Welcome to Chorelito AI!
        </Text>
        <Text style={{ fontSize: 16, color: '#4A5568', marginTop: 12 }}>
          Your modern parenting dashboard is loading...
        </Text>
        
        <View style={{
          marginTop: 24,
          backgroundColor: 'rgba(99, 179, 237, 0.1)',
          padding: 20,
          borderRadius: 16
        }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#2D3748', marginBottom: 8 }}>
            ✨ Features Coming Soon:
          </Text>
          <Text style={{ fontSize: 14, color: '#4A5568', marginTop: 4 }}>
            • Child Management
          </Text>
          <Text style={{ fontSize: 14, color: '#4A5568', marginTop: 4 }}>
            • Chores & Tasks
          </Text>
          <Text style={{ fontSize: 14, color: '#4A5568', marginTop: 4 }}>
            • Progress Reports
          </Text>
          <Text style={{ fontSize: 14, color: '#4A5568', marginTop: 4 }}>
            • AI Voice Controls
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

