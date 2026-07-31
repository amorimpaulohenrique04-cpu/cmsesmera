import {buildLegacyTheme} from 'sanity'
import {esmeraTokens as t} from './esmeraTokens'

export const esmeraTheme = buildLegacyTheme({
  '--black': t.color.ink,
  '--white': t.color.surface,
  '--gray': t.color.textSecondary,
  '--gray-base': t.color.textSecondary,
  '--component-bg': t.color.surface,
  '--component-text-color': t.color.ink,
  '--brand-primary': t.color.emerald,
  '--default-button-color': t.color.graphite,
  '--default-button-primary-color': t.color.ink,
  '--default-button-success-color': t.color.success,
  '--default-button-warning-color': t.color.warning,
  '--default-button-danger-color': t.color.error,
  '--state-info-color': t.color.info,
  '--state-success-color': t.color.success,
  '--state-warning-color': t.color.warning,
  '--state-danger-color': t.color.error,
  '--main-navigation-color': t.color.ink,
  '--main-navigation-color--inverted': t.color.ivory,
  '--focus-color': t.color.emerald,
})
