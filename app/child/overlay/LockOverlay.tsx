import React, { useState } from 'react';
import { View, Text, Pressable, BackHandler, Alert } from 'react-native';
import { colors } from '../../styles/colors';
import { submitTimeRequest } from '../../lib/policy/requests';

type Props = { 
  onRequestMore: () => void;
  childId?: string;
};

export default function LockOverlay({ onRequestMore, childId }: Props) {
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestMore = async () => {
    if (!childId) {
      Alert.alert('Error', 'Child ID not available');
      return;
    }

    setIsRequesting(true);
    try {
      const result = await submitTimeRequest({
        childId,
        minutes: 30,
        reason: 'Request for additional screen time'
      });

      if (result.ok) {
        Alert.alert('Success', 'Time request submitted! Your parent will be notified.');
      } else {
        Alert.alert('Error', result.error || 'Failed to submit request');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit time request');
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, width: '86%', alignItems: 'center' }}>
        <Text style={{ fontSize: 24, color: '#2D3748', marginBottom: 8 }}>Chorelito</Text>
        <Text style={{ color: '#4A5568', textAlign: 'center', marginBottom: 16 }}>
          Screen time is locked right now. You can still call and text.
        </Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable onPress={() => BackHandler.exitApp()} style={{ backgroundColor: '#63B3ED', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12 }}>
            <Text style={{ color: '#0C1B2A', fontWeight: 'bold' }}>Home</Text>
          </Pressable>
          <Pressable 
            onPress={handleRequestMore} 
            disabled={isRequesting}
            style={{ 
              backgroundColor: isRequesting ? '#CCCCCC' : '#FF8C82', 
              paddingVertical: 12, 
              paddingHorizontal: 16, 
              borderRadius: 12 
            }}
          >
            <Text style={{ color: '#0C1B2A', fontWeight: 'bold' }}>
              {isRequesting ? 'Requesting...' : 'Request more time'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
