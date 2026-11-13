/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com
 */

import { createVuetify } from 'vuetify'
import { en, zhHans } from 'vuetify/locale'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

const studioLight = {
  dark: false,
  colors: {
    'background': '#F4F3FB',
    'surface': '#FFFFFF',
    'surface-bright': '#FFFFFF',
    'surface-variant': '#E9E7F6',
    'on-surface-variant': '#49456B',
    'primary': '#5B4BC4',
    'on-primary': '#FFFFFF',
    'secondary': '#0E7490',
    'accent': '#7C3AED',
    'error': '#DC2626',
    'warning': '#B45309',
    'info': '#2563EB',
    'success': '#047857',
    'on-background': '#201C33',
    'on-surface': '#201C33',
    'speech': '#0E7490',
    'voice-design': '#B45309',
    'voice-clone': '#BE185D',
  },
}

const studioDark = {
  dark: true,
  colors: {
    'background': '#0D0C15',
    'surface': '#161522',
    'surface-bright': '#232038',
    'surface-variant': '#2B2745',
    'on-surface-variant': '#BAB5D9',
    'primary': '#8B7CF6',
    'on-primary': '#100E1C',
    'secondary': '#22D3EE',
    'accent': '#A78BFA',
    'error': '#FB7185',
    'warning': '#FBBF24',
    'info': '#60A5FA',
    'success': '#34D399',
    'on-background': '#EAE8F8',
    'on-surface': '#EAE8F8',
    'speech': '#22D3EE',
    'voice-design': '#FBBF24',
    'voice-clone': '#F472B6',
  },
}

export default createVuetify({
  theme: {
    defaultTheme: 'system',
    themes: {
      light: studioLight,
      dark: studioDark,
    },
    utilities: false,
  },
  locale: {
    locale: 'zhHans',
    fallback: 'en',
    messages: { zhHans, en },
  },
  display: {
    mobileBreakpoint: 'md',
    thresholds: {
      xs: 0,
      sm: 600,
      md: 840,
      lg: 1145,
      xl: 1545,
      xxl: 2138,
    },
  },
  defaults: {
    VAlert: { rounded: 'lg' },
    VBtn: { rounded: 'lg' },
    VCard: { rounded: 'lg' },
    VChip: { rounded: 'lg' },
    VSelect: { variant: 'outlined', density: 'comfortable', color: 'primary', hideDetails: 'auto' },
    VTextField: { variant: 'outlined', density: 'comfortable', color: 'primary', hideDetails: 'auto' },
    VTextarea: { variant: 'outlined', density: 'comfortable', color: 'primary', hideDetails: 'auto' },
  },
})
