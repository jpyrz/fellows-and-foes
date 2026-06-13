export type Team = 'heroes' | 'enemies'

export type CombatStatus = 'active' | 'victory' | 'defeat'

export type TargetType = 'enemy' | 'ally' | 'self'

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

export interface Skill {
  id: string
  name: string
  description: string
  cost: number
  target: TargetType
  attackBonus?: number
  effect: Effect
}

export interface Combatant {
  id: string
  name: string
  title: string
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
