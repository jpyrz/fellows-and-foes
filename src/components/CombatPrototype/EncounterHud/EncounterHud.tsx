import { ActionIcon, Badge, Button, Group, Text } from '@mantine/core'
import type {
  CombatStatus,
  Combatant,
} from '../../../game/combat/types'
import { InitiativeTrack } from './InitiativeTrack/InitiativeTrack'
import styles from './EncounterHud.module.scss'

interface EncounterHudProps {
  activeCombatantId?: string
  combatants: Combatant[]
  onOpenLog: () => void
  onReset: () => void
  round: number
  status: CombatStatus
  turnOrder: string[]
  campaignLabel?: string
  encounterTitle?: string
  canReset?: boolean
}

export function EncounterHud({
  activeCombatantId,
  combatants,
  onOpenLog,
  onReset,
  round,
  status,
  turnOrder,
  campaignLabel = 'Old Road · Encounter 01',
  canReset = true,
  encounterTitle = 'Smoke in the Mire',
}: EncounterHudProps) {
  return (
    <section className={styles.hud}>
      <div className={styles.summary}>
        <div className={styles.encounter}>
          <Text size="9px" c="brand" fw={900} tt="uppercase">
            {campaignLabel}
          </Text>
          <Text className={styles.title} fw={900}>
            {encounterTitle}
          </Text>
        </div>

        <Group className={styles.controls} gap="xs" wrap="nowrap">
          <Badge
            className={styles.round}
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
          <Button
            className={styles.logButton}
            color="gray"
            onClick={onOpenLog}
            size="compact-xs"
            variant="subtle"
          >
            Log
          </Button>
          {canReset && (
            <ActionIcon
              className={styles.resetButton}
              variant="subtle"
              color="gray"
              aria-label="Reset encounter"
              onClick={onReset}
            >
              ↻
            </ActionIcon>
          )}
        </Group>
      </div>

      <InitiativeTrack
        activeCombatantId={activeCombatantId}
        combatants={combatants}
        turnOrder={turnOrder}
      />
    </section>
  )
}
