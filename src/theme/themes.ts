import type { MantineColorsTuple } from '@mantine/core'

export const themeIds = ['verdant', 'ember'] as const

export type ThemeId = (typeof themeIds)[number]

export type FellowsTheme = {
  id: ThemeId
  label: string
  description: string
  brand: MantineColorsTuple
  tokens: Record<`--ff-${string}`, string>
}

export const themes: Record<ThemeId, FellowsTheme> = {
  verdant: {
    id: 'verdant',
    label: 'Verdant',
    description: 'The original moss-and-lantern palette.',
    brand: [
      '#f7fee7',
      '#ecfccb',
      '#d9f99d',
      '#bef264',
      '#a3e635',
      '#84cc16',
      '#65a30d',
      '#4d7c0f',
      '#3f6212',
      '#365314',
    ],
    tokens: {
      '--ff-bg-root': '#070907',
      '--ff-bg-frame': '#0d110d',
      '--ff-bg-header': '#080a08',
      '--ff-bg-panel': '#101410',
      '--ff-bg-battlefield': '#121912',
      '--ff-bg-command-start': '#151a15',
      '--ff-bg-command-end': '#0b0e0b',
      '--ff-surface': '#121612',
      '--ff-surface-strong': '#1a201a',
      '--ff-portrait': '#293029',
      '--ff-portrait-paper': '#ded8cc',
      '--ff-text': '#f1f3f1',
      '--ff-text-muted': '#8f998f',
      '--ff-accent': '#a3e635',
      '--ff-accent-strong': '#84cc16',
      '--ff-on-accent': '#11150f',
      '--ff-border': 'rgba(255, 255, 255, 0.12)',
      '--ff-border-strong': 'rgba(163, 230, 53, 0.45)',
      '--ff-shadow': 'rgba(0, 0, 0, 0.5)',
      '--ff-health': '#8fc53f',
      '--ff-stamina': '#4dabf7',
      '--ff-danger': '#fa5252',
      '--ff-warning': '#fcc419',
      '--ff-info': '#339af0',
    },
  },
  ember: {
    id: 'ember',
    label: 'Ember',
    description: 'Warm iron, firelight, and old leather.',
    brand: [
      '#fff4e6',
      '#ffe8cc',
      '#ffd8a8',
      '#ffc078',
      '#ffa94d',
      '#ff922b',
      '#fd7e14',
      '#f76707',
      '#e8590c',
      '#d9480f',
    ],
    tokens: {
      '--ff-bg-root': '#0c0808',
      '--ff-bg-frame': '#140d0b',
      '--ff-bg-header': '#100a09',
      '--ff-bg-panel': '#18100e',
      '--ff-bg-battlefield': '#211512',
      '--ff-bg-command-start': '#211411',
      '--ff-bg-command-end': '#100a08',
      '--ff-surface': '#1b1210',
      '--ff-surface-strong': '#281916',
      '--ff-portrait': '#3a2621',
      '--ff-portrait-paper': '#e2d4c4',
      '--ff-text': '#f7f0eb',
      '--ff-text-muted': '#aa9588',
      '--ff-accent': '#ff922b',
      '--ff-accent-strong': '#f76707',
      '--ff-on-accent': '#1a0e05',
      '--ff-border': 'rgba(255, 232, 204, 0.14)',
      '--ff-border-strong': 'rgba(255, 146, 43, 0.5)',
      '--ff-shadow': 'rgba(0, 0, 0, 0.55)',
      '--ff-health': '#94c45a',
      '--ff-stamina': '#4dabf7',
      '--ff-danger': '#ff6b6b',
      '--ff-warning': '#ffd43b',
      '--ff-info': '#4dabf7',
    },
  },
}

export const defaultThemeId: ThemeId = 'verdant'

export function isThemeId(value: string | null): value is ThemeId {
  return themeIds.includes(value as ThemeId)
}
