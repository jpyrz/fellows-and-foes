import { Button, Progress } from '@mantine/core'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { GameShell } from '../../components/GameShell/GameShell'
import { classDefinitions } from '../../game/campaign/classes'
import { useGame } from '../../game/campaign/gameContext'
import { deriveCombatStats, levelThresholds, statLabels } from '../../game/campaign/rules'
import { campaignSkills } from '../../game/campaign/skills'
import type { StatName } from '../../game/campaign/types'
import styles from './CharacterDetail.module.scss'

const statNames = Object.keys(statLabels) as StatName[]

export function CharacterDetail() {
  const { characterId = '' } = useParams()
  const { allocateStat, getCharacter, save, setActiveCharacter } = useGame()
  const navigate = useNavigate()
  const character = getCharacter(characterId)

  if (!character) return <Navigate to="/" replace />

  const classDefinition = classDefinitions[character.classId]
  const derived = deriveCombatStats(character.stats)
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
    <GameShell title={character.name} eyebrow="Character Sheet">
      <div className={styles.sheet}>
        <section className={styles.identity}>
          <img src={character.portrait} alt="" />
          <div>
            <span>Persistent fellow</span>
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
          <Button
            color="brand"
            variant={
              character.id === save.activeCharacterId ? 'filled' : 'light'
            }
            onClick={() => setActiveCharacter(character.id)}
          >
            {character.id === save.activeCharacterId ? 'Active' : 'Make active'}
          </Button>
        </section>

        <section className={styles.panel}>
          <div className={styles.heading}>
            <span>Main class</span>
            <h2>{classDefinition.name}</h2>
          </div>
          <p className={styles.bio}>
            {classDefinition.description} Secondary path:{' '}
            {character.secondaryClassId === 'none'
              ? 'none'
              : character.secondaryClassId}
          </p>
          <div className={styles.derived}>
            <span>{classDefinition.role}</span>
            <span>{character.armorType} armor</span>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.heading}>
            <span>Core stats</span>
            <h2>Build identity</h2>
          </div>
          <div className={styles.stats}>
            {statNames.map((stat) => (
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
          <div className={styles.derived}>
            <span>Health {derived.maxHealth}</span>
            <span>Stamina {derived.maxStamina}</span>
            <span>Defense {derived.defense}</span>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.heading}>
            <span>Spell pool</span>
            <h2>Unlocked spells</h2>
          </div>
          <div className={styles.spells}>
            {character.unlockedSkillIds.map((skillId) => {
              const skill = campaignSkills[skillId]
              if (!skill) return null
              return (
                <article key={skill.id}>
                  <img src={skill.icon} alt="" />
                  <div>
                    <strong>{skill.name}</strong>
                    <p>{skill.description}</p>
                    <small>
                      Tier {skill.tier} · {statLabels[skill.scalingStat]}{' '}
                      {skill.requiredStat} · Cost {skill.cost}
                    </small>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.heading}>
            <span>Biography</span>
            <h2>Notes</h2>
          </div>
          <p className={styles.bio}>
            {character.biography || 'No biography written yet.'}
          </p>
        </section>

        <Button variant="subtle" color="gray" onClick={() => navigate('/')}>
          Back to ledger
        </Button>
      </div>
    </GameShell>
  )
}
