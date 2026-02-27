/**
 * Theme color hook for PraanSettu
 */

import { COLORS } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const ThemeColors = {
  light: {
    text: COLORS.textPrimary,
    background: COLORS.background,
    tint: COLORS.accent,
    icon: COLORS.textMuted,
    tabIconDefault: COLORS.textMuted,
    tabIconSelected: COLORS.accent,
  },
  dark: {
    text: COLORS.textOnDark,
    background: COLORS.darkBg,
    tint: COLORS.accent,
    icon: COLORS.textMuted,
    tabIconDefault: COLORS.textMuted,
    tabIconSelected: COLORS.accent,
  },
};

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof ThemeColors.light & keyof typeof ThemeColors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return ThemeColors[theme][colorName];
  }
}
