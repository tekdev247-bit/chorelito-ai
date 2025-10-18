import React from 'react';
import { Pressable, View, Text } from 'react-native';
import { useVoiceSession } from '../../lib/voice/useVoiceSession';
import { colors, component, radii } from '../../styles/theme';

export default function VoiceMicButton() {
  const { listening, partial, start, stop } = useVoiceSession();
  return (
    <View style={{ alignItems: 'center', gap: 8 }}>
      <Pressable
        onPressIn={start}
        onPressOut={stop}
        style={{
          width: 72, height: 72, borderRadius: 9999,
          backgroundColor: '#63B3ED', alignItems: 'center', justifyContent: 'center'
        }}
      >
        <Text style={{ color: '#0C1B2A', fontWeight: 'bold' }}>{listening ? '...' : 'Hold'}</Text>
      </Pressable>
      {partial ? <Text style={{ color: '#4A5568', fontSize: 12 }}>{partial}</Text> : null}
    </View>
  );
}
