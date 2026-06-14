import { Text } from '@mantine/core'
import type { Team } from '../../../game/combat/types'
import styles from './TurnAnnouncement.module.scss'

interface TurnAnnouncementProps {
  combatantName: string
  onDismiss: () => void
  team: Team
}

export function TurnAnnouncement({
  combatantName,
  onDismiss,
  team,
}: TurnAnnouncementProps) {
  const isEnemy = team === 'enemies'

  return (
    <button
      type="button"
      className={styles.overlay}
      data-cy="turn-announcement"
      data-team={team}
      aria-label={`${isEnemy ? 'Enemy turn' : 'Your turn'}: ${combatantName}. Tap to continue.`}
      onClick={onDismiss}
    >
      <div className={styles.line} />
      <Text className={styles.label} fw={1000} tt="uppercase">
        {isEnemy ? 'Enemy Turn' : 'Your Turn'}
      </Text>
      <Text className={styles.combatant} fw={900}>
        {isEnemy ? `${combatantName} advances` : `${combatantName} is ready`}
      </Text>
      <div className={styles.line} />
      <Text className={styles.hint} size="10px" fw={800} tt="uppercase">
        Tap to continue
      </Text>
    </button>
  )
}
