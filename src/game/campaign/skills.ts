import type { Skill } from '../combat/types'
import type { StatName } from './types'

export interface CampaignSkill extends Skill {
  scalingStat: StatName
  requiredStat: number
  tier: 1 | 2 | 3
}

export const campaignSkills: Record<string, CampaignSkill> = {
  'iron-strike': {
    id: 'iron-strike',
    name: 'Iron Strike',
    description: 'A reliable melee attack.',
    icon: '/assets/icons/skills/iron-strike.svg',
    cost: 1,
    target: 'enemy',
    attackBonus: 2,
    scalingStat: 'might',
    requiredStat: 2,
    tier: 1,
    effect: { type: 'damage', die: 6, bonus: 1 },
  },
  'shield-bash': {
    id: 'shield-bash',
    name: 'Shield Bash',
    description: 'Deal light damage and stagger the target.',
    icon: '/assets/icons/skills/shield-bash.svg',
    cost: 2,
    target: 'enemy',
    attackBonus: 1,
    scalingStat: 'might',
    requiredStat: 3,
    tier: 1,
    effect: { type: 'damage', die: 4, bonus: 0, stagger: true },
  },
  'quick-shot': {
    id: 'quick-shot',
    name: 'Quick Shot',
    description: 'A fast, accurate ranged attack.',
    icon: '/assets/icons/skills/quick-shot.svg',
    cost: 1,
    target: 'enemy',
    attackBonus: 2,
    scalingStat: 'finesse',
    requiredStat: 2,
    tier: 1,
    effect: { type: 'damage', die: 6, bonus: 0 },
  },
  'twin-strike': {
    id: 'twin-strike',
    name: 'Twin Strike',
    description: 'Make two precise attacks against one target.',
    icon: '/assets/icons/skills/twin-strike.svg',
    cost: 3,
    target: 'enemy',
    attackBonus: 1,
    scalingStat: 'finesse',
    requiredStat: 3,
    tier: 1,
    effect: { type: 'damage', die: 4, bonus: 0, hits: 2 },
  },
  'arc-bolt': {
    id: 'arc-bolt',
    name: 'Arc Bolt',
    description: 'A focused bolt of unstable magic.',
    icon: '/assets/icons/skills/arc-bolt.svg',
    cost: 1,
    target: 'enemy',
    attackBonus: 1,
    scalingStat: 'mind',
    requiredStat: 2,
    tier: 1,
    effect: { type: 'damage', die: 6, bonus: 0 },
  },
  aegis: {
    id: 'aegis',
    name: 'Aegis',
    description: 'Wrap an ally in a protective ward.',
    icon: '/assets/icons/skills/aegis.svg',
    cost: 2,
    target: 'ally',
    scalingStat: 'mind',
    requiredStat: 3,
    tier: 1,
    effect: { type: 'shield', amount: 4 },
  },
  mend: {
    id: 'mend',
    name: 'Mend',
    description: 'Restore health to one party member.',
    icon: '/assets/icons/skills/mend.svg',
    cost: 2,
    target: 'ally',
    scalingStat: 'spirit',
    requiredStat: 2,
    tier: 1,
    effect: { type: 'heal', die: 6, bonus: 1 },
  },
  'second-wind': {
    id: 'second-wind',
    name: 'Second Wind',
    description: 'Steady yourself and recover health.',
    icon: '/assets/icons/skills/second-wind.svg',
    cost: 2,
    target: 'self',
    scalingStat: 'spirit',
    requiredStat: 3,
    tier: 1,
    effect: { type: 'heal', die: 6, bonus: 1 },
  },
  'ember-lance': {
    id: 'ember-lance',
    name: 'Ember Lance',
    description: 'Drive a searing line of force through a foe.',
    icon: '/assets/icons/skills/arc-bolt.svg',
    cost: 3,
    target: 'enemy',
    attackBonus: 2,
    scalingStat: 'mind',
    requiredStat: 3,
    tier: 2,
    effect: { type: 'damage', die: 8, bonus: 1 },
  },
  'guardian-oath': {
    id: 'guardian-oath',
    name: 'Guardian Oath',
    description: 'Raise a powerful shield around an ally.',
    icon: '/assets/icons/skills/aegis.svg',
    cost: 3,
    target: 'ally',
    scalingStat: 'spirit',
    requiredStat: 3,
    tier: 2,
    effect: { type: 'shield', amount: 7 },
  },
  'venom-cut': {
    id: 'venom-cut',
    name: 'Venom Cut',
    description: 'A vicious, carefully placed strike.',
    icon: '/assets/icons/skills/twin-strike.svg',
    cost: 2,
    target: 'enemy',
    attackBonus: 2,
    scalingStat: 'finesse',
    requiredStat: 3,
    tier: 2,
    effect: { type: 'damage', die: 8, bonus: 0 },
  },
}

export const starterSkillIds = Object.values(campaignSkills)
  .filter((skill) => skill.tier === 1)
  .map((skill) => skill.id)

export const checkpointSkillChoices = [
  'ember-lance',
  'guardian-oath',
  'venom-cut',
]

export function getCampaignSkill(skillId: string) {
  return campaignSkills[skillId]
}
