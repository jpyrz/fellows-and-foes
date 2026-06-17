import { createContext, useContext } from 'react'
import type { CombatState } from '../combat/types'
import type {
  CampaignRun,
  ExplorationRoll,
  GameSave,
  PersistentCharacter,
  SceneActionDefinition,
  StatName,
} from './types'

export type CharacterDraft = Omit<
  PersistentCharacter,
  'id' | 'level' | 'xp' | 'unspentStatPoints' | 'createdAt'
>

export interface CheckpointRewards {
  skillsByMemberId: Record<string, string>
  itemId: string
  itemRecipientId: string
}

export interface CampaignPartySelection {
  memberId: string
  source: 'character' | 'companion'
  equippedSkillIds: string[]
}

export interface GameContextValue {
  save: GameSave
  createCharacter(draft: CharacterDraft): PersistentCharacter
  setActiveCharacter(characterId: string): void
  getCharacter(characterId: string): PersistentCharacter | undefined
  updateCharacterCosmetics(
    characterId: string,
    updates: Pick<PersistentCharacter, 'name' | 'portrait' | 'biography'>,
  ): void
  allocateStat(characterId: string, stat: StatName): void
  createCampaign(party: CampaignPartySelection[]): CampaignRun
  getRun(runId: string): CampaignRun | undefined
  abandonCampaign(runId: string): void
  claimAchievement(achievementId: string): void
  resolveSceneAction(
    runId: string,
    action: SceneActionDefinition,
    actorId: string,
  ): ExplorationRoll | null
  travelTo(runId: string, sceneId: string): void
  resolveBattle(runId: string, combat: CombatState): 'victory' | 'defeat'
  completeCheckpoint(runId: string, rewards: CheckpointRewards): void
  completeCampaign(runId: string): void
  resetAll(): void
}

export const GameContext = createContext<GameContextValue | null>(null)

export function useGame() {
  const context = useContext(GameContext)
  if (!context) throw new Error('useGame must be used within GameProvider')
  return context
}
