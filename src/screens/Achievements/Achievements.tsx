import { Badge, Button } from '@mantine/core'
import { useState } from 'react'
import { AchievementRewardReveal } from '../../components/AchievementRewardReveal/AchievementRewardReveal'
import { GameShell } from '../../components/GameShell/GameShell'
import {
  achievementDefinitions,
  achievementIds,
} from '../../game/campaign/achievements'
import { useGame } from '../../game/campaign/gameContext'
import styles from './Achievements.module.scss'

export function Achievements() {
  const { claimAchievement, save } = useGame()
  const [revealedAchievementId, setRevealedAchievementId] = useState<
    string | null
  >(null)
  const completedIds = new Set(
    save.achievements.map((achievement) => achievement.id),
  )
  const claimedIds = new Set(
    save.achievements
      .filter((achievement) => achievement.claimedAt)
      .map((achievement) => achievement.id),
  )
  const revealedAchievement = revealedAchievementId
    ? achievementDefinitions[revealedAchievementId]
    : null

  function claim(achievementId: string) {
    claimAchievement(achievementId)
    setRevealedAchievementId(achievementId)
  }

  return (
    <GameShell eyebrow="Tavern Boasts" title="Achievement Log">
      <div className={styles.achievements}>
        <section className={styles.hero}>
          <span>The good stuff lives here</span>
          <h1>Complete achievements, then claim the reward.</h1>
          <p>
            XP still levels your fellow, but rare spells and future secondary
            paths come from campaign feats, boss challenges, and memorable
            table moments.
          </p>
        </section>

        <section className={styles.grid}>
          {achievementIds.map((achievementId) => {
            const achievement = achievementDefinitions[achievementId]
            const completed = completedIds.has(achievement.id)
            const claimed = claimedIds.has(achievement.id)
            return (
              <article
                key={achievement.id}
                className={styles.card}
                data-unlocked={completed || undefined}
              >
                <div>
                  <Badge
                    color={claimed ? 'brand' : completed ? 'yellow' : 'gray'}
                    variant="light"
                  >
                    {claimed
                      ? 'Claimed'
                      : completed
                        ? 'Ready to claim'
                        : achievement.difficulty}
                  </Badge>
                  <span>{achievement.category}</span>
                </div>
                <h2>{achievement.name}</h2>
                <p>{achievement.description}</p>
                <small>{achievement.requirement}</small>
                <strong>{achievement.rewardText}</strong>
                {completed && !claimed && (
                  <Button color="brand" onClick={() => claim(achievement.id)}>
                    Claim rewards
                  </Button>
                )}
              </article>
            )
          })}
        </section>
      </div>
      {revealedAchievement && (
        <AchievementRewardReveal
          achievement={revealedAchievement}
          onContinue={() => setRevealedAchievementId(null)}
        />
      )}
    </GameShell>
  )
}
