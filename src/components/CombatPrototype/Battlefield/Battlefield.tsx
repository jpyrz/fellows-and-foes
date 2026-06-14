import { Text } from '@mantine/core'
import type { Combatant } from '../../../game/combat/types'
import { UnitPanel } from './UnitPanel/UnitPanel'
import styles from './Battlefield.module.scss'

interface BattlefieldProps {
  activeCombatantId?: string
  enemies: Combatant[]
  heroes: Combatant[]
  isTargeting: boolean
  latestMessage?: string
  onChooseTarget: (targetId: string) => void
  targetableIds: string[]
}

export function Battlefield({
  activeCombatantId,
  enemies,
  heroes,
  isTargeting,
  latestMessage,
  onChooseTarget,
  targetableIds,
}: BattlefieldProps) {
  return (
    <section className={styles.battlefield}>
      <div>
        <Text className={styles.laneLabel}>Enemies</Text>
        <div className={`${styles.unitGrid} ${styles.enemyGrid}`}>
          {enemies.map((enemy) => (
            <UnitPanel
              key={enemy.id}
              combatant={enemy}
              isActive={activeCombatantId === enemy.id}
              isTargetable={targetableIds.includes(enemy.id)}
              isTargeting={isTargeting}
              onChooseTarget={onChooseTarget}
            />
          ))}
        </div>
      </div>

      <div className={styles.eventRibbon}>
        <span>◆</span>
        <Text size="xs" lineClamp={2}>
          {latestMessage}
        </Text>
      </div>

      <div>
        <Text className={styles.laneLabel}>Party</Text>
        <div className={`${styles.unitGrid} ${styles.partyGrid}`}>
          {heroes.map((hero) => (
            <UnitPanel
              key={hero.id}
              combatant={hero}
              isActive={activeCombatantId === hero.id}
              isTargetable={targetableIds.includes(hero.id)}
              isTargeting={isTargeting}
              layout="party"
              onChooseTarget={onChooseTarget}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
