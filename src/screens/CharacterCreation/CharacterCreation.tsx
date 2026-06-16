import {
  Button,
  Select,
  Stepper,
  Textarea,
  TextInput,
} from '@mantine/core'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GameShell } from '../../components/GameShell/GameShell'
import { useGame } from '../../game/campaign/gameContext'
import { portraitOptions } from '../../game/campaign/content'
import {
  campaignSkills,
  starterSkillIds,
} from '../../game/campaign/skills'
import { deriveCombatStats, statLabels } from '../../game/campaign/rules'
import type {
  Background,
  CharacterStats,
  PersonalityTrait,
  StatName,
} from '../../game/campaign/types'
import styles from './CharacterCreation.module.scss'

const backgrounds: Background[] = [
  'soldier',
  'scholar',
  'wayfarer',
  'scoundrel',
]
const traits: PersonalityTrait[] = [
  'bold',
  'cautious',
  'compassionate',
  'curious',
]
const statNames = Object.keys(statLabels) as StatName[]

export function CharacterCreation() {
  const { createCharacter } = useGame()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [portrait, setPortrait] = useState(portraitOptions[0])
  const [biography, setBiography] = useState('')
  const [background, setBackground] = useState<Background>('wayfarer')
  const [trait, setTrait] = useState<PersonalityTrait>('curious')
  const [stats, setStats] = useState<CharacterStats>({
    might: 3,
    finesse: 2,
    mind: 1,
    spirit: 1,
  })
  const [skillIds, setSkillIds] = useState<string[]>([])

  const statsValid =
    Object.values(stats)
      .toSorted()
      .join(',') === '1,1,2,3'
  const eligibleSkills = starterSkillIds.filter((id) => {
    const skill = campaignSkills[id]
    return stats[skill.scalingStat] >= skill.requiredStat
  })
  const derived = deriveCombatStats(stats)

  function setStat(stat: StatName, value: string | null) {
    setStats((current) => ({
      ...current,
      [stat]: Number(value ?? current[stat]),
    }))
    setSkillIds([])
  }

  function toggleSkill(skillId: string) {
    setSkillIds((current) =>
      current.includes(skillId)
        ? current.filter((id) => id !== skillId)
        : current.length < 3
          ? [...current, skillId]
          : current,
    )
  }

  function finish() {
    createCharacter({
      name: name.trim(),
      portrait,
      biography: biography.trim(),
      background,
      trait,
      stats,
      unlockedSkillIds: skillIds,
    })
    navigate('/')
  }

  return (
    <GameShell title="Create Your Fellow">
      <div className={styles.creation}>
        <Stepper active={step} color="brand" size="sm">
          <Stepper.Step label="Identity" />
          <Stepper.Step label="Origin" />
          <Stepper.Step label="Stats" />
          <Stepper.Step label="Skills" />
          <Stepper.Step label="Review" />
        </Stepper>

        <section className={styles.panel} data-cy={`creation-step-${step}`}>
          {step === 0 && (
            <>
              <div className={styles.heading}>
                <span>Page one</span>
                <h1>Who walks the road?</h1>
                <p>Cosmetic details can be changed later.</p>
              </div>
              <TextInput
                label="Name"
                placeholder="Name your fellow"
                value={name}
                onChange={(event) => setName(event.currentTarget.value)}
                maxLength={32}
                data-cy="character-name"
              />
              <div className={styles.portraits}>
                {portraitOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => setPortrait(option)}
                    data-selected={portrait === option || undefined}
                    aria-label="Choose portrait"
                  >
                    <img src={option} alt="" />
                  </button>
                ))}
              </div>
              <Textarea
                label="Short biography"
                description={`${biography.length}/280 · Optional`}
                value={biography}
                onChange={(event) => setBiography(event.currentTarget.value)}
                maxLength={280}
                minRows={4}
              />
            </>
          )}

          {step === 1 && (
            <>
              <div className={styles.heading}>
                <span>Origin and instinct</span>
                <h1>What shaped them?</h1>
                <p>
                  These tags grant a +2 bonus or unlock special choices when
                  they fit an authored situation.
                </p>
              </div>
              <ChoiceGrid
                label="Background"
                options={backgrounds}
                selected={background}
                onSelect={(value) => setBackground(value as Background)}
              />
              <ChoiceGrid
                label="Personality"
                options={traits}
                selected={trait}
                onSelect={(value) => setTrait(value as PersonalityTrait)}
              />
            </>
          )}

          {step === 2 && (
            <>
              <div className={styles.heading}>
                <span>Natural strengths</span>
                <h1>Assign 3, 2, 1, 1.</h1>
                <p>
                  Stats are permanent and affect both exploration and combat.
                </p>
              </div>
              <div className={styles.statGrid}>
                {statNames.map((stat) => (
                  <div key={stat}>
                    <Select
                      label={statLabels[stat]}
                      value={String(stats[stat])}
                      data={[
                        { value: '1', label: '1' },
                        { value: '2', label: '2' },
                        { value: '3', label: '3' },
                      ]}
                      onChange={(value) => setStat(stat, value)}
                    />
                    <small>
                      {stat === 'might'
                        ? 'Health and martial force'
                        : stat === 'finesse'
                          ? 'Defense, initiative, precision'
                          : stat === 'mind'
                            ? 'Knowledge and arcane power'
                            : 'Resolve, support, stamina'}
                    </small>
                  </div>
                ))}
              </div>
              {!statsValid && (
                <p className={styles.warning}>Use each value exactly once: 3, 2, 1, 1.</p>
              )}
              <div className={styles.derived}>
                <span>Health <strong>{derived.maxHealth}</strong></span>
                <span>Stamina <strong>{derived.maxStamina}</strong></span>
                <span>Defense <strong>{derived.defense}</strong></span>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className={styles.heading}>
                <span>First techniques</span>
                <h1>Choose three skills.</h1>
                <p>Your stats determine which classless skills you can wield.</p>
              </div>
              <div className={styles.skillGrid}>
                {starterSkillIds.map((skillId) => {
                  const skill = campaignSkills[skillId]
                  const eligible = eligibleSkills.includes(skillId)
                  const selected = skillIds.includes(skillId)
                  return (
                    <button
                      key={skillId}
                      disabled={!eligible}
                      data-selected={selected || undefined}
                      onClick={() => toggleSkill(skillId)}
                      data-cy={`starter-skill-${skillId}`}
                    >
                      <img src={skill.icon} alt="" />
                      <span>
                        <strong>{skill.name}</strong>
                        <small>{skill.description}</small>
                        <em>
                          {statLabels[skill.scalingStat]} {skill.requiredStat} ·
                          Cost {skill.cost}
                        </em>
                      </span>
                    </button>
                  )
                })}
              </div>
              <p className={styles.selectionCount}>{skillIds.length}/3 selected</p>
            </>
          )}

          {step === 4 && (
            <div className={styles.review}>
              <img src={portrait} alt="" />
              <div>
                <span>Ready for the road</span>
                <h1>{name}</h1>
                <p className={styles.capitalize}>
                  {background} · {trait}
                </p>
                <p>{biography || 'No biography written yet.'}</p>
              </div>
              <div className={styles.reviewStats}>
                {statNames.map((stat) => (
                  <span key={stat}>
                    {statLabels[stat]} <strong>{stats[stat]}</strong>
                  </span>
                ))}
              </div>
              <div className={styles.reviewSkills}>
                {skillIds.map((id) => (
                  <span key={id}>{campaignSkills[id].name}</span>
                ))}
              </div>
            </div>
          )}

          <footer className={styles.footer}>
            <Button
              variant="subtle"
              color="gray"
              onClick={() => (step === 0 ? navigate('/') : setStep(step - 1))}
            >
              Back
            </Button>
            {step < 4 ? (
              <Button
                color="brand"
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 0 && !name.trim()) ||
                  (step === 2 && !statsValid) ||
                  (step === 3 && skillIds.length !== 3)
                }
                data-cy="creation-next"
              >
                Continue
              </Button>
            ) : (
              <Button color="brand" onClick={finish} data-cy="finish-character">
                Begin chronicle
              </Button>
            )}
          </footer>
        </section>
      </div>
    </GameShell>
  )
}

function ChoiceGrid({
  label,
  onSelect,
  options,
  selected,
}: {
  label: string
  onSelect(value: string): void
  options: string[]
  selected: string
}) {
  return (
    <div>
      <strong className={styles.choiceLabel}>{label}</strong>
      <div className={styles.choiceGrid}>
        {options.map((option) => (
          <button
            key={option}
            data-selected={selected === option || undefined}
            onClick={() => onSelect(option)}
          >
            <strong>{option}</strong>
            <span>
              {option === 'soldier'
                ? 'Discipline, force, and battlefield knowledge.'
                : option === 'scholar'
                  ? 'Lore, runes, and careful study.'
                  : option === 'wayfarer'
                    ? 'Roadcraft, creatures, and forgotten paths.'
                    : option === 'scoundrel'
                      ? 'Locks, deception, and quick hands.'
                      : option === 'bold'
                        ? 'Acts decisively when danger closes in.'
                        : option === 'cautious'
                          ? 'Notices risks before stepping forward.'
                          : option === 'compassionate'
                            ? 'Reaches people others leave behind.'
                            : 'Cannot leave a mystery untouched.'}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
