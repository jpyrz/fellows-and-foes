import { Badge, Button, Text } from '@mantine/core'
import type { Combatant } from '../../../../game/combat/types'
import styles from './UnitInspector.module.scss'

interface UnitInspectorProps {
  combatant: Combatant
  onClose: () => void
}

export function UnitInspector({
  combatant,
  onClose,
}: UnitInspectorProps) {
  const isDown = combatant.health === 0

  return (
    <aside
      aria-label={`${combatant.name} details`}
      className={styles.inspector}
      data-cy="unit-inspector"
      role="dialog"
    >
      <div className={styles.portrait}>
        <img src={combatant.portrait} alt="" />
      </div>

      <div className={styles.identity}>
        <Text size="10px" c="brand" fw={900} tt="uppercase">
          {combatant.team === 'heroes' ? 'Fellow' : 'Foe'}
        </Text>
        <Text component="h2" fw={900} size="lg">
          {combatant.name}
        </Text>
        <Text size="10px" c="dimmed" fw={800} tt="uppercase">
          {combatant.title}
        </Text>
      </div>

      <Button
        aria-label="Close unit details"
        className={styles.close}
        color="gray"
        onClick={onClose}
        size="compact-xs"
        variant="subtle"
      >
        Close
      </Button>

      <div className={styles.stats}>
        <span>
          <small>Health</small>
          <strong>
            {combatant.health}/{combatant.maxHealth}
          </strong>
        </span>
        <span>
          <small>Defense</small>
          <strong>{combatant.defense}</strong>
        </span>
        <span>
          <small>Initiative</small>
          <strong>{combatant.initiative}</strong>
        </span>
        <span>
          <small>{combatant.team === 'heroes' ? 'Stamina' : 'Shield'}</small>
          <strong>
            {combatant.team === 'heroes'
              ? `${combatant.stamina}/${combatant.maxStamina}`
              : combatant.shield}
          </strong>
        </span>
      </div>

      {(combatant.behavior ||
        combatant.shield > 0 ||
        combatant.staggered ||
        isDown) && (
        <div className={styles.notes}>
          {combatant.behavior && (
            <Text size="xs" c="dimmed">
              {combatant.behavior}
            </Text>
          )}
          <div className={styles.badges}>
            {combatant.shield > 0 && (
              <Badge size="xs" color="blue">
                {combatant.shield} shield
              </Badge>
            )}
            {combatant.staggered && (
              <Badge size="xs" color="yellow">
                Staggered
              </Badge>
            )}
            {isDown && (
              <Badge size="xs" color="gray">
                {combatant.team === 'heroes' ? 'Down' : 'Defeated'}
              </Badge>
            )}
          </div>
        </div>
      )}
    </aside>
  )
}
