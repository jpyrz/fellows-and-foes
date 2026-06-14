import { createCombatants } from './content'
import { getItemDefinition } from './items'
import type {
  CombatState,
  CombatStatus,
  Combatant,
  DiceRoll,
  EnemyActionResolution,
  Effect,
  HeroActionResolution,
  HeroItemResolution,
  ItemDefinition,
  LogEntry,
  Skill,
} from './types'

const UINT_32_RANGE = 4_294_967_296

function nextSeed(seed: number) {
  return (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0
}

function rollDie(seed: number, sides: number) {
  const updatedSeed = nextSeed(seed)
  const result = Math.floor((updatedSeed / UINT_32_RANGE) * sides) + 1
  return { result, seed: updatedSeed }
}

function addLog(
  state: CombatState,
  message: string,
  tone: LogEntry['tone'] = 'neutral',
): CombatState {
  return {
    ...state,
    nextLogId: state.nextLogId + 1,
    log: [
      ...state.log,
      {
        id: state.nextLogId,
        round: state.round,
        tone,
        message,
      },
    ],
  }
}

function updateCombatant(
  state: CombatState,
  combatantId: string,
  updater: (combatant: Combatant) => Combatant,
): CombatState {
  return {
    ...state,
    combatants: state.combatants.map((combatant) =>
      combatant.id === combatantId ? updater(combatant) : combatant,
    ),
  }
}

function getCombatant(state: CombatState, combatantId: string) {
  return state.combatants.find((combatant) => combatant.id === combatantId)
}

function livingCombatants(state: CombatState, team: Combatant['team']) {
  return state.combatants.filter(
    (combatant) => combatant.team === team && combatant.health > 0,
  )
}

function resolveStatus(state: CombatState): CombatState {
  const heroesAlive = livingCombatants(state, 'heroes').length > 0
  const enemiesAlive = livingCombatants(state, 'enemies').length > 0
  let status: CombatStatus = 'active'

  if (!enemiesAlive) {
    status = 'victory'
  } else if (!heroesAlive) {
    status = 'defeat'
  }

  if (status === state.status) {
    return state
  }

  const resolved = { ...state, status }
  return addLog(
    resolved,
    status === 'victory'
      ? 'The path is clear. The party is victorious.'
      : 'The party has fallen. The expedition ends here.',
    status === 'victory' ? 'success' : 'danger',
  )
}

function applyDamage(
  state: CombatState,
  target: Combatant,
  damage: number,
): CombatState {
  const absorbed = Math.min(target.shield, damage)
  const healthDamage = damage - absorbed
  const updatedHealth = Math.max(0, target.health - healthDamage)
  let updated = updateCombatant(state, target.id, (combatant) => ({
    ...combatant,
    health: updatedHealth,
    shield: combatant.shield - absorbed,
  }))

  if (absorbed > 0) {
    updated = addLog(
      updated,
      `${target.name}'s shield absorbs ${absorbed} damage.`,
      'hero',
    )
  }

  if (updatedHealth === 0) {
    updated = addLog(
      updated,
      `${target.name} is ${target.team === 'heroes' ? 'downed' : 'defeated'}.`,
      target.team === 'heroes' ? 'danger' : 'success',
    )
  }

  return resolveStatus(updated)
}

function resolveDamageEffect(
  state: CombatState,
  actor: Combatant,
  target: Combatant,
  skill: Skill,
  effect: Extract<Effect, { type: 'damage' }>,
  rolls?: DiceRoll[],
): CombatState {
  const hits = effect.hits ?? 1
  let updated = state
  let totalDamage = 0
  let successfulHits = 0

  for (let hit = 0; hit < hits; hit += 1) {
    const attackRoll = rollDie(updated.seed, 20)
    updated = { ...updated, seed: attackRoll.seed }
    const attackTotal = attackRoll.result + (skill.attackBonus ?? 0)
    const attackSucceeded = attackTotal >= target.defense

    rolls?.push({
      kind: 'attack',
      label: hits > 1 ? `Attack ${hit + 1}` : 'Attack',
      sides: 20,
      result: attackRoll.result,
      bonus: skill.attackBonus ?? 0,
      total: attackTotal,
      target: target.defense,
      success: attackSucceeded,
    })

    if (!attackSucceeded) {
      updated = addLog(
        updated,
        `${actor.name}'s ${skill.name} misses ${target.name} (${attackTotal} vs ${target.defense}).`,
        actor.team === 'heroes' ? 'hero' : 'enemy',
      )
      continue
    }

    const damageRoll = rollDie(updated.seed, effect.die)
    updated = { ...updated, seed: damageRoll.seed }
    const damageTotal = damageRoll.result + effect.bonus
    totalDamage += damageTotal
    successfulHits += 1
    rolls?.push({
      kind: 'damage',
      label: hits > 1 ? `Damage ${hit + 1}` : 'Damage',
      sides: effect.die,
      result: damageRoll.result,
      bonus: effect.bonus,
      total: damageTotal,
    })
  }

  if (successfulHits > 0) {
    updated = addLog(
      updated,
      `${actor.name} uses ${skill.name} on ${target.name} for ${totalDamage} damage.`,
      actor.team === 'heroes' ? 'hero' : 'enemy',
    )
    updated = applyDamage(updated, getCombatant(updated, target.id)!, totalDamage)

    const livingTarget = getCombatant(updated, target.id)
    if (
      effect.stagger &&
      livingTarget &&
      livingTarget.health > 0 &&
      !livingTarget.staggered
    ) {
      updated = updateCombatant(updated, target.id, (combatant) => ({
        ...combatant,
        staggered: true,
      }))
      updated = addLog(
        updated,
        `${target.name} is staggered and will lose their next turn.`,
        actor.team === 'heroes' ? 'hero' : 'enemy',
      )
    }
  }

  return updated
}

function resolveSkillEffect(
  state: CombatState,
  actor: Combatant,
  target: Combatant,
  skill: Skill,
  rolls?: DiceRoll[],
): CombatState {
  if (skill.effect.type === 'damage') {
    return resolveDamageEffect(
      state,
      actor,
      target,
      skill,
      skill.effect,
      rolls,
    )
  }

  if (skill.effect.type === 'heal') {
    const healingRoll = rollDie(state.seed, skill.effect.die)
    const healing = healingRoll.result + skill.effect.bonus
    rolls?.push({
      kind: 'healing',
      label: 'Healing',
      sides: skill.effect.die,
      result: healingRoll.result,
      bonus: skill.effect.bonus,
      total: healing,
    })
    const healedTo = Math.min(target.maxHealth, target.health + healing)
    let updated = updateCombatant(
      { ...state, seed: healingRoll.seed },
      target.id,
      (combatant) => ({ ...combatant, health: healedTo }),
    )
    updated = addLog(
      updated,
      `${actor.name} uses ${skill.name}. ${target.name} recovers ${healedTo - target.health} health.`,
      'hero',
    )
    return updated
  }

  const shieldAmount = skill.effect.amount
  let updated = updateCombatant(state, target.id, (combatant) => ({
    ...combatant,
    shield: Math.max(combatant.shield, shieldAmount),
  }))
  updated = addLog(
    updated,
    `${actor.name} uses ${skill.name}. ${target.name} gains ${shieldAmount} shield.`,
    'hero',
  )
  return updated
}

function isValidTarget(actor: Combatant, target: Combatant, skill: Skill) {
  if (target.health <= 0) {
    return false
  }

  if (skill.effect.type === 'heal' && target.health === target.maxHealth) {
    return false
  }

  if (skill.target === 'self') {
    return actor.id === target.id
  }

  if (skill.target === 'ally') {
    return actor.team === target.team
  }

  return actor.team !== target.team
}

function isValidItemTarget(
  actor: Combatant,
  target: Combatant,
  item: ItemDefinition,
) {
  if (target.health <= 0) {
    return false
  }

  if (item.effect.type === 'heal' && target.health === target.maxHealth) {
    return false
  }

  if (
    item.effect.type === 'stamina' &&
    target.stamina === target.maxStamina
  ) {
    return false
  }

  if (item.target === 'self') {
    return actor.id === target.id
  }

  if (item.target === 'ally') {
    return actor.team === target.team
  }

  return actor.team !== target.team
}

function chooseEnemyTarget(state: CombatState, actor: Combatant) {
  const heroes = livingCombatants(state, 'heroes')

  if (actor.id === 'ashfang') {
    return [...heroes].sort(
      (left, right) =>
        left.health - right.health || right.initiative - left.initiative,
    )[0]
  }

  return [...heroes].sort(
    (left, right) =>
      right.health - left.health || left.initiative - right.initiative,
  )[0]
}

function beginNewRound(state: CombatState): CombatState {
  let updated: CombatState = {
    ...state,
    round: state.round + 1,
    combatants: state.combatants.map((combatant) =>
      combatant.team === 'heroes' && combatant.health > 0
        ? {
            ...combatant,
            stamina: Math.min(combatant.maxStamina, combatant.stamina + 1),
          }
        : combatant,
    ),
  }
  updated = addLog(
    updated,
    `Round ${updated.round} begins. Each standing hero recovers 1 stamina.`,
  )
  return updated
}

function advanceTurn(state: CombatState): CombatState {
  if (state.status !== 'active') {
    return state
  }

  let updated = state
  let checkedCombatants = 0

  while (checkedCombatants < updated.turnOrder.length * 2) {
    const nextIndex = (updated.activeIndex + 1) % updated.turnOrder.length
    updated =
      nextIndex === 0
        ? beginNewRound({ ...updated, activeIndex: nextIndex })
        : { ...updated, activeIndex: nextIndex }

    const active = getActiveCombatant(updated)
    checkedCombatants += 1

    if (!active || active.health <= 0) {
      continue
    }

    if (active.staggered) {
      updated = updateCombatant(updated, active.id, (combatant) => ({
        ...combatant,
        staggered: false,
      }))
      updated = addLog(
        updated,
        `${active.name} is staggered and loses this turn.`,
        active.team === 'heroes' ? 'danger' : 'success',
      )
      continue
    }

    return updated
  }

  return updated
}

export function createInitialCombatState(seed = 2_026_061_1): CombatState {
  const combatants = createCombatants()
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
        message:
          'Ashfangs emerge from the smoke while something heavy moves in the mire.',
      },
    ],
  }
}

export function getActiveCombatant(state: CombatState) {
  return getCombatant(state, state.turnOrder[state.activeIndex])
}

export function getValidTargets(
  state: CombatState,
  actorId: string,
  skillId: string,
) {
  const actor = getCombatant(state, actorId)
  const skill = actor?.skills.find((candidate) => candidate.id === skillId)

  if (!actor || !skill) {
    return []
  }

  return state.combatants.filter((target) =>
    isValidTarget(actor, target, skill),
  )
}

export function getValidItemTargets(
  state: CombatState,
  actorId: string,
  itemId: string,
) {
  const actor = getCombatant(state, actorId)
  const item = getItemDefinition(itemId)
  const stack = actor?.inventory.find(
    (candidate) => candidate.itemId === itemId,
  )

  if (
    !actor ||
    actor.team !== 'heroes' ||
    !item ||
    item.category !== 'battle' ||
    !stack ||
    stack.quantity <= 0
  ) {
    return []
  }

  return state.combatants.filter((target) =>
    isValidItemTarget(actor, target, item),
  )
}

export function performHeroAction(
  state: CombatState,
  skillId: string,
  targetId: string,
): CombatState {
  const resolution = resolveHeroAction(state, skillId, targetId)

  if (resolution.state === state) {
    return state
  }

  return resolution.state.status === 'active'
    ? advanceCombatTurn(resolution.state)
    : resolution.state
}

export function resolveHeroAction(
  state: CombatState,
  skillId: string,
  targetId: string,
): HeroActionResolution {
  if (state.status !== 'active') {
    return { state, rolls: [], message: '' }
  }

  const actor = getActiveCombatant(state)
  const target = getCombatant(state, targetId)
  const skill = actor?.skills.find((candidate) => candidate.id === skillId)

  if (
    !actor ||
    actor.team !== 'heroes' ||
    !target ||
    !skill ||
    !isValidTarget(actor, target, skill) ||
    actor.stamina < skill.cost
  ) {
    return { state, rolls: [], message: '' }
  }

  const rolls: DiceRoll[] = []
  const previousLogLength = state.log.length
  let updated = updateCombatant(state, actor.id, (combatant) => ({
    ...combatant,
    stamina: combatant.stamina - skill.cost,
  }))
  const updatedActor = getCombatant(updated, actor.id)!
  const updatedTarget = getCombatant(updated, target.id)!
  updated = resolveSkillEffect(
    updated,
    updatedActor,
    updatedTarget,
    skill,
    rolls,
  )
  const actionMessage = updated.log
    .slice(previousLogLength)
    .filter(
      (entry) =>
        entry.message.includes(actor.name) &&
        entry.message.includes(skill.name),
    )
    .at(-1)?.message

  return {
    state: updated,
    rolls,
    message: actionMessage ?? `${actor.name} uses ${skill.name}.`,
  }
}

export function resolveHeroItem(
  state: CombatState,
  itemId: string,
  targetId: string,
): HeroItemResolution | null {
  if (state.status !== 'active') {
    return null
  }

  const actor = getActiveCombatant(state)
  const target = getCombatant(state, targetId)
  const item = getItemDefinition(itemId)
  const stack = actor?.inventory.find(
    (candidate) => candidate.itemId === itemId,
  )

  if (
    !actor ||
    actor.team !== 'heroes' ||
    !target ||
    !item ||
    item.category !== 'battle' ||
    !stack ||
    stack.quantity <= 0 ||
    !isValidItemTarget(actor, target, item)
  ) {
    return null
  }

  let updated = updateCombatant(state, actor.id, (combatant) => ({
    ...combatant,
    inventory: combatant.inventory.flatMap((candidate) => {
      if (candidate.itemId !== itemId) {
        return [candidate]
      }

      return candidate.quantity > 1
        ? [{ ...candidate, quantity: candidate.quantity - 1 }]
        : []
    }),
  }))

  let message: string

  if (item.effect.type === 'damage') {
    message = `${actor.name} uses ${item.name} on ${target.name} for ${item.effect.amount} damage.`
    updated = addLog(updated, message, 'hero')
    updated = applyDamage(
      updated,
      getCombatant(updated, target.id)!,
      item.effect.amount,
    )
  } else if (item.effect.type === 'heal') {
    const healedTo = Math.min(
      target.maxHealth,
      target.health + item.effect.amount,
    )
    message = `${actor.name} uses ${item.name}. ${target.name} recovers ${healedTo - target.health} health.`
    updated = updateCombatant(updated, target.id, (combatant) => ({
      ...combatant,
      health: healedTo,
    }))
    updated = addLog(updated, message, 'hero')
  } else if (item.effect.type === 'shield') {
    message = `${actor.name} uses ${item.name}. ${target.name} gains ${item.effect.amount} shield.`
    updated = updateCombatant(updated, target.id, (combatant) => ({
      ...combatant,
      shield: Math.max(combatant.shield, item.effect.amount),
    }))
    updated = addLog(updated, message, 'hero')
  } else {
    const restoredTo = Math.min(
      target.maxStamina,
      target.stamina + item.effect.amount,
    )
    message = `${actor.name} uses ${item.name}. ${target.name} recovers ${restoredTo - target.stamina} stamina.`
    updated = updateCombatant(updated, target.id, (combatant) => ({
      ...combatant,
      stamina: restoredTo,
    }))
    updated = addLog(updated, message, 'hero')
  }

  return { state: updated, item, message }
}

export function advanceCombatTurn(state: CombatState) {
  return advanceTurn(state)
}

export function passHeroTurn(state: CombatState) {
  const actor = getActiveCombatant(state)

  if (state.status !== 'active' || !actor || actor.team !== 'heroes') {
    return state
  }

  return addLog(
    state,
    `${actor.name} holds position and passes the turn.`,
    'hero',
  )
}

export function resolveEnemyAction(
  state: CombatState,
): EnemyActionResolution | null {
  if (state.status !== 'active') {
    return null
  }

  const actor = getActiveCombatant(state)
  if (!actor || actor.team !== 'enemies') {
    return null
  }

  const target = chooseEnemyTarget(state, actor)
  const skill = actor.skills[0]
  if (!target || !skill) {
    return null
  }

  const rolls: DiceRoll[] = []
  const previousLogLength = state.log.length
  const updated = resolveSkillEffect(state, actor, target, skill, rolls)
  const actionMessage = updated.log
    .slice(previousLogLength)
    .filter(
      (entry) =>
        entry.message.includes(actor.name) &&
        entry.message.includes(skill.name),
    )
    .at(-1)?.message

  return {
    actorId: actor.id,
    message: actionMessage ?? `${actor.name} uses ${skill.name}.`,
    rolls,
    skill,
    state: updated,
    targetId: target.id,
  }
}
