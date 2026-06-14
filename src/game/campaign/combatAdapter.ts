import { createCombatants } from '../combat/content'
import type { CombatState, Combatant, Effect, Skill } from '../combat/types'
import { getCampaignSkill } from './skills'
import type {
  CampaignRun,
  CharacterStats,
  PartyMemberSnapshot,
} from './types'

function scaleEffect(effect: Effect, statValue: number): Effect {
  if (effect.type === 'damage' || effect.type === 'heal') {
    return { ...effect, bonus: effect.bonus + statValue }
  }

  return { ...effect, amount: effect.amount + statValue }
}

function buildSkill(skillId: string, stats: CharacterStats): Skill {
  const skill = getCampaignSkill(skillId)
  if (!skill) {
    throw new Error(`Unknown campaign skill: ${skillId}`)
  }

  const statValue = stats[skill.scalingStat]
  return {
    ...skill,
    attackBonus:
      skill.effect.type === 'damage'
        ? (skill.attackBonus ?? 0) + statValue
        : undefined,
    effect: scaleEffect(skill.effect, statValue),
  }
}

function partyMemberToCombatant(
  member: PartyMemberSnapshot,
  initiative: number,
): Combatant {
  return {
    id: member.id,
    name: member.name,
    title: member.title,
    portrait: member.portrait,
    team: 'heroes',
    color:
      member.owner === 'player'
        ? 'lime'
        : member.id === 'elowen'
          ? 'violet'
          : member.id === 'nyra'
            ? 'cyan'
            : 'lime',
    maxHealth: member.maxHealth,
    health: member.health,
    maxStamina: member.maxStamina,
    stamina: member.maxStamina,
    defense: member.defense,
    initiative,
    shield: 0,
    staggered: false,
    skills: member.equippedSkillIds
      .map((skillId) => buildSkill(skillId, member.stats))
      .filter(Boolean),
    inventory: member.inventory,
  }
}

function rollInitiative(seed: number, finesse: number) {
  const nextSeed = (seed * 1_664_525 + 1_013_904_223) >>> 0
  return {
    initiative: (nextSeed % 20) + 1 + finesse,
    seed: nextSeed,
  }
}

export function createCampaignCombatState(run: CampaignRun): CombatState {
  let seed = run.seed
  const heroes = run.party.map((member) => {
    const rolled = rollInitiative(seed, member.stats.finesse)
    seed = rolled.seed
    return partyMemberToCombatant(member, rolled.initiative)
  })
  const enemyTemplates = createCombatants().filter(
    (combatant) => combatant.team === 'enemies',
  )
  const enemies = enemyTemplates.map((enemy) => {
    const rolled = rollInitiative(seed, Math.max(0, enemy.initiative - 10))
    seed = rolled.seed
    return {
      ...enemy,
      defense: run.flags.includes('ashfang-weakness')
        ? enemy.defense - 2
        : enemy.defense,
      initiative: rolled.initiative,
    }
  })
  const combatants = [...heroes, ...enemies]

  return {
    combatants,
    turnOrder: combatants
      .toSorted((left, right) => right.initiative - left.initiative)
      .map((combatant) => combatant.id),
    activeIndex: 0,
    round: 1,
    status: 'active',
    nextLogId: 2,
    seed,
    log: [
      {
        id: 1,
        round: 1,
        tone: 'neutral',
        message: run.flags.includes('ashfang-weakness')
          ? 'The party thickens the smoke. The ashfangs emerge disoriented as the mireling advances.'
          : 'Ashfangs emerge from the smoke while something heavy moves in the mire.',
      },
    ],
  }
}
