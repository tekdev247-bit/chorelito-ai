import React from 'react';
import { View, Text } from 'react-native';
import VoiceMicButton from '../parent/components/VoiceMicButton';

export default function ParentHome() {
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, marginBottom: 12 }}>Parent Home</Text>
      <VoiceMicButton />
    </View>
  );
}
