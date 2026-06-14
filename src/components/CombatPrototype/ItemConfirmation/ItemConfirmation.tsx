import { Button, Text } from '@mantine/core'
import type {
  Combatant,
  ItemDefinition,
} from '../../../game/combat/types'
import styles from './ItemConfirmation.module.scss'

interface ItemConfirmationProps {
  actor: Combatant
  item: ItemDefinition
  onBack: () => void
  onConfirm: () => void
  quantity: number
  target: Combatant
}

export function ItemConfirmation({
  actor,
  item,
  onBack,
  onConfirm,
  quantity,
  target,
}: ItemConfirmationProps) {
  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={`Use ${item.name}`}
      data-cy="item-confirmation"
    >
      <div className={styles.confirmation}>
        <Text size="10px" c="brand" fw={900} tt="uppercase">
          Confirm battle item
        </Text>
        <div className={styles.itemIcon}>
          <img src={item.icon} alt="" />
          <span>{quantity}</span>
        </div>
        <Text component="h2" fw={900}>
          {item.name}
        </Text>
        <Text size="sm" c="dimmed">
          {actor.name} → {target.name}
        </Text>
        <Text className={styles.warning} size="xs" fw={800}>
          Using this item consumes your turn and one item.
        </Text>
        <div className={styles.actions}>
          <Button color="gray" variant="subtle" onClick={onBack}>
            Back
          </Button>
          <Button color="brand" onClick={onConfirm}>
            Use item
          </Button>
        </div>
      </div>
    </div>
  )
}
