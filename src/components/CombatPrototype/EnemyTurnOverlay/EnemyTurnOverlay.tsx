import { Text } from '@mantine/core'
import type {
  Combatant,
  EnemyActionResolution,
} from '../../../game/combat/types'
import styles from './EnemyTurnOverlay.module.scss'

export type EnemyTurnPhase = 'intent' | 'attack' | 'result' | 'exit'

interface EnemyTurnOverlayProps {
  actor: Combatant
  phase: EnemyTurnPhase
  resolution: EnemyActionResolution
  target: Combatant
}

export function EnemyTurnOverlay({
  actor,
  phase,
  resolution,
  target,
}: EnemyTurnOverlayProps) {
  const displayPhase = phase === 'exit' ? 'result' : phase
  const attackRolls = resolution.rolls.filter(
    (roll) => roll.kind === 'attack',
  )
  const hit =
    attackRolls.length === 0 ||
    attackRolls.some((roll) => roll.success === true)

  return (
    <div
      className={styles.overlay}
      data-cy="enemy-turn-overlay"
      data-phase={phase}
    >
      <div key={displayPhase} className={styles.scene}>
        <div className={styles.intent}>
          <Text size="10px" fw={900} tt="uppercase">
            Enemy turn
          </Text>
          <Text component="h2" fw={900}>
            {displayPhase === 'intent'
              ? `${actor.name} prepares ${resolution.skill.name}`
              : displayPhase === 'attack'
                ? `${actor.name} attacks`
                : hit
                  ? `${resolution.skill.name} hits`
                  : `${resolution.skill.name} misses`}
          </Text>
        </div>

        <div className={styles.clash}>
          <div className={styles.combatant} data-role="actor">
            <div className={styles.portrait}>
              <img src={actor.portrait} alt="" />
            </div>
            <Text fw={900}>{actor.name}</Text>
          </div>

          <div className={styles.strike}>
            <span>VS</span>
            <i />
          </div>

          <div className={styles.combatant} data-role="target">
            <div className={styles.portrait}>
              <img src={target.portrait} alt="" />
            </div>
            <Text fw={900}>{target.name}</Text>
          </div>
        </div>

        <div className={styles.result} aria-live="polite">
          {displayPhase === 'intent' && (
            <Text size="xs" c="dimmed">
              {resolution.skill.description}
            </Text>
          )}
          {displayPhase === 'attack' && <Text fw={900}>Incoming!</Text>}
          {displayPhase === 'result' && (
            <>
              <Text
                className={styles.verdict}
                c={hit ? 'red' : 'brand'}
                fw={1000}
                tt="uppercase"
              >
                {hit ? 'Hit' : 'Miss'}
              </Text>
              <Text size="xs" c="dimmed">
                {resolution.message}
              </Text>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
