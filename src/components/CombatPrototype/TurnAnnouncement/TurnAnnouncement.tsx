import { Text } from '@mantine/core'
import type { Team } from '../../../game/combat/types'
import styles from './TurnAnnouncement.module.scss'

interface TurnAnnouncementProps {
  combatantName: string
  team: Team
}

export function TurnAnnouncement({
  combatantName,
  team,
}: TurnAnnouncementProps) {
  const isEnemy = team === 'enemies'

  return (
    <div
      className={styles.overlay}
      data-cy="turn-announcement"
      data-team={team}
      role="status"
    >
      <div className={styles.line} />
      <Text className={styles.label} fw={1000} tt="uppercase">
        {isEnemy ? 'Enemy Turn' : 'Your Turn'}
      </Text>
      <Text className={styles.combatant} fw={900}>
        {isEnemy ? `${combatantName} advances` : `${combatantName} is ready`}
      </Text>
      <div className={styles.line} />
    </div>
  )
}
