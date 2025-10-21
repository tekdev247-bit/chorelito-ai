// App.tsx for Expo 52
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ParentDashboard } from './app/parent/dashboard/ParentDashboard';
import './app/lib/firebase';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <ParentDashboard />
    </SafeAreaProvider>
  );
}