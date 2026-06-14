import { Button, Text } from '@mantine/core'
import type { CombatStatus } from '../../../game/combat/types'
import styles from './BattleResult.module.scss'

interface BattleResultProps {
  actionLabel?: string
  onReset: () => void
  status: Exclude<CombatStatus, 'active'>
}

export function BattleResult({
  actionLabel = 'Fight again',
  onReset,
  status,
}: BattleResultProps) {
  const victory = status === 'victory'

  return (
    <div
      className={styles.overlay}
      data-cy="battle-result"
      data-status={status}
    >
      <div className={styles.result}>
        <div className={styles.stamp}>{victory ? 'Victory' : 'Defeat'}</div>
        <Text component="h2" fw={900}>
          {victory ? 'The road is yours.' : 'The expedition has fallen.'}
        </Text>
        <Text c="dimmed" size="sm">
          {victory
            ? 'The party survives and may continue toward Bellweather.'
            : 'Regroup, revise your tactics, and face the mire again.'}
        </Text>
        <Button
          color={victory ? 'brand' : 'red'}
          onClick={onReset}
          size="md"
        >
          {actionLabel}
        </Button>
      </div>
    </div>
  )
}
