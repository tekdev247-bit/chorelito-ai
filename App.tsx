// App.tsx for Expo 52
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ParentDashboard } from './app/parent/dashboard/ParentDashboard';
import { AuthProvider, useAuth } from './app/lib/authContext';
import { AuthFlow } from './app/auth/AuthFlow';
import './app/lib/firebase';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show splash screen for 3 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Show splash screen
  if (showSplash) {
    return (
      <LinearGradient 
        colors={['#63B3ED', '#8EE3C2']} 
        style={styles.splashContainer}
      >
        <Image 
          source={require('./assets/Chorelito_Splash.png')} 
          style={styles.splashImage}
          resizeMode="contain"
        />
      </LinearGradient>
    );
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#FFFDF9' 
      }}>
        <ActivityIndicator size="large" color="#63B3ED" />
      </View>
    );
  }

  return isAuthenticated ? <ParentDashboard /> : <AuthFlow />;
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashImage: {
    width: '100%',
    height: '100%',
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}