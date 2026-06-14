import { Badge, Group, Progress, Text } from '@mantine/core'
import type { Combatant } from '../../../../game/combat/types'
import styles from './UnitPanel.module.scss'

interface UnitPanelProps {
  combatant: Combatant
  isActive: boolean
  isTargetable: boolean
  isTargeting: boolean
  layout?: 'default' | 'party'
  onChooseTarget: (targetId: string) => void
}

export function UnitPanel({
  combatant,
  isActive,
  isTargetable,
  isTargeting,
  layout = 'default',
  onChooseTarget,
}: UnitPanelProps) {
  const healthPercent = (combatant.health / combatant.maxHealth) * 100
  const isDown = combatant.health === 0

  return (
    <button
      aria-label={
        isTargetable ? `Target ${combatant.name}` : combatant.name
      }
      className={styles.unit}
      data-active={isActive || undefined}
      data-downed={isDown || undefined}
      data-layout={layout}
      data-targetable={isTargetable || undefined}
      data-targeting={isTargeting || undefined}
      data-cy={isTargetable ? `target-${combatant.id}` : undefined}
      disabled={!isTargetable}
      onClick={() => onChooseTarget(combatant.id)}
      type="button"
    >
      <div
        className={styles.portrait}
        data-cy={`combatant-${combatant.id}`}
      >
        <img src={combatant.portrait} alt="" />
        {isActive && <i className={styles.turnMarker} />}
        {isTargetable && <span className={styles.targetMarker}>Target</span>}
      </div>

      <div className={styles.unitDetails}>
        <Group justify="space-between" gap="xs" wrap="nowrap">
          <div className={styles.unitName}>
            <Text fw={800} size="sm" truncate>
              {combatant.name}
            </Text>
            <Text
              className={styles.unitTitle}
              size="10px"
              c="dimmed"
              tt="uppercase"
              fw={700}
              truncate
            >
              {combatant.title}
            </Text>
          </div>
          <Text size="10px" c="dimmed" fw={700}>
            DEF {combatant.defense}
          </Text>
        </Group>

        <div className={styles.healthBar}>
          <Progress
            value={healthPercent}
            color={
              isDown
                ? 'gray'
                : combatant.team === 'heroes'
                  ? 'var(--ff-health)'
                  : 'var(--ff-danger)'
            }
            size={7}
          />
          <Text size="10px" fw={700} data-cy={`${combatant.id}-health`}>
            {combatant.health}/{combatant.maxHealth}
          </Text>
        </div>

        {combatant.team === 'heroes' && (
          <div
            className={styles.staminaPips}
            data-cy={`${combatant.id}-stamina`}
          >
            {Array.from({ length: combatant.maxStamina }, (_, index) => (
              <i
                key={index}
                data-filled={index < combatant.stamina || undefined}
              />
            ))}
            <span>
              {combatant.stamina}/{combatant.maxStamina}
            </span>
          </div>
        )}

        {(combatant.shield > 0 || combatant.staggered || isDown) && (
          <Group gap={4} mt={4}>
            {combatant.shield > 0 && (
              <Badge size="xs" color="var(--ff-info)" variant="filled">
                {combatant.shield} shield
              </Badge>
            )}
            {combatant.staggered && (
              <Badge size="xs" color="var(--ff-warning)" variant="filled">
                Staggered
              </Badge>
            )}
            {isDown && (
              <Badge size="xs" color="gray" variant="filled">
                {combatant.team === 'heroes' ? 'Down' : 'Defeated'}
              </Badge>
            )}
          </Group>
        )}
      </div>
    </button>
  )
}
