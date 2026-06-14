import { Button, Text } from '@mantine/core'
import type { ItemDefinition } from '../../../../game/combat/types'
import styles from './ItemDetail.module.scss'

interface ItemDetailProps {
  item: ItemDefinition
  onCancel: () => void
  quantity: number
}

const targetLabels = {
  ally: 'Ally',
  enemy: 'Enemy',
  self: 'Self',
} as const

function formatEffect(item: ItemDefinition) {
  const { effect } = item

  if (effect.type === 'damage') return `${effect.amount} damage`
  if (effect.type === 'heal') return `Heal ${effect.amount}`
  if (effect.type === 'shield') return `${effect.amount} shield`
  return `Restore ${effect.amount} stamina`
}

export function ItemDetail({
  item,
  onCancel,
  quantity,
}: ItemDetailProps) {
  return (
    <div className={styles.detail} data-cy="item-detail">
      <div className={styles.iconFrame}>
        <img src={item.icon} alt="" />
        <span>{quantity}</span>
      </div>
      <div className={styles.copy}>
        <div className={styles.titleRow}>
          <Text component="h2" fw={900} size="lg">
            {item.name}
          </Text>
          <Text size="10px" c="dimmed" fw={800} tt="uppercase">
            Battle item
          </Text>
        </div>
        <Text size="xs" c="dimmed" lineClamp={2}>
          {item.description}
        </Text>
        <div className={styles.stats}>
          <span>
            <small>Effect</small>
            <strong>{formatEffect(item)}</strong>
          </span>
          <span>
            <small>Cast on</small>
            <strong>{targetLabels[item.target]}</strong>
          </span>
          <span>
            <small>Owned</small>
            <strong>{quantity}</strong>
          </span>
        </div>
      </div>
      <div className={styles.actions}>
        <Text size="10px" c="brand" fw={800} tt="uppercase">
          Choose a marked {item.target}
        </Text>
        <Button color="gray" onClick={onCancel} size="xs" variant="subtle">
          Close
        </Button>
      </div>
    </div>
  )
}
