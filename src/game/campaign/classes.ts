import type { ArmorType, CharacterClassId, StatName } from './types'

export interface CharacterClassDefinition {
  id: CharacterClassId
  name: string
  armorType: ArmorType
  description: string
  primaryStats: StatName[]
  role: string
  starterSkillIds: string[]
  unlockableSkillIds: string[]
}

export const classDefinitions: Record<
  CharacterClassId,
  CharacterClassDefinition
> = {
  vanguard: {
    id: 'vanguard',
    name: 'Vanguard',
    armorType: 'heavy',
    description:
      'A front-line defender who wins space with steel, shields, and stubborn courage.',
    primaryStats: ['might', 'spirit'],
    role: 'Frontline protector',
    starterSkillIds: ['iron-strike', 'shield-bash', 'quick-shot', 'second-wind'],
    unlockableSkillIds: ['cleaving-blow', 'guardian-oath'],
  },
  wayfinder: {
    id: 'wayfinder',
    name: 'Wayfinder',
    armorType: 'medium',
    description:
      'A mobile scout who turns positioning, precision, and dirty routes into advantage.',
    primaryStats: ['finesse', 'mind'],
    role: 'Ranged striker and scout',
    starterSkillIds: [
      'quick-shot',
      'piercing-shot',
      'twin-strike',
      'steady-hand',
    ],
    unlockableSkillIds: ['venom-cut', 'mist-step'],
  },
  arcanist: {
    id: 'arcanist',
    name: 'Arcanist',
    armorType: 'robe',
    description:
      'A rune-worker who studies old powers and turns battlefield rules sideways.',
    primaryStats: ['mind', 'finesse'],
    role: 'Arcane damage and control',
    starterSkillIds: ['arc-bolt', 'cinder-spark', 'aegis', 'quick-shot'],
    unlockableSkillIds: ['ember-lance', 'storm-sigil', 'mist-step'],
  },
  mender: {
    id: 'mender',
    name: 'Mender',
    armorType: 'light',
    description:
      'A support caster who keeps a company standing when the road gets ugly.',
    primaryStats: ['spirit', 'mind'],
    role: 'Healing and protection',
    starterSkillIds: ['mend', 'steady-hand', 'aegis', 'arc-bolt'],
    unlockableSkillIds: ['radiant-mend', 'guardian-oath', 'storm-sigil'],
  },
}

export const characterClassIds = Object.keys(
  classDefinitions,
) as CharacterClassId[]

export function getClassDefinition(classId: CharacterClassId) {
  return classDefinitions[classId]
}
