import { Badge, Group, Text } from '@mantine/core'
import type {
  CombatStatus,
  Combatant,
} from '../../../game/combat/types'
import { InitiativeTrack } from './InitiativeTrack/InitiativeTrack'
import styles from './EncounterHud.module.scss'

interface EncounterHudProps {
  activeCombatantId?: string
  combatants: Combatant[]
  round: number
  status: CombatStatus
  turnOrder: string[]
}

export function EncounterHud({
  activeCombatantId,
  combatants,
  round,
  status,
  turnOrder,
}: EncounterHudProps) {
  return (
    <section className={styles.hud}>
      <Group justify="space-between" wrap="nowrap">
        <div>
          <Text size="10px" c="brand" fw={800} tt="uppercase">
            Encounter 01
          </Text>
          <Text fw={800} size="lg">
            Smoke in the Mire
          </Text>
        </div>
        <Badge
          color={
            status === 'victory'
              ? 'brand'
              : status === 'defeat'
                ? 'red'
                : 'dark'
          }
          variant="filled"
          data-cy="combat-status"
        >
          {status === 'active' ? `Round ${round}` : status}
        </Badge>
      </Group>

      <InitiativeTrack
        activeCombatantId={activeCombatantId}
        combatants={combatants}
        turnOrder={turnOrder}
      />
    </section>
  )
}
