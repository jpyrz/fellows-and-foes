import { UnstyledButton } from '@mantine/core'
import type { ItemDefinition } from '../../../../game/combat/types'
import styles from './ItemMenu.module.scss'

interface ItemMenuProps {
  inventoryItems: { item: ItemDefinition; quantity: number }[]
  isItemAvailable: (item: ItemDefinition) => boolean
  itemUsedThisTurn: boolean
  onSelectItem: (itemId: string) => void
  selectedItemId?: string
}

export function ItemMenu({
  inventoryItems,
  isItemAvailable,
  itemUsedThisTurn,
  onSelectItem,
  selectedItemId,
}: ItemMenuProps) {
  const slots = Array.from({ length: 4 }, (_, index) => inventoryItems[index])

  return (
    <div className={styles.inventory} aria-label="Battle items">
      {slots.map((stack, index) =>
        stack ? (
          <UnstyledButton
            key={stack.item.id}
            aria-label={`${stack.item.name}, quantity ${stack.quantity}`}
            className={styles.itemSlot}
            data-cy={`item-${stack.item.id}`}
            data-selected={selectedItemId === stack.item.id || undefined}
            disabled={itemUsedThisTurn || !isItemAvailable(stack.item)}
            onClick={() => onSelectItem(stack.item.id)}
          >
            <img src={stack.item.icon} alt="" />
            <span className={styles.quantity}>{stack.quantity}</span>
          </UnstyledButton>
        ) : (
          <div
            key={`empty-${index}`}
            className={styles.emptySlot}
            aria-label="Empty inventory slot"
          >
            <span>+</span>
          </div>
        ),
      )}
    </div>
  )
}
