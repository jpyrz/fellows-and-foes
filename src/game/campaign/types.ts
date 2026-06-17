import type { InventoryStack } from '../combat/types'

export type StatName = 'might' | 'finesse' | 'mind' | 'spirit'
export type Background = 'soldier' | 'scholar' | 'wayfarer' | 'scoundrel'
export type PersonalityTrait =
  | 'bold'
  | 'cautious'
  | 'compassionate'
  | 'curious'

export interface CharacterStats {
  might: number
  finesse: number
  mind: number
  spirit: number
}

export interface PersistentCharacter {
  id: string
  name: string
  portrait: string
  biography: string
  background: Background
  trait: PersonalityTrait
  stats: CharacterStats
  level: number
  xp: number
  unspentStatPoints: number
  unlockedSkillIds: string[]
  createdAt: string
}

export type PartyOwner = 'player' | 'companion'

export interface PartyMemberSnapshot {
  id: string
  characterId?: string
  owner: PartyOwner
  name: string
  title: string
  portrait: string
  background: Background
  trait: PersonalityTrait
  stats: CharacterStats
  level: number
  maxHealth: number
  health: number
  maxStamina: number
  stamina: number
  defense: number
  equippedSkillIds: string[]
  unlockedSkillIds: string[]
  inventory: InventoryStack[]
}

export type RetryPolicy =
  | 'closed'
  | 'changed'
  | 'another-hero'
  | 'after-advantage'

export type ActionApproach =
  | 'safe'
  | 'risky'
  | 'clever'
  | 'force'
  | 'social'
  | 'magic'
  | 'sneaky'
  | 'desperate'
  | 'combat'

export type OutcomeMomentTone =
  | 'discovery'
  | 'reward'
  | 'setback'
  | 'danger'
  | 'route'
  | 'battle'

export interface OutcomeMoment {
  title: string
  text?: string
  tone: OutcomeMomentTone
}

export interface CheckDefinition {
  stat: StatName
  dc: 8 | 11 | 14 | 17
  stakes: string
  matchingBackgrounds?: Background[]
  matchingTraits?: PersonalityTrait[]
}

export type OutcomeEffect =
  | { type: 'set-flag'; flag: string }
  | { type: 'reveal-action'; actionId: string }
  | { type: 'grant-item'; itemId: string; quantity: number }
  | { type: 'adjust-health'; amount: number }
  | { type: 'navigate-scene'; sceneId: string }
  | { type: 'open-map' }
  | { type: 'start-encounter'; encounterId: string }
  | { type: 'add-journal'; title: string; text: string }

export interface SceneActionDefinition {
  id: string
  label: string
  description: string
  category: 'inspect' | 'talk' | 'force' | 'magic' | 'travel' | 'combat'
  approach?: ActionApproach
  check?: CheckDefinition
  requiredFlags?: string[]
  hiddenUntilRevealed?: boolean
  repeatable?: boolean
  retryPolicy?: RetryPolicy
  successMoment?: OutcomeMoment
  failureMoment?: OutcomeMoment
  successText: string
  failureText?: string
  successEffects: OutcomeEffect[]
  failureEffects?: OutcomeEffect[]
}

export interface SceneDefinition {
  id: string
  chapter: string
  title: string
  location: string
  artworkTone: string
  text: string
  actions: SceneActionDefinition[]
}

export interface MapNodeDefinition {
  id: string
  label: string
  sceneId?: string
  encounterId?: string
  optional?: boolean
  requiredFlags?: string[]
}

export interface CampaignDefinition {
  id: string
  title: string
  subtitle: string
  description: string
  recommendedLevel: string
  openingSceneId: string
  scenes: Record<string, SceneDefinition>
  mapNodes: MapNodeDefinition[]
}

export interface JournalPage {
  id: string
  title: string
  text: string
  createdAt: string
}

export interface CheckpointState {
  sceneId: string
  party: PartyMemberSnapshot[]
  flags: string[]
  completedActionIds: string[]
  revealedActionIds: string[]
  journal: JournalPage[]
  visitedNodeIds: string[]
  seed: number
}

export type CampaignStatus = 'active' | 'completed'

export interface CampaignRun {
  id: string
  campaignId: string
  characterId: string
  status: CampaignStatus
  sceneId: string
  chapter: string
  party: PartyMemberSnapshot[]
  flags: string[]
  completedActionIds: string[]
  revealedActionIds: string[]
  journal: JournalPage[]
  visitedNodeIds: string[]
  seed: number
  claimedRewardIds: string[]
  currentEncounterId?: string
  checkpoint: CheckpointState
  startedAt: string
  updatedAt: string
  completedAt?: string
}

export interface GameSave {
  version: 1
  character: PersistentCharacter | null
  characters: PersistentCharacter[]
  activeCharacterId: string | null
  activeRuns: CampaignRun[]
  completedRuns: CampaignRun[]
}

export interface ExplorationRoll {
  actionId: string
  actorId: string
  die: number
  statBonus: number
  identityBonus: number
  situationalBonus: number
  total: number
  dc: number
  success: boolean
}
