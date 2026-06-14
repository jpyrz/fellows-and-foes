import { Text } from '@mantine/core'
import type {
  Combatant,
  HeroActionResolution,
  Skill,
} from '../../../game/combat/types'
import styles from './HeroActionOverlay.module.scss'

export type HeroActionPhase = 'intent' | 'action' | 'result' | 'exit'

interface HeroActionOverlayProps {
  actor: Combatant
  phase: HeroActionPhase
  resolution: HeroActionResolution
  skill: Skill
  target: Combatant
}

const actionLabels = {
  damage: 'Hero attack',
  heal: 'Restoration',
  shield: 'Protection',
} as const

export function HeroActionOverlay({
  actor,
  phase,
  resolution,
  skill,
  target,
}: HeroActionOverlayProps) {
  const displayPhase = phase === 'exit' ? 'result' : phase
  const effectType = skill.effect.type
  const attackRolls = resolution.rolls.filter(
    (roll) => roll.kind === 'attack',
  )
  const hit =
    attackRolls.length === 0 ||
    attackRolls.some((roll) => roll.success === true)
  const isSelfCast = actor.id === target.id
  const verdict =
    effectType === 'damage'
      ? hit
        ? 'Hit'
        : 'Miss'
      : effectType === 'heal'
        ? 'Restored'
        : 'Shielded'

  return (
    <div
      className={styles.overlay}
      data-cy="hero-action-overlay"
      data-effect={effectType}
      data-phase={phase}
      data-self-cast={isSelfCast || undefined}
      data-success={hit || undefined}
    >
      <div key={displayPhase} className={styles.scene}>
        <div className={styles.heading}>
          <Text size="10px" fw={900} tt="uppercase">
            {actionLabels[effectType]}
          </Text>
          <Text component="h2" fw={900}>
            {displayPhase === 'intent'
              ? `${actor.name} readies ${skill.name}`
              : displayPhase === 'action'
                ? `${actor.name} uses ${skill.name}`
                : verdict}
          </Text>
        </div>

        <div className={styles.clash}>
          <div className={styles.combatant} data-role="actor">
            <div className={styles.portrait}>
              <img src={actor.portrait} alt="" />
            </div>
            <Text fw={900}>{actor.name}</Text>
          </div>

          {!isSelfCast && (
            <>
              <div className={styles.strike}>
                <span>
                  {effectType === 'damage'
                    ? 'VS'
                    : effectType === 'heal'
                      ? '+'
                      : '◆'}
                </span>
                <i />
              </div>

              <div className={styles.combatant} data-role="target">
                <div className={styles.portrait}>
                  <img src={target.portrait} alt="" />
                </div>
                <Text fw={900}>{target.name}</Text>
              </div>
            </>
          )}
        </div>

        <div className={styles.result} aria-live="polite">
          {displayPhase === 'intent' && (
            <Text size="xs" c="dimmed">
              {skill.description}
            </Text>
          )}
          {displayPhase === 'action' && (
            <Text fw={900}>
              {effectType === 'damage'
                ? 'Strike!'
                : effectType === 'heal'
                  ? 'Mending wounds...'
                  : 'Raising a ward...'}
            </Text>
          )}
          {displayPhase === 'result' && (
            <>
              <Text className={styles.verdict} fw={1000} tt="uppercase">
                {verdict}
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
