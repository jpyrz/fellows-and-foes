import { type PropsWithChildren, useState } from 'react'
import type { CombatState } from '../combat/types'
import { achievementDefinitions } from './achievements'
import { classDefinitions } from './classes'
import {
  companionDefinitions,
  getCampaignDefinition,
} from './content'
import {
  awardCharacterXp,
  deriveCombatStats,
  nextRandom,
  spendStatPoint,
} from './rules'
import {
  emptyGameSave,
  localGameRepository,
  type GameRepository,
} from './repository'
import {
  GameContext,
  type CampaignPartySelection,
  type CharacterDraft,
  type CheckpointRewards,
  type GameContextValue,
} from './gameContext'
import type {
  CampaignRun,
  ExplorationRoll,
  GameSave,
  OutcomeEffect,
  PartyMemberSnapshot,
  PersistentCharacter,
  SceneActionDefinition,
  StatName,
} from './types'

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function getActiveCharacter(save: GameSave) {
  return (
    save.characters.find(
      (character) => character.id === save.activeCharacterId,
    ) ??
    save.character ??
    save.characters[0] ??
    null
  )
}

function syncActiveCharacter(
  save: GameSave,
  characters: PersistentCharacter[],
  activeCharacterId = save.activeCharacterId,
): GameSave {
  const character =
    characters.find((candidate) => candidate.id === activeCharacterId) ??
    characters[0] ??
    null
  return {
    ...save,
    character,
    characters,
    activeCharacterId: character?.id ?? null,
  }
}

function getClassRewardSkillIds(save: GameSave, classId: PersistentCharacter['classId']) {
  const classDefinition = classDefinitions[classId]
  return save.achievements.flatMap((achievement) => {
    if (!achievement.claimedAt) return []
    const rewardSkillIds =
      achievementDefinitions[achievement.id]?.reward?.skillIds ?? []
    return rewardSkillIds.filter((skillId) =>
      classDefinition.unlockableSkillIds.includes(skillId),
    )
  })
}

function withAchievementRewards(
  character: PersistentCharacter,
  save: GameSave,
) {
  const rewardSkillIds = getClassRewardSkillIds(save, character.classId)
  const unlockedSkillIds = Array.from(
    new Set([...character.unlockedSkillIds, ...rewardSkillIds]),
  )
  return { ...character, unlockedSkillIds }
}

function applyAchievementRewardsToCharacters(
  characters: PersistentCharacter[],
  achievementIds: string[],
) {
  return characters.map((character) => {
    const classDefinition = classDefinitions[character.classId]
    const rewardSkillIds = achievementIds.flatMap((achievementId) => {
      const skillIds = achievementDefinitions[achievementId]?.reward?.skillIds ?? []
      return skillIds.filter((skillId) =>
        classDefinition.unlockableSkillIds.includes(skillId),
      )
    })
    return {
      ...character,
      unlockedSkillIds: Array.from(
        new Set([...character.unlockedSkillIds, ...rewardSkillIds]),
      ),
    }
  })
}

function completeAchievements(
  save: GameSave,
  achievementIds: string[],
): GameSave {
  const unclaimedIds = achievementIds.filter(
    (achievementId) =>
      achievementDefinitions[achievementId] &&
      !save.achievements.some((achievement) => achievement.id === achievementId),
  )
  if (unclaimedIds.length === 0) return save

  const now = new Date().toISOString()
  return {
    ...save,
    achievements: [
      ...save.achievements,
      ...unclaimedIds.map((id) => ({ id, completedAt: now })),
    ],
  }
}

function claimAchievementReward(save: GameSave, achievementId: string): GameSave {
  const achievement = save.achievements.find(
    (candidate) => candidate.id === achievementId,
  )
  if (!achievement || achievement.claimedAt) return save

  const now = new Date().toISOString()
  const characters = applyAchievementRewardsToCharacters(save.characters, [
    achievementId,
  ])

  return syncActiveCharacter(
    {
      ...save,
      achievements: save.achievements.map((candidate) =>
        candidate.id === achievementId
          ? { ...candidate, claimedAt: now }
          : candidate,
      ),
    },
    characters,
  )
}

function makeCheckpoint(run: Omit<CampaignRun, 'checkpoint'>) {
  return {
    sceneId: run.sceneId,
    party: structuredClone(run.party),
    flags: [...run.flags],
    completedActionIds: [...run.completedActionIds],
    revealedActionIds: [...run.revealedActionIds],
    journal: structuredClone(run.journal),
    visitedNodeIds: [...run.visitedNodeIds],
    seed: run.seed,
  }
}

function applyItem(
  party: PartyMemberSnapshot[],
  actorId: string,
  itemId: string,
  quantity: number,
) {
  return party.map((member) => {
    if (member.id !== actorId) return member
    const existing = member.inventory.find((stack) => stack.itemId === itemId)
    return {
      ...member,
      inventory: existing
        ? member.inventory.map((stack) =>
            stack.itemId === itemId
              ? { ...stack, quantity: stack.quantity + quantity }
              : stack,
          )
        : [...member.inventory, { itemId, quantity }],
    }
  })
}

function applyEffects(
  run: CampaignRun,
  effects: OutcomeEffect[],
  actorId: string,
): CampaignRun {
  return effects.reduce((current, effect) => {
    if (effect.type === 'set-flag') {
      return current.flags.includes(effect.flag)
        ? current
        : { ...current, flags: [...current.flags, effect.flag] }
    }
    if (effect.type === 'reveal-action') {
      return current.revealedActionIds.includes(effect.actionId)
        ? current
        : {
            ...current,
            revealedActionIds: [
              ...current.revealedActionIds,
              effect.actionId,
            ],
          }
    }
    if (effect.type === 'grant-item') {
      return {
        ...current,
        party: applyItem(
          current.party,
          actorId,
          effect.itemId,
          effect.quantity,
        ),
      }
    }
    if (effect.type === 'adjust-health') {
      return {
        ...current,
        party: current.party.map((member) =>
          member.id === actorId
            ? {
                ...member,
                health: Math.max(
                  1,
                  Math.min(member.maxHealth, member.health + effect.amount),
                ),
              }
            : member,
        ),
      }
    }
    if (effect.type === 'navigate-scene') {
      const campaign = getCampaignDefinition(current.campaignId)
      return {
        ...current,
        sceneId: effect.sceneId,
        chapter: campaign?.scenes[effect.sceneId]?.chapter ?? current.chapter,
      }
    }
    if (effect.type === 'start-encounter') {
      return { ...current, currentEncounterId: effect.encounterId }
    }
    if (effect.type === 'add-journal') {
      return {
        ...current,
        journal: [
          ...current.journal,
          {
            id: makeId('page'),
            title: effect.title,
            text: effect.text,
            createdAt: new Date().toISOString(),
          },
        ],
      }
    }
    return current
  }, run)
}

export function GameProvider({
  children,
  repository = localGameRepository,
}: PropsWithChildren<{ repository?: GameRepository }>) {
  const [save, setSaveState] = useState(() => repository.load())

  function commit(next: GameSave) {
    repository.save(next)
    setSaveState(next)
  }

  function createCharacter(draft: CharacterDraft) {
    const character: PersistentCharacter = {
      ...draft,
      id: makeId('hero'),
      level: 1,
      xp: 0,
      unspentStatPoints: 0,
      createdAt: new Date().toISOString(),
    }
    const rewardedCharacter = withAchievementRewards(character, save)
    commit(
      syncActiveCharacter(
        save,
        [...save.characters, rewardedCharacter],
        save.activeCharacterId ?? rewardedCharacter.id,
      ),
    )
    return rewardedCharacter
  }

  function setActiveCharacter(characterId: string) {
    commit(syncActiveCharacter(save, save.characters, characterId))
  }

  function getCharacter(characterId: string) {
    return save.characters.find((character) => character.id === characterId)
  }

  function updateCharacterCosmetics(
    characterId: string,
    updates: Pick<PersistentCharacter, 'name' | 'portrait' | 'biography'>,
  ) {
    commit(
      syncActiveCharacter(
        save,
        save.characters.map((character) =>
          character.id === characterId
            ? { ...character, ...updates }
            : character,
        ),
      ),
    )
  }

  function allocateStat(characterId: string, stat: StatName) {
    commit(
      syncActiveCharacter(
        save,
        save.characters.map((character) =>
          character.id === characterId
            ? spendStatPoint(character, stat)
            : character,
        ),
      ),
    )
  }

  function snapshotCharacter(
    character: PersistentCharacter,
    equippedSkillIds: string[],
  ): PartyMemberSnapshot {
    const derived = deriveCombatStats(character.stats)
    return {
      id: character.id,
      characterId: character.id,
      owner: 'player',
      name: character.name,
      title: 'Roadbound Fellow',
      portrait: character.portrait,
      background: character.background,
      trait: character.trait,
      classId: character.classId,
      armorType: character.armorType,
      secondaryClassId: character.secondaryClassId,
      stats: character.stats,
      level: character.level,
      ...derived,
      health: derived.maxHealth,
      stamina: derived.maxStamina,
      equippedSkillIds,
      unlockedSkillIds: character.unlockedSkillIds,
      inventory: [{ itemId: 'healing-draught', quantity: 1 }],
    }
  }

  function createCampaign(partySelection: CampaignPartySelection[]) {
    const leaderSelection = partySelection.find(
      (selection) => selection.source === 'character',
    )
    const leader = leaderSelection
      ? getCharacter(leaderSelection.memberId)
      : getActiveCharacter(save)
    if (!leader) throw new Error('A character is required.')
    const campaign = getCampaignDefinition('the-old-road')
    if (!campaign) throw new Error('Campaign content is missing.')

    const party = partySelection.map((selection) => {
      if (selection.source === 'character') {
        const character = getCharacter(selection.memberId)
        if (!character) throw new Error('Character not found.')
        return snapshotCharacter(character, selection.equippedSkillIds)
      }

      const companion = companionDefinitions.find(
        (candidate) => candidate.id === selection.memberId,
      )
      if (!companion) throw new Error('Companion not found.')
      return {
        ...structuredClone(companion),
        equippedSkillIds: selection.equippedSkillIds,
      }
    })
    const now = new Date().toISOString()
    const withoutCheckpoint: Omit<CampaignRun, 'checkpoint'> = {
      id: makeId('run'),
      campaignId: campaign.id,
      characterId: leader.id,
      status: 'active',
      sceneId: campaign.openingSceneId,
      chapter: campaign.subtitle,
      party,
      flags: [],
      completedActionIds: [],
      revealedActionIds: [],
      journal: [],
      visitedNodeIds: [],
      seed: Date.now() >>> 0,
      claimedRewardIds: [],
      startedAt: now,
      updatedAt: now,
    }
    const run: CampaignRun = {
      ...withoutCheckpoint,
      checkpoint: makeCheckpoint(withoutCheckpoint),
    }
    commit({ ...save, activeRuns: [...save.activeRuns, run] })
    return run
  }

  function getRun(runId: string) {
    return [...save.activeRuns, ...save.completedRuns].find(
      (run) => run.id === runId,
    )
  }

  function resolveSceneAction(
    runId: string,
    action: SceneActionDefinition,
    actorId: string,
  ) {
    const run = save.activeRuns.find((candidate) => candidate.id === runId)
    const actor = run?.party.find((member) => member.id === actorId)
    if (!run || !actor) return null

    let roll: ExplorationRoll | null = null
    let success = true
    let seed = run.seed
    if (action.check) {
      const random = nextRandom(seed)
      seed = random.seed
      const backgroundMatch = action.check.matchingBackgrounds?.includes(
        actor.background,
      )
      const traitMatch = action.check.matchingTraits?.includes(actor.trait)
      const identityBonus = backgroundMatch || traitMatch ? 2 : 0
      const statBonus = actor.stats[action.check.stat]
      const total = random.value + statBonus + identityBonus
      success = total >= action.check.dc
      roll = {
        actionId: action.id,
        actorId,
        die: random.value,
        statBonus,
        identityBonus,
        situationalBonus: 0,
        total,
        dc: action.check.dc,
        success,
      }
    }

    let updated = { ...run, seed }
    const effects = success
      ? action.successEffects
      : (action.failureEffects ?? [])
    updated = applyEffects(updated, effects, actorId)
    const shouldComplete =
      success ||
      action.retryPolicy === 'closed' ||
      action.retryPolicy === 'changed' ||
      !action.check
    if (
      shouldComplete &&
      !action.repeatable &&
      !updated.completedActionIds.includes(action.id)
    ) {
      updated.completedActionIds = [...updated.completedActionIds, action.id]
    }
    updated.updatedAt = new Date().toISOString()

    commit({
      ...save,
      activeRuns: save.activeRuns.map((candidate) =>
        candidate.id === runId ? updated : candidate,
      ),
    })
    return roll
  }

  function travelTo(runId: string, sceneId: string) {
    const campaign = getCampaignDefinition('the-old-road')
    commit({
      ...save,
      activeRuns: save.activeRuns.map((run) =>
        run.id === runId
          ? {
              ...run,
              sceneId,
              chapter: campaign?.scenes[sceneId]?.chapter ?? run.chapter,
              visitedNodeIds: run.visitedNodeIds.includes(sceneId)
                ? run.visitedNodeIds
                : [...run.visitedNodeIds, sceneId],
              updatedAt: new Date().toISOString(),
            }
          : run,
      ),
    })
  }

  function resolveBattle(runId: string, combat: CombatState) {
    const run = save.activeRuns.find((candidate) => candidate.id === runId)
    if (!run) return 'defeat'

    if (combat.status === 'defeat') {
      const restored: CampaignRun = {
        ...run,
        ...structuredClone(run.checkpoint),
        claimedRewardIds: run.claimedRewardIds,
        currentEncounterId: undefined,
        updatedAt: new Date().toISOString(),
      }
      commit({
        ...save,
        activeRuns: save.activeRuns.map((candidate) =>
          candidate.id === runId ? restored : candidate,
        ),
      })
      return 'defeat'
    }

    const party = run.party.map((member) => {
      const combatant = combat.combatants.find(
        (candidate) => candidate.id === member.id,
      )
      return combatant
        ? {
            ...member,
            health: Math.max(1, combatant.health),
            stamina: combatant.stamina,
            inventory: combatant.inventory,
          }
        : member
    })
    const rewardId = 'boss-smoke-in-the-mire'
    const rewardAvailable = !run.claimedRewardIds.includes(rewardId)
    const playerIds = run.party
      .filter((member) => member.owner === 'player' && member.characterId)
      .map((member) => member.characterId!)
    const characters =
      rewardAvailable
        ? save.characters.map((character) =>
            playerIds.includes(character.id)
              ? awardCharacterXp(character, 60)
              : character,
          )
        : save.characters
    const updated: CampaignRun = {
      ...run,
      party,
      sceneId: 'after-battle',
      currentEncounterId: undefined,
      claimedRewardIds: rewardAvailable
        ? [...run.claimedRewardIds, rewardId]
        : run.claimedRewardIds,
      updatedAt: new Date().toISOString(),
    }
    const baseSave = syncActiveCharacter(save, characters)
    const achievementSave =
      combat.status === 'victory' && run.flags.includes('ashfang-weakness')
        ? completeAchievements(baseSave, ['smoke-hunter'])
        : baseSave
    commit({
      ...achievementSave,
      activeRuns: achievementSave.activeRuns.map((candidate) =>
        candidate.id === runId ? updated : candidate,
      ),
    })
    return 'victory'
  }

  function completeCheckpoint(runId: string, rewards: CheckpointRewards) {
    const run = save.activeRuns.find((candidate) => candidate.id === runId)
    if (!run) return

    let party = run.party.map((member) => {
      const rewardSkill = rewards.skillsByMemberId[member.id]
      const unlockedSkillIds =
        rewardSkill && !member.unlockedSkillIds.includes(rewardSkill)
          ? [...member.unlockedSkillIds, rewardSkill]
          : member.unlockedSkillIds
      const equippedSkillIds =
        rewardSkill && member.equippedSkillIds.length < 5
          ? [...member.equippedSkillIds, rewardSkill]
          : member.equippedSkillIds
      return {
        ...member,
        health: member.maxHealth,
        stamina: member.maxStamina,
        unlockedSkillIds,
        equippedSkillIds,
      }
    })
    party = applyItem(
      party,
      rewards.itemRecipientId,
      rewards.itemId,
      1,
    )
    const checkpointRewardId = 'checkpoint-wayfarer-shrine'
    const rewardAvailable = !run.claimedRewardIds.includes(checkpointRewardId)
    const playerIds = run.party
      .filter((member) => member.owner === 'player' && member.characterId)
      .map((member) => member.characterId!)
    let characters =
      rewardAvailable
        ? save.characters.map((character) =>
            playerIds.includes(character.id)
              ? awardCharacterXp(character, 40)
              : character,
          )
        : save.characters
    for (const characterId of playerIds) {
      const heroSkill = rewards.skillsByMemberId[characterId]
      if (!heroSkill) continue
      characters = characters.map((character) =>
        character.id === characterId &&
        !character.unlockedSkillIds.includes(heroSkill)
          ? {
              ...character,
              unlockedSkillIds: [...character.unlockedSkillIds, heroSkill],
            }
          : character,
      )
    }

    const withoutCheckpoint: Omit<CampaignRun, 'checkpoint'> = {
      ...run,
      party,
      sceneId: 'epilogue',
      claimedRewardIds: rewardAvailable
        ? [...run.claimedRewardIds, checkpointRewardId]
        : run.claimedRewardIds,
      updatedAt: new Date().toISOString(),
    }
    const updated: CampaignRun = {
      ...withoutCheckpoint,
      checkpoint: makeCheckpoint(withoutCheckpoint),
    }
    const achievementSave = completeAchievements(
      syncActiveCharacter(save, characters),
      ['wayfarer-shrine'],
    )
    commit({
      ...achievementSave,
      activeRuns: achievementSave.activeRuns.map((candidate) =>
        candidate.id === runId ? updated : candidate,
      ),
    })
  }

  function completeCampaign(runId: string) {
    const run = save.activeRuns.find((candidate) => candidate.id === runId)
    if (!run) return
    const completed = {
      ...run,
      status: 'completed' as const,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const achievementIds = [
      'old-road-complete',
      ...(run.flags.includes('cache-found') ? ['cache-finder'] : []),
      ...(run.flags.includes('bloodied-escape') ? ['bloodied-road'] : []),
    ]
    const achievementSave = completeAchievements(save, achievementIds)
    commit({
      ...achievementSave,
      activeRuns: achievementSave.activeRuns.filter(
        (candidate) => candidate.id !== runId,
      ),
      completedRuns: [...achievementSave.completedRuns, completed],
    })
  }

  function abandonCampaign(runId: string) {
    commit({
      ...save,
      activeRuns: save.activeRuns.filter(
        (candidate) => candidate.id !== runId,
      ),
    })
  }

  function claimAchievement(achievementId: string) {
    commit(claimAchievementReward(save, achievementId))
  }

  function resetAll() {
    repository.clear()
    setSaveState(emptyGameSave)
  }

  const value: GameContextValue = {
    save,
    createCharacter,
    setActiveCharacter,
    getCharacter,
    updateCharacterCosmetics,
    allocateStat,
    createCampaign,
    getRun,
    abandonCampaign,
    claimAchievement,
    resolveSceneAction,
    travelTo,
    resolveBattle,
    completeCheckpoint,
    completeCampaign,
    resetAll,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}
