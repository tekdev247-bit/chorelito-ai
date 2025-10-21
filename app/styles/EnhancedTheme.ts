// app/styles/EnhancedTheme.ts
import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const enhancedTheme = {
  gradients: {
    primary: ['#63B3ED', '#8EE3C2'],
    secondary: ['#FF8C82', '#C3B5F5'],
    card: ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)'],
  },
  shadows: {
    soft: {
      shadowColor: '#63B3ED',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 3
    },
    medium: {
      shadowColor: '#63B3ED',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 6
    }
  }
};

// Use StyleSheet.create for better performance
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF9'
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 16
  }
});