import type { AchievementDefinition } from './types'

export const achievementDefinitions: Record<string, AchievementDefinition> = {
  'old-road-complete': {
    id: 'old-road-complete',
    name: 'First Tale Told',
    description: 'Complete The Old Road.',
    category: 'campaign',
    difficulty: 'easy',
    requirement: 'Finish First Contact and close the tale.',
    rewardText: 'Unlocks Ember Lance for Arcanists and Storm Sigil for Menders.',
    reward: {
      skillIds: ['ember-lance', 'storm-sigil'],
    },
  },
  'smoke-hunter': {
    id: 'smoke-hunter',
    name: 'Smoke Hunter',
    description: 'Defeat Smoke in the Mire after revealing the ashfang weakness.',
    category: 'combat',
    difficulty: 'medium',
    requirement:
      'Inspect the claw marks successfully, then defeat Smoke in the Mire.',
    rewardText: 'Unlocks Venom Cut for Wayfinders.',
    reward: {
      skillIds: ['venom-cut'],
    },
  },
  'cache-finder': {
    id: 'cache-finder',
    name: 'Reedway Scavenger',
    description: 'Find the Reedway Cache before facing the mire.',
    category: 'exploration',
    difficulty: 'easy',
    requirement: 'Open the optional Reedway Cache.',
    rewardText: 'Unlocks Mist Step for Wayfinders and Arcanists.',
    reward: {
      skillIds: ['mist-step'],
    },
  },
  'bloodied-road': {
    id: 'bloodied-road',
    name: 'No Clean Way Out',
    description: 'Escape the Flooded Gaol through pain instead of precision.',
    category: 'challenge',
    difficulty: 'medium',
    requirement: 'Use a damaging escape route and still complete the tale.',
    rewardText: 'Unlocks Cleaving Blow for Vanguards.',
    reward: {
      skillIds: ['cleaving-blow'],
    },
  },
  'wayfarer-shrine': {
    id: 'wayfarer-shrine',
    name: 'Shrine-Kindled',
    description: 'Reach the Wayfarer Shrine and accept its camp reward.',
    category: 'campaign',
    difficulty: 'easy',
    requirement: 'Claim the Wayfarer Shrine checkpoint.',
    rewardText: 'Unlocks Guardian Oath and Radiant Mend.',
    reward: {
      skillIds: ['guardian-oath', 'radiant-mend'],
    },
  },
}

export const achievementIds = Object.keys(achievementDefinitions)
