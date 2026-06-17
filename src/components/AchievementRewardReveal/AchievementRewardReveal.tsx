import { Button } from '@mantine/core'
import type { AchievementDefinition } from '../../game/campaign/types'
import styles from './AchievementRewardReveal.module.scss'

interface AchievementRewardRevealProps {
  achievement: AchievementDefinition
  onContinue(): void
}

export function AchievementRewardReveal({
  achievement,
  onContinue,
}: AchievementRewardRevealProps) {
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.reveal}>
        <span>Achievement completed</span>
        <div className={styles.stamp}>{achievement.name}</div>
        <p className={styles.reward}>{achievement.rewardText}</p>
        <small>{achievement.description}</small>
        <Button color="brand" size="md" onClick={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  )
}
