import { Text } from '@mantine/core'
import type { Combatant } from '../../../game/combat/types'
import { UnitPanel } from './UnitPanel/UnitPanel'
import styles from './Battlefield.module.scss'

interface BattlefieldProps {
  activeCombatantId?: string
  enemies: Combatant[]
  heroes: Combatant[]
  latestMessage?: string
}

export function Battlefield({
  activeCombatantId,
  enemies,
  heroes,
  latestMessage,
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
              layout="party"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
