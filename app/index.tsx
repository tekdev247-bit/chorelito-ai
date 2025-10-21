import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import LockOverlay from './child/overlay/LockOverlay';
import { useOverlayGuard } from './child/overlay/useOverlayGuard';
import VoiceMicButton from './parent/components/VoiceMicButton';
import { colors } from './styles/colors';

const DEMO_POLICY = { quietHours: [{ start: '21:00', end: '07:00' }], allowedApps: ['dialer','sms'] };
const DEMO_TIME = { budgetMinutes: 60, usedMinutes: 30 };

export default function App() {
  const [reqs, setReqs] = useState(0);
  const [showVoiceControls, setShowVoiceControls] = useState(false);
  const locked = useOverlayGuard(DEMO_POLICY as any, DEMO_TIME);

  return (
    <View style={{ flex:1, backgroundColor: colors.bg.default, alignItems:'center', justifyContent:'center', gap: 12 }}>
      <Text style={{ fontSize: 24, color: colors.text.primary }}>Chorelito AI</Text>
      <Text style={{ color: colors.text.secondary }}>Demo screen</Text>

      <Pressable 
        onPress={() => setShowVoiceControls(!showVoiceControls)}
        style={{ backgroundColor: colors.brand.primary, padding: 12, borderRadius: 12 }}
      >
        <Text style={{ color: '#0C1B2A', fontWeight: 'bold' }}>
          {showVoiceControls ? 'Hide Voice Controls' : 'Parent: Open Voice Controls'}
        </Text>
      </Pressable>

      {showVoiceControls && (
        <View style={{ alignItems: 'center', gap: 16, marginTop: 20 }}>
          <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: 'bold' }}>
            Voice Controls
          </Text>
          <VoiceMicButton />
          <Text style={{ color: colors.text.secondary, fontSize: 14, textAlign: 'center', maxWidth: 300 }}>
            Hold the microphone button and speak your command. Try saying "add child Emma" or "assign chore dishes to Sarah"
          </Text>
        </View>
      )}

      {locked && (
        <LockOverlay onRequestMore={() => setReqs(reqs + 1)} />
      )}
    </View>
  );
}
