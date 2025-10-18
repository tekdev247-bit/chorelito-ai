import Voice from '@react-native-voice/voice';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState, useCallback } from 'react';
import { parseRules } from './nlu';
import { httpsCallable, getFunctions } from 'firebase/functions';

export function useVoiceSession() {
  const [listening, setListening] = useState(false);
  const [partial, setPartial] = useState('');
  const [finalText, setFinalText] = useState('');
  const [lastMessage, setLastMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const functions = getFunctions();

  const speakMessage = useCallback(async (message: string) => {
    try {
      setLastMessage(message);
      await Speech.speak(message, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9
      });
    } catch (speechError) {
      console.error('Speech error:', speechError);
      setError('Failed to speak message');
    }
  }, []);

  const handleIntent = useCallback(async (payload: any) => {
    if (isProcessing) return; // Prevent multiple simultaneous requests
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const dispatch = httpsCallable(functions, 'voice-dispatch');
      const result: any = await dispatch(payload);
      
      if (result?.data?.ok) {
        const message = result.data.say || 'Done.';
        await speakMessage(message);
      } else {
        const errorMessage = result?.data?.say || 'Sorry, I could not complete that action.';
        await speakMessage(errorMessage);
      }
    } catch (err: any) {
      console.error('Voice dispatch error:', err);
      
      let errorMessage = 'Sorry, I could not do that.';
      
      // Handle specific error types
      if (err.code === 'unauthenticated') {
        errorMessage = 'Please sign in to use voice commands.';
      } else if (err.code === 'permission-denied') {
        errorMessage = 'You do not have permission to perform this action.';
      } else if (err.code === 'unavailable') {
        errorMessage = 'Voice service is temporarily unavailable. Please try again.';
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }
      
      setError(errorMessage);
      await speakMessage(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [functions, isProcessing, speakMessage]);

  useEffect(() => {
    // Set up voice event handlers
    Voice.onSpeechStart = () => {
      setError(null);
      setLastMessage('');
    };

    Voice.onSpeechPartialResults = (e: any) => {
      const t = (e.value?.[0] ?? '').toString();
      setPartial(t);
    };

    Voice.onSpeechResults = async (e: any) => {
      const t = (e.value?.[0] ?? '').toString();
      setFinalText(t);
      
      if (!t.trim()) {
        await speakMessage('I did not hear anything. Please try again.');
        return;
      }

      try {
        const parsed = parseRules(t);
        
        // If no intent found locally, try cloud parser
        if (!parsed.intent) {
          try {
            const parseIntent = httpsCallable(functions, 'voice-parseIntent');
            const res: any = await parseIntent({ text: t });
            if (res?.data?.intent) {
              await handleIntent(res.data);
              return;
            }
          } catch (cloudError) {
            console.error('Cloud parser error:', cloudError);
            await speakMessage('I did not understand that command. Please try again.');
            return;
          }
        }
        
        if (parsed.intent) {
          await handleIntent({ intent: parsed.intent, entities: parsed.entities });
        } else {
          await speakMessage('I did not understand that command. Please try again.');
        }
      } catch (error) {
        console.error('Voice processing error:', error);
        await speakMessage('Sorry, there was an error processing your request.');
      }
    };

    Voice.onSpeechError = (e: any) => {
      console.error('Speech recognition error:', e);
      setListening(false);
      setError(e.error?.message || 'Speech recognition failed');
      
      // Provide user-friendly error messages
      let errorMessage = 'Sorry, I could not hear you clearly.';
      if (e.error?.code === '7') {
        errorMessage = 'No speech detected. Please try again.';
      } else if (e.error?.code === '6') {
        errorMessage = 'Speech recognition service is not available.';
      } else if (e.error?.code === '9') {
        errorMessage = 'Permission denied. Please enable microphone access.';
      }
      
      speakMessage(errorMessage);
    };

    Voice.onSpeechEnd = () => {
      setListening(false);
    };

    return () => {
      Voice.destroy().then(() => {
        Voice.removeAllListeners();
      }).catch(console.error);
    };
  }, [functions, handleIntent, speakMessage]);

  const start = useCallback(async () => {
    try {
      setPartial('');
      setFinalText('');
      setError(null);
      setLastMessage('');
      
      await Voice.start('en-US');
      setListening(true);
    } catch (startError) {
      console.error('Failed to start voice recognition:', startError);
      setError('Failed to start voice recognition');
      await speakMessage('Sorry, I could not start listening. Please check your microphone permissions.');
    }
  }, [speakMessage]);

  const stop = useCallback(async () => {
    try {
      await Voice.stop();
      setListening(false);
    } catch (stopError) {
      console.error('Failed to stop voice recognition:', stopError);
      setListening(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { 
    listening, 
    partial, 
    finalText, 
    lastMessage,
    error,
    isProcessing,
    start, 
    stop,
    clearError
  };
}
