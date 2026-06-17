import { Badge, Button, Progress } from '@mantine/core'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AchievementRewardReveal } from '../../components/AchievementRewardReveal/AchievementRewardReveal'
import { GameShell } from '../../components/GameShell/GameShell'
import {
  achievementDefinitions,
  achievementIds,
} from '../../game/campaign/achievements'
import { classDefinitions } from '../../game/campaign/classes'
import { useGame } from '../../game/campaign/gameContext'
import { getCampaignDefinition } from '../../game/campaign/content'
import {
  levelThresholds,
  statLabels,
} from '../../game/campaign/rules'
import type { StatName } from '../../game/campaign/types'
import styles from './Dashboard.module.scss'

export function Dashboard() {
  const { allocateStat, claimAchievement, save, setActiveCharacter } = useGame()
  const [revealedAchievementId, setRevealedAchievementId] = useState<
    string | null
  >(null)
  const navigate = useNavigate()
  const character = save.character

  if (!character) {
    return (
      <GameShell title="A Company Unwritten">
        <section className={styles.emptyHero}>
          <span className={styles.kicker}>The tavern is listening</span>
          <h1>Every tale needs its first fellow.</h1>
          <p>
            Create a persistent hero, choose a class, and step into living
            tavern tales told through a strange little storyglass.
          </p>
          <Button
            color="brand"
            size="lg"
            onClick={() => navigate('/character/create')}
            data-cy="create-character"
          >
            Create your fellow
          </Button>
        </section>
      </GameShell>
    )
  }

  const nextThreshold =
    levelThresholds[character.level] ?? levelThresholds.at(-1)!
  const previousThreshold = levelThresholds[character.level - 1] ?? 0
  const progress =
    character.level >= 5
      ? 100
      : ((character.xp - previousThreshold) /
          (nextThreshold - previousThreshold)) *
        100
  const classDefinition = classDefinitions[character.classId]
  const readyAchievements = save.achievements.filter(
    (achievement) => !achievement.claimedAt,
  )
  const revealedAchievement = revealedAchievementId
    ? achievementDefinitions[revealedAchievementId]
    : null

  function claimReadyAchievement(achievementId: string) {
    claimAchievement(achievementId)
    setRevealedAchievementId(achievementId)
  }

  return (
    <GameShell title="Company Ledger">
      <div className={styles.dashboard}>
        <section className={styles.heroCard}>
          <img src={character.portrait} alt="" />
          <div className={styles.heroIdentity}>
            <span>Your persistent fellow</span>
            <h1>{character.name}</h1>
            <p>
              Level {character.level} · {classDefinition.name} ·{' '}
              {character.armorType} armor
            </p>
            <Progress value={progress} color="brand" size="sm" />
            <small>
              {character.level >= 5
                ? `${character.xp} XP · Maximum level`
                : `${character.xp} / ${nextThreshold} XP`}
            </small>
          </div>
          <div className={styles.stats}>
            {(Object.keys(statLabels) as StatName[]).map((stat) => (
              <div key={stat}>
                <span>{statLabels[stat]}</span>
                <strong>{character.stats[stat]}</strong>
                {character.unspentStatPoints > 0 &&
                  character.stats[stat] < 5 && (
                    <button onClick={() => allocateStat(character.id, stat)}>
                      +
                    </button>
                  )}
              </div>
            ))}
          </div>
          {character.unspentStatPoints > 0 && (
            <div className={styles.levelNotice}>
              {character.unspentStatPoints} stat point
              {character.unspentStatPoints === 1 ? '' : 's'} ready to spend
            </div>
          )}
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <div>
              <span>Completed achievements</span>
              <h2>Ready to claim</h2>
            </div>
            <Button
              color="brand"
              variant="light"
              onClick={() => navigate('/achievements')}
            >
              View log
            </Button>
          </div>
          {readyAchievements.length === 0 ? (
            <div className={styles.emptyRun}>
              <strong>
                {
                  save.achievements.filter((achievement) => achievement.claimedAt)
                    .length
                }
                /{achievementIds.length} rewards claimed
              </strong>
              <span>
                Completed achievements with unclaimed rewards will appear here.
              </span>
            </div>
          ) : (
            <div className={styles.claimList}>
              {readyAchievements.slice(0, 3).map((achievement) => {
                const definition = achievementDefinitions[achievement.id]
                return (
                  <article key={achievement.id}>
                    <span>{definition.category}</span>
                    <strong>{definition.name}</strong>
                    <small>{definition.rewardText}</small>
                    <Button
                      color="brand"
                      size="compact-sm"
                      onClick={() => claimReadyAchievement(achievement.id)}
                    >
                      Claim rewards
                    </Button>
                  </article>
                )
              })}
              {readyAchievements.length > 3 && (
                <Button variant="subtle" onClick={() => navigate('/achievements')}>
                  View all ready rewards
                </Button>
              )}
            </div>
          )}
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <div>
              <span>Persistent roster</span>
              <h2>Your fellows</h2>
            </div>
            <Button
              color="brand"
              variant="light"
              onClick={() => navigate('/character/create')}
              data-cy="create-character"
            >
              Create another fellow
            </Button>
          </div>
          <div className={styles.rosterGrid}>
            {save.characters.map((fellow) => (
              <article
                key={fellow.id}
                className={styles.rosterCard}
                data-active={fellow.id === save.activeCharacterId || undefined}
              >
                <button
                  className={styles.rosterMain}
                  onClick={() => navigate(`/characters/${fellow.id}`)}
                  data-cy={`character-card-${fellow.id}`}
                >
                  <img src={fellow.portrait} alt="" />
                  <span>
                    <strong>{fellow.name}</strong>
                    <small>
                      Level {fellow.level} · {fellow.unlockedSkillIds.length}{' '}
                      spells
                    </small>
                    <em>
                      {classDefinitions[fellow.classId].name} ·{' '}
                      {fellow.background}
                    </em>
                  </span>
                </button>
                <Button
                  size="compact-xs"
                  variant={
                    fellow.id === save.activeCharacterId ? 'filled' : 'subtle'
                  }
                  color="brand"
                  onClick={() => setActiveCharacter(fellow.id)}
                >
                  {fellow.id === save.activeCharacterId
                    ? 'Active'
                    : 'Make active'}
                </Button>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <div>
              <span>Living tales</span>
              <h2>Active tavern tales</h2>
            </div>
            <Button
              color="brand"
              onClick={() => navigate('/campaign/new')}
              disabled={save.activeRuns.some(
                (run) => run.campaignId === 'the-old-road',
              )}
              data-cy="start-campaign"
            >
              Start campaign
            </Button>
          </div>
          <div className={styles.runGrid}>
            {save.activeRuns.length === 0 && (
              <div className={styles.emptyRun}>
                <strong>The storyglass is quiet.</strong>
                <span>Begin The Old Road when your company is ready.</span>
              </div>
            )}
            {save.activeRuns.map((run) => {
              const campaign = getCampaignDefinition(run.campaignId)
              return (
                <button
                  className={styles.runCard}
                  key={run.id}
                  onClick={() => navigate(`/campaign/${run.id}`)}
                  data-cy="active-campaign"
                >
                  <Badge color="brand" variant="light">
                    {run.chapter}
                  </Badge>
                  <h3>{campaign?.title}</h3>
                  <p>{campaign?.scenes[run.sceneId]?.title}</p>
                  <span>{run.party.map((member) => member.name).join(' · ')}</span>
                </button>
              )
            })}
          </div>
        </section>

        {save.completedRuns.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeading}>
              <div>
                <span>Written in ink</span>
                <h2>Completed chronicles</h2>
              </div>
            </div>
            <div className={styles.completed}>
              {save.completedRuns.map((run) => (
                <div key={run.id}>
                  <strong>The Old Road</strong>
                  <span>First Contact completed</span>
                </div>
              ))}
            </div>
          </section>
        )}
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
