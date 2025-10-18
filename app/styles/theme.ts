export const radii = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 };
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, "2xl": 32 };
export const elevation = {
  card: { shadowColor: '#101828', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  modal: { shadowColor: '#101828', shadowOpacity: 0.16, shadowOffset: { width: 0, height: 8 }, shadowRadius: 24, elevation: 8 }
};
export const typography = {
  fontFamily: { regular: 'System', medium: 'System', bold: 'System' },
  size: { xs: 12, sm: 14, md: 16, lg: 20, xl: 24, "2xl": 28, "3xl": 32 }
};
export const component = {
  button: {
    height: 48,
    radius: 14,
    paddingH: 16,
    primary: { bg: '#63B3ED', text: '#0C1B2A', pressed: '#3182CE' },
    secondary: { bg: '#FF8C82', text: '#0C1B2A', pressed: '#E56257' },
    ghost: { bg: 'transparent', text: '#1A365D', pressed: '#E2E8F0' }
  },
  input: {
    height: 48,
    radius: 12,
    bg: '#FFFFFF',
    border: '#E2E8F0',
    focus: '#63B3ED'
  },
  card: { radius: 16, bg: '#FFFFFF', border: '#E2E8F0' },
  tag: {
    radius: 999,
    variants: {
      mint: { bg: '#E3FAF0', text: '#0C1B2A' },
      lavender: { bg: '#EFEAFD', text: '#0C1B2A' },
      coral: { bg: '#FFE6E3', text: '#0C1B2A' }
    }
  }
};
