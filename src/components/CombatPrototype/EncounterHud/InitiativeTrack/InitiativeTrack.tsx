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
    <div className={styles.initiative} aria-label="Turn order">
      {turnOrder.map((combatantId, index) => {
        const combatant = combatants.find(
          (candidate) => candidate.id === combatantId,
        )

        if (!combatant) {
          return null
        }

        const isActive = activeCombatantId === combatant.id

        return (
          <div
            key={combatant.id}
            className={styles.initiativeUnit}
            data-active={isActive || undefined}
            data-downed={combatant.health === 0 || undefined}
            data-team={combatant.team}
            title={`${combatant.name}${isActive ? ' is ready for battle' : ''}`}
          >
            {isActive && (
              <span
                className={styles.crossedSwords}
                data-cy="active-initiative-marker"
                aria-hidden
              />
            )}
            <span className={styles.token}>{combatant.name.slice(0, 1)}</span>
            {index < turnOrder.length - 1 && <i />}
          </div>
        )
      })}
    </div>
  )
}
