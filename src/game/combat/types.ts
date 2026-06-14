export type Team = 'heroes' | 'enemies'

export type CombatStatus = 'active' | 'victory' | 'defeat'

export type TargetType = 'enemy' | 'ally' | 'self'

export type ItemCategory = 'battle' | 'field' | 'key'

export type Effect =
  | {
      type: 'damage'
      die: number
      bonus: number
      hits?: number
      stagger?: boolean
    }
  | {
      type: 'heal'
      die: number
      bonus: number
    }
  | {
      type: 'shield'
      amount: number
    }

export type ItemEffect =
  | {
      type: 'damage'
      amount: number
    }
  | {
      type: 'heal'
      amount: number
    }
  | {
      type: 'shield'
      amount: number
    }
  | {
      type: 'stamina'
      amount: number
    }

export type ActionEffectType = Effect['type'] | ItemEffect['type']

export interface Skill {
  id: string
  name: string
  description: string
  icon: string
  cost: number
  target: TargetType
  attackBonus?: number
  effect: Effect
}

export interface ItemDefinition {
  id: string
  name: string
  description: string
  icon: string
  category: ItemCategory
  target: TargetType
  effect: ItemEffect
  maxStack: number
}

export interface InventoryStack {
  itemId: string
  quantity: number
}

export interface Combatant {
  id: string
  name: string
  title: string
  portrait: string
  team: Team
  color: string
  maxHealth: number
  health: number
  maxStamina: number
  stamina: number
  defense: number
  initiative: number
  shield: number
  staggered: boolean
  skills: Skill[]
  inventory: InventoryStack[]
  behavior?: string
}

export interface LogEntry {
  id: number
  round: number
  tone: 'neutral' | 'hero' | 'enemy' | 'success' | 'danger'
  message: string
}

export interface DiceRoll {
  kind: 'attack' | 'damage' | 'healing'
  label: string
  sides: number
  result: number
  bonus: number
  total: number
  target?: number
  success?: boolean
}

export interface HeroActionResolution {
  state: CombatState
  rolls: DiceRoll[]
  message: string
}

export interface HeroItemResolution {
  state: CombatState
  item: ItemDefinition
  message: string
}

export interface EnemyActionResolution extends HeroActionResolution {
  actorId: string
  skill: Skill
  targetId: string
}

export interface CombatState {
  combatants: Combatant[]
  turnOrder: string[]
  activeIndex: number
  round: number
  status: CombatStatus
  log: LogEntry[]
  nextLogId: number
  seed: number
}
