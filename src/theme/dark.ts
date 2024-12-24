import { ThemeVars } from '@mysten/dapp-kit';

export const darkTheme: ThemeVars = {
  blurs: {
    modalOverlay: 'blur(0)',
  },
  backgroundColors: {
    primaryButton: '#1E1E1E',
    primaryButtonHover: '#2A2A2A',
    outlineButtonHover: '#2D2D2D',
    modalOverlay: 'rgba(0, 0, 0, 0.5)',
    modalPrimary: '#1A1A1A',
    modalSecondary: '#232323',
    iconButton: 'transparent',
    iconButtonHover: '#2A2A2A',
    dropdownMenu: '#1A1A1A',
    dropdownMenuSeparator: '#2D2D2D',
    walletItemSelected: '#2A2A2A',
    walletItemHover: '#3C3C3C',
  },
  borderColors: {
    outlineButton: '#3D3D3D',
  },
  colors: {
    primaryButton: '#FFFFFF',
    outlineButton: '#FFFFFF',
    iconButton: '#FFFFFF',
    body: '#FFFFFF',
    bodyMuted: '#A1A1A1',
    bodyDanger: '#FF794B',
  },
  radii: {
    small: '6px',
    medium: '8px',
    large: '12px',
    xlarge: '16px',
  },
  shadows: {
    primaryButton: '0px 0px 0px rgba(0, 0, 0, 0)',
    walletItemSelected: '0px 0px 0px rgba(0, 0, 0, 0)',
  },
  fontWeights: {
    normal: '400',
    medium: '500',
    bold: '600',
  },
  fontSizes: {
    small: '14px',
    medium: '16px',
    large: '18px',
    xlarge: '20px',
  },
  typography: {
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    fontStyle: 'normal',
    lineHeight: '1.3',
    letterSpacing: '1',
  },
}