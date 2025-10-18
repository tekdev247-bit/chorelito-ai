import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { colors } from './styles/colors';
import LockOverlay from './child/overlay/LockOverlay';
import { useOverlayGuard } from './child/overlay/useOverlayGuard';

const DEMO_POLICY = { quietHours: [{ start: '21:00', end: '07:00' }], allowedApps: ['dialer','sms'] };
const DEMO_TIME = { budgetMinutes: 60, usedMinutes: 60 };

export default function App() {
  const [reqs, setReqs] = useState(0);
  const locked = useOverlayGuard(DEMO_POLICY as any, DEMO_TIME);

  return (
    <View style={{ flex:1, backgroundColor: colors.bg.default, alignItems:'center', justifyContent:'center', gap: 12 }}>
      <Text style={{ fontSize: 24, color: colors.text.primary }}>Chorelito AI</Text>
      <Text style={{ color: colors.text.secondary }}>Demo screen</Text>

      <Pressable style={{ backgroundColor: colors.brand.primary, padding: 12, borderRadius: 12 }}>
        <Text style={{ color: '#0C1B2A', fontWeight: 'bold' }}>Parent: Open Voice Controls</Text>
      </Pressable>

      {locked && (
        <LockOverlay onRequestMore={() => setReqs(reqs + 1)} />
      )}
    </View>
  );
}
