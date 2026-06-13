import type { Combatant } from '../../../../game/combat/types'
import styles from './InitiativeTrack.module.scss'

interface InitiativeTrackProps {
  activeCombatantId?: string
  combatants: Combatant[]
  turnOrder: string[]
}

export function InitiativeTrack({
  activeCombatantId,
  combatants,
  turnOrder,
}: InitiativeTrackProps) {
  return (
    <div className={styles.initiative}>
      {turnOrder.map((combatantId, index) => {
        const combatant = combatants.find(
          (candidate) => candidate.id === combatantId,
        )

        if (!combatant) {
          return null
        }

        return (
          <div
            key={combatant.id}
            className={styles.initiativeUnit}
            data-active={activeCombatantId === combatant.id || undefined}
            data-downed={combatant.health === 0 || undefined}
          >
            <span>{combatant.name.slice(0, 1)}</span>
            {index < turnOrder.length - 1 && <i />}
          </div>
        )
      })}
    </div>
  )
}
