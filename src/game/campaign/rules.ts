import type {
  CharacterStats,
  PersistentCharacter,
  StatName,
} from './types'

export const statLabels: Record<StatName, string> = {
  might: 'Might',
  finesse: 'Finesse',
  mind: 'Mind',
  spirit: 'Spirit',
}

export const levelThresholds = [0, 100, 250, 450, 700]

export function getLevelForXp(xp: number) {
  return Math.min(
    5,
    levelThresholds.filter((threshold) => xp >= threshold).length,
  )
}

export function deriveCombatStats(stats: CharacterStats) {
  return {
    maxHealth: 10 + stats.might * 4,
    maxStamina: 3 + stats.spirit,
    defense: 10 + stats.finesse,
  }
}

export function calculateSuccessChance(
  bonus: number,
  dc: number,
): number {
  const minimumRoll = Math.max(1, dc - bonus)
  const successfulFaces = Math.max(0, 21 - minimumRoll)
  return Math.min(100, Math.round((successfulFaces / 20) * 100))
}

export function awardCharacterXp(
  character: PersistentCharacter,
  amount: number,
): PersistentCharacter {
  const xp = character.xp + amount
  const level = getLevelForXp(xp)
  const levelsGained = Math.max(0, level - character.level)

  return {
    ...character,
    xp,
    level,
    unspentStatPoints: character.unspentStatPoints + levelsGained,
  }
}

export function spendStatPoint(
  character: PersistentCharacter,
  stat: StatName,
): PersistentCharacter {
  if (character.unspentStatPoints <= 0 || character.stats[stat] >= 5) {
    return character
  }

  return {
    ...character,
    unspentStatPoints: character.unspentStatPoints - 1,
    stats: {
      ...character.stats,
      [stat]: character.stats[stat] + 1,
    },
  }
}

export function nextRandom(seed: number) {
  const nextSeed = (seed * 1_664_525 + 1_013_904_223) >>> 0
  return {
    seed: nextSeed,
    value: (nextSeed % 20) + 1,
  }
}
