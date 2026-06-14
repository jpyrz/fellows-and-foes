import type { Combatant, Skill } from './types'

const ironStrike: Skill = {
  id: 'iron-strike',
  name: 'Iron Strike',
  description: 'A reliable melee attack.',
  icon: '/assets/icons/skills/iron-strike.svg',
  cost: 0,
  target: 'enemy',
  attackBonus: 5,
  effect: { type: 'damage', die: 6, bonus: 2 },
}

const shieldBash: Skill = {
  id: 'shield-bash',
  name: 'Shield Bash',
  description: 'Deal light damage and make the target lose its next turn.',
  icon: '/assets/icons/skills/shield-bash.svg',
  cost: 1,
  target: 'enemy',
  attackBonus: 4,
  effect: { type: 'damage', die: 4, bonus: 1, stagger: true },
}

const secondWind: Skill = {
  id: 'second-wind',
  name: 'Second Wind',
  description: 'Recover health without giving up the fight.',
  icon: '/assets/icons/skills/second-wind.svg',
  cost: 2,
  target: 'self',
  effect: { type: 'heal', die: 6, bonus: 3 },
}

const quickShot: Skill = {
  id: 'quick-shot',
  name: 'Quick Shot',
  description: 'A fast, accurate ranged attack.',
  icon: '/assets/icons/skills/quick-shot.svg',
  cost: 0,
  target: 'enemy',
  attackBonus: 6,
  effect: { type: 'damage', die: 6, bonus: 1 },
}

const twinStrike: Skill = {
  id: 'twin-strike',
  name: 'Twin Strike',
  description: 'Make two attacks against the same target.',
  icon: '/assets/icons/skills/twin-strike.svg',
  cost: 2,
  target: 'enemy',
  attackBonus: 5,
  effect: { type: 'damage', die: 4, bonus: 0, hits: 2 },
}

const evasiveGuard: Skill = {
  id: 'evasive-guard',
  name: 'Evasive Guard',
  description: 'Give an ally a shield that absorbs the next 5 damage.',
  icon: '/assets/icons/skills/evasive-guard.svg',
  cost: 1,
  target: 'ally',
  effect: { type: 'shield', amount: 5 },
}

const arcBolt: Skill = {
  id: 'arc-bolt',
  name: 'Arc Bolt',
  description: 'A focused bolt of unstable magic.',
  icon: '/assets/icons/skills/arc-bolt.svg',
  cost: 0,
  target: 'enemy',
  attackBonus: 5,
  effect: { type: 'damage', die: 6, bonus: 1 },
}

const mend: Skill = {
  id: 'mend',
  name: 'Mend',
  description: 'Restore health to one party member.',
  icon: '/assets/icons/skills/mend.svg',
  cost: 2,
  target: 'ally',
  effect: { type: 'heal', die: 6, bonus: 4 },
}

const aegis: Skill = {
  id: 'aegis',
  name: 'Aegis',
  description: 'Wrap an ally in a shield that absorbs 7 damage.',
  icon: '/assets/icons/skills/aegis.svg',
  cost: 2,
  target: 'ally',
  effect: { type: 'shield', amount: 7 },
}

const pounce: Skill = {
  id: 'pounce',
  name: 'Pounce',
  description: 'The Ashfang attacks the hero with the lowest health.',
  icon: '/assets/icons/combatants/ashfang.svg',
  cost: 0,
  target: 'enemy',
  attackBonus: 4,
  effect: { type: 'damage', die: 6, bonus: 1 },
}

const mireSlam: Skill = {
  id: 'mire-slam',
  name: 'Mire Slam',
  description: 'The Mireling attacks the healthiest hero.',
  icon: '/assets/icons/combatants/mireling.svg',
  cost: 0,
  target: 'enemy',
  attackBonus: 3,
  effect: { type: 'damage', die: 8, bonus: 1 },
}

export function createCombatants(): Combatant[] {
  return [
    {
      id: 'nyra',
      name: 'Nyra',
      title: 'Wayfinder',
      portrait: '/assets/icons/combatants/nyra.svg',
      team: 'heroes',
      color: 'cyan',
      maxHealth: 16,
      health: 16,
      maxStamina: 6,
      stamina: 6,
      defense: 13,
      initiative: 16,
      shield: 0,
      staggered: false,
      skills: [quickShot, twinStrike, evasiveGuard],
    },
    {
      id: 'ashfang',
      name: 'Ashfang',
      title: 'Ember Stalker',
      portrait: '/assets/icons/combatants/ashfang.svg',
      team: 'enemies',
      color: 'orange',
      maxHealth: 14,
      health: 14,
      maxStamina: 0,
      stamina: 0,
      defense: 12,
      initiative: 14,
      shield: 0,
      staggered: false,
      skills: [pounce],
      behavior: 'Pounces on the living hero with the lowest health.',
    },
    {
      id: 'elowen',
      name: 'Elowen',
      title: 'Ember Scholar',
      portrait: '/assets/icons/combatants/elowen.svg',
      team: 'heroes',
      color: 'violet',
      maxHealth: 15,
      health: 15,
      maxStamina: 7,
      stamina: 7,
      defense: 11,
      initiative: 12,
      shield: 0,
      staggered: false,
      skills: [arcBolt, mend, aegis],
    },
    {
      id: 'mireling',
      name: 'Mireling',
      title: 'Bog Brute',
      portrait: '/assets/icons/combatants/mireling.svg',
      team: 'enemies',
      color: 'teal',
      maxHealth: 19,
      health: 19,
      maxStamina: 0,
      stamina: 0,
      defense: 10,
      initiative: 9,
      shield: 0,
      staggered: false,
      skills: [mireSlam],
      behavior: 'Slams the living hero with the most health.',
    },
    {
      id: 'brann',
      name: 'Brann',
      title: 'Shieldbearer',
      portrait: '/assets/icons/combatants/brann.svg',
      team: 'heroes',
      color: 'lime',
      maxHealth: 22,
      health: 22,
      maxStamina: 5,
      stamina: 5,
      defense: 14,
      initiative: 7,
      shield: 0,
      staggered: false,
      skills: [ironStrike, shieldBash, secondWind],
    },
  ]
}
