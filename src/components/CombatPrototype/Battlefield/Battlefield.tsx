import { Text } from '@mantine/core'
import type { Combatant } from '../../../game/combat/types'
import { UnitInspector } from './UnitInspector/UnitInspector'
import { UnitPanel } from './UnitPanel/UnitPanel'
import styles from './Battlefield.module.scss'

interface BattlefieldProps {
  activeCombatantId?: string
  enemies: Combatant[]
  heroes: Combatant[]
  isTargeting: boolean
  inspectedCombatantId: string | null
  latestMessage?: string
  onCloseInspection: () => void
  onChooseTarget: (targetId: string) => void
  onInspect: (combatantId: string) => void
  targetableIds: string[]
}

export function Battlefield({
  activeCombatantId,
  enemies,
  heroes,
  isTargeting,
  inspectedCombatantId,
  latestMessage,
  onCloseInspection,
  onChooseTarget,
  onInspect,
  targetableIds,
}: BattlefieldProps) {
  const combatants = [...enemies, ...heroes]
  const inspectedCombatant = combatants.find(
    (combatant) => combatant.id === inspectedCombatantId,
  )

  return (
    <section className={styles.battlefield}>
      <div className={styles.enemyLane}>
        <Text className={styles.laneLabel}>Enemies</Text>
        <div className={`${styles.unitGrid} ${styles.enemyGrid}`}>
          {enemies.map((enemy) => (
            <UnitPanel
              key={enemy.id}
              combatant={enemy}
              isActive={activeCombatantId === enemy.id}
              isTargetable={targetableIds.includes(enemy.id)}
              isTargeting={isTargeting}
              onInspect={onInspect}
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

      <div className={styles.partyLane}>
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
              onInspect={onInspect}
              onChooseTarget={onChooseTarget}
            />
          ))}
        </div>
      </div>

      {inspectedCombatant && (
        <UnitInspector
          combatant={inspectedCombatant}
          onClose={onCloseInspection}
        />
      )}
    </section>
  )
}
