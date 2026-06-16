import { Badge, Button, Progress } from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import { GameShell } from '../../components/GameShell/GameShell'
import { useGame } from '../../game/campaign/gameContext'
import { getCampaignDefinition } from '../../game/campaign/content'
import {
  levelThresholds,
  statLabels,
} from '../../game/campaign/rules'
import type { StatName } from '../../game/campaign/types'
import styles from './Dashboard.module.scss'

export function Dashboard() {
  const { allocateStat, save, setActiveCharacter } = useGame()
  const navigate = useNavigate()
  const character = save.character

  if (!character) {
    return (
      <GameShell title="A Company Unwritten">
        <section className={styles.emptyHero}>
          <span className={styles.kicker}>Begin your chronicle</span>
          <h1>Every road needs its first fellow.</h1>
          <p>
            Create a persistent hero, choose the skills that define them, and
            carry their history from campaign to campaign.
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

  return (
    <GameShell title="Company Ledger">
      <div className={styles.dashboard}>
        <section className={styles.heroCard}>
          <img src={character.portrait} alt="" />
          <div className={styles.heroIdentity}>
            <span>Your persistent fellow</span>
            <h1>{character.name}</h1>
            <p>
              Level {character.level} · {character.background} ·{' '}
              {character.trait}
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
                      {fellow.background} · {fellow.trait}
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
              <span>Continue the journey</span>
              <h2>Active adventures</h2>
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
                <strong>The road is waiting.</strong>
                <span>Begin The Old Road when your party is ready.</span>
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
    </GameShell>
  )
}
