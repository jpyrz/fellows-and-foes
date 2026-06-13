import type { Skill } from '../../../../game/combat/types'

export function formatSkillEffect(skill: Skill) {
  if (skill.effect.type === 'shield') {
    return `${skill.effect.amount} shield`
  }

  const hits = skill.effect.type === 'damage' ? (skill.effect.hits ?? 1) : 1
  const bonus = skill.effect.bonus > 0 ? ` + ${skill.effect.bonus}` : ''
  const die = `d${skill.effect.die}${bonus}`

  return skill.effect.type === 'heal'
    ? `Heal ${die}`
    : hits > 1
      ? `${hits} attacks · ${die} each`
      : `${die} damage`
}

export function formatSkillAccuracy(skill: Skill) {
  return skill.effect.type === 'damage'
    ? `d20 + ${skill.attackBonus ?? 0}`
    : 'Automatic'
}
