/**
 * Theme configuration for the dinner planner app
 * Supports light and dark mode with colorful, modern design
 */

import { Platform } from 'react-native'
import { colors, lightColors, darkColors } from './colors'
import { designTokens } from './design'

const tintColorLight = colors.primary[500]
const tintColorDark = colors.primary[400]

export const Colors = {
  light: {
    ...lightColors,
    text: lightColors.text,
    background: lightColors.background,
    tint: tintColorLight,
    icon: lightColors.textSecondary,
    tabIconDefault: lightColors.textSecondary,
    tabIconSelected: tintColorLight,
  },
  dark: {
    ...darkColors,
    text: darkColors.text,
    background: darkColors.background,
    tint: tintColorDark,
    icon: darkColors.textSecondary,
    tabIconDefault: darkColors.textSecondary,
    tabIconSelected: tintColorDark,
  },
}

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
})

export { designTokens }
export { colors, lightColors, darkColors }
