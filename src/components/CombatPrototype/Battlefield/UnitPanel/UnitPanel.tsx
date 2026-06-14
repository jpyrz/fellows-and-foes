import { Text } from '@mantine/core'
import { useEffect, useRef, useState } from 'react'
import type { Combatant } from '../../../../game/combat/types'
import styles from './UnitPanel.module.scss'

type CombatFeedback = 'damage' | 'heal' | 'shield' | null

interface UnitPanelProps {
  combatant: Combatant
  isActive: boolean
  isFeedbackSuppressed: boolean
  isTargetable: boolean
  isTargeting: boolean
  layout?: 'default' | 'party'
  onChooseTarget: (targetId: string) => void
  onInspect: (combatantId: string) => void
}

export function UnitPanel({
  combatant,
  isActive,
  isFeedbackSuppressed,
  isTargetable,
  isTargeting,
  layout = 'default',
  onChooseTarget,
  onInspect,
}: UnitPanelProps) {
  const healthPercent = (combatant.health / combatant.maxHealth) * 100
  const staminaPercent =
    combatant.maxStamina > 0
      ? (combatant.stamina / combatant.maxStamina) * 100
      : 0
  const isDown = combatant.health === 0
  const previousHealth = useRef(combatant.health)
  const previousShield = useRef(combatant.shield)
  const [feedback, setFeedback] = useState<CombatFeedback>(null)
  const visibleFeedback = isFeedbackSuppressed ? null : feedback

  useEffect(() => {
    let nextFeedback: CombatFeedback = null

    if (combatant.health < previousHealth.current) {
      nextFeedback = 'damage'
    } else if (combatant.health > previousHealth.current) {
      nextFeedback = 'heal'
    } else if (combatant.shield > previousShield.current) {
      nextFeedback = 'shield'
    }

    previousHealth.current = combatant.health
    previousShield.current = combatant.shield

    if (isFeedbackSuppressed) {
      return
    }

    if (!nextFeedback) {
      return
    }

    setFeedback(nextFeedback)
    const timeout = window.setTimeout(() => setFeedback(null), 700)
    return () => window.clearTimeout(timeout)
  }, [combatant.health, combatant.shield, isFeedbackSuppressed])

  function handleClick() {
    if (isTargetable) {
      onChooseTarget(combatant.id)
      return
    }

    if (!isTargeting) {
      onInspect(combatant.id)
    }
  }

  return (
    <button
      aria-label={
        isTargetable
          ? `Target ${combatant.name}`
          : `Inspect ${combatant.name}`
      }
      className={styles.unit}
      data-active={isActive || undefined}
      data-downed={isDown || undefined}
      data-feedback={visibleFeedback ?? undefined}
      data-layout={layout}
      data-targetable={isTargetable || undefined}
      data-targeting={isTargeting || undefined}
      data-cy={isTargetable ? `target-${combatant.id}` : undefined}
      disabled={isTargeting && !isTargetable}
      onClick={handleClick}
      type="button"
    >
      <div
        className={styles.portrait}
        data-cy={`combatant-${combatant.id}`}
      >
        <img src={combatant.portrait} alt="" />
        {isActive && <span className={styles.turnMarker}>Active</span>}
        {isTargetable && (
          <span className={styles.targetReticle} aria-hidden="true" />
        )}
        {visibleFeedback && (
          <span className={styles.feedbackLabel}>
            {visibleFeedback === 'damage'
              ? 'Hit'
              : visibleFeedback === 'heal'
                ? 'Healed'
                : 'Shielded'}
          </span>
        )}
      </div>

      <div className={styles.unitDetails}>
        <Text className={styles.unitName} fw={900} size="sm" truncate>
          {combatant.name}
        </Text>

        <div className={styles.healthBar}>
          <span>
            <i style={{ width: `${healthPercent}%` }} />
          </span>
          <Text size="9px" fw={800} data-cy={`${combatant.id}-health`}>
            {combatant.health}/{combatant.maxHealth}
          </Text>
        </div>

        {combatant.team === 'heroes' && (
          <div className={styles.staminaBar} data-cy={`${combatant.id}-stamina`}>
            <span>
              <i style={{ width: `${staminaPercent}%` }} />
            </span>
            <Text size="9px" fw={800}>
              {combatant.stamina}/{combatant.maxStamina}
            </Text>
          </div>
        )}

        {(combatant.shield > 0 || combatant.staggered || isDown) && (
          <div className={styles.statuses}>
            {combatant.shield > 0 && <span>◆ {combatant.shield}</span>}
            {combatant.staggered && <span>Staggered</span>}
            {isDown && (
              <span>{combatant.team === 'heroes' ? 'Down' : 'Defeated'}</span>
            )}
          </div>
        )}
      </div>
    </button>
  )
}
