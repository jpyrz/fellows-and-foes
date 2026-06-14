import { Button, Text } from '@mantine/core'
import type {
  Combatant,
  ItemDefinition,
  Skill,
} from '../../../game/combat/types'
import { ItemDetail } from './ItemDetail/ItemDetail'
import { ItemMenu } from './ItemMenu/ItemMenu'
import { SkillDetail } from './SkillDetail/SkillDetail'
import { SkillMenu } from './SkillMenu/SkillMenu'
import styles from './CommandDeck.module.scss'

interface CommandDeckProps {
  activeView: 'abilities' | 'items'
  activeCombatant?: Combatant
  inventoryItems: { item: ItemDefinition; quantity: number }[]
  isItemAvailable: (item: ItemDefinition) => boolean
  itemUsedThisTurn: boolean
  isTargeting: boolean
  isSkillAvailable: (skill: Skill) => boolean
  onCancelSelection: () => void
  onChangeView: (view: 'abilities' | 'items') => void
  onSelectItem: (itemId: string) => void
  onSelectSkill: (skillId: string) => void
  onSkipTurn: () => void
  selectedItem?: ItemDefinition
  selectedSkill?: Skill
}

export function CommandDeck({
  activeView,
  activeCombatant,
  inventoryItems,
  isItemAvailable,
  itemUsedThisTurn,
  isTargeting,
  isSkillAvailable,
  onCancelSelection,
  onChangeView,
  onSelectItem,
  onSelectSkill,
  onSkipTurn,
  selectedItem,
  selectedSkill,
}: CommandDeckProps) {
  return (
    <section className={styles.commandDeck}>
      {activeCombatant ? (
        <>
          <div className={styles.commandHeader}>
            <div className={styles.activePortrait}>
              <img src={activeCombatant.portrait} alt="" />
            </div>
            <div className={styles.commandTitle}>
              <Text size="10px" c="brand" fw={800} tt="uppercase">
                Your turn
              </Text>
              <Text fw={800} data-cy="active-turn">
                {activeCombatant.name}
              </Text>
            </div>
            <div className={styles.activeStamina}>
              <Text size="10px" c="dimmed" fw={700}>
                STAMINA
              </Text>
              <Text fw={800}>{activeCombatant.stamina}</Text>
            </div>
            <Button
              className={styles.skipButton}
              color="gray"
              size="compact-xs"
              variant="subtle"
              onClick={onSkipTurn}
            >
              <span className={styles.fullSkipLabel}>Skip turn</span>
              <span className={styles.compactSkipLabel}>Skip</span>
            </Button>
          </div>

          <div className={styles.commandTabs}>
            <button
              type="button"
              data-active={activeView === 'abilities' || undefined}
              onClick={() => onChangeView('abilities')}
            >
              Abilities
            </button>
            <button
              type="button"
              data-active={activeView === 'items' || undefined}
              data-used={itemUsedThisTurn || undefined}
              disabled={itemUsedThisTurn}
              onClick={() => onChangeView('items')}
            >
              Items
              <span>
                {itemUsedThisTurn
                  ? 'Used'
                  : `${activeCombatant.inventory.length}/4`}
              </span>
            </button>
          </div>

          <div className={styles.abilityLabel}>
            <Text size="10px" c="dimmed" fw={800} tt="uppercase">
              {isTargeting
                ? 'Select a combatant'
                : activeView === 'abilities'
                  ? 'Abilities'
                  : 'Battle items'}
            </Text>
            <Text size="10px" c={isTargeting ? 'brand' : 'dimmed'} fw={800}>
              {isTargeting ? 'Valid targets are marked' : 'Tap to inspect'}
            </Text>
          </div>

          {activeView === 'abilities' ? (
            <SkillMenu
              isSkillAvailable={isSkillAvailable}
              onSelectSkill={onSelectSkill}
              selectedSkillId={selectedSkill?.id}
              skills={activeCombatant.skills}
            />
          ) : (
            <ItemMenu
              inventoryItems={inventoryItems}
              isItemAvailable={isItemAvailable}
              itemUsedThisTurn={itemUsedThisTurn}
              onSelectItem={onSelectItem}
              selectedItemId={selectedItem?.id}
            />
          )}

          {selectedSkill && (
            <SkillDetail onCancel={onCancelSelection} skill={selectedSkill} />
          )}
          {selectedItem && (
            <ItemDetail
              item={selectedItem}
              onCancel={onCancelSelection}
              quantity={
                inventoryItems.find(
                  ({ item }) => item.id === selectedItem.id,
                )?.quantity ?? 0
              }
            />
          )}
        </>
      ) : (
        <div className={styles.waiting}>
          <span />
          <Text size="10px" c="dimmed" fw={900} tt="uppercase">
            Battle in progress
          </Text>
        </div>
      )}
    </section>
  )
}
