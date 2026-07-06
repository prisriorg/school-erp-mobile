/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

// Monochrome Palette
const palette = {
  white: '#FFFFFF',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
  black: '#000000',
};

export const Colors = {
  light: {
    text: palette.black,
    textSecondary: palette.gray700,
    textMuted: palette.gray500,
    background: palette.white,
    backgroundElement: palette.gray100,
    backgroundSelected: palette.gray200,
    border: palette.gray300,
    borderSelected: palette.gray900,
    icon: palette.black,
    iconSecondary: palette.gray700,
    primary: palette.black,
    primaryForeground: palette.white,
    link: palette.gray900,
  },
  dark: {
    text: palette.white,
    textSecondary: palette.gray400,
    textMuted: palette.gray600,
    background: palette.black,
    backgroundElement: palette.gray900,
    backgroundSelected: palette.gray800,
    border: palette.gray800,
    borderSelected: palette.white,
    icon: palette.white,
    iconSecondary: palette.gray400,
    primary: palette.white,
    primaryForeground: palette.black,
    link: palette.white,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
