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
import { SpellPreview } from '../../components/SpellPreview/SpellPreview'
import { characterClassIds, classDefinitions } from '../../game/campaign/classes'
import { useGame } from '../../game/campaign/gameContext'
import { portraitOptions } from '../../game/campaign/content'
import { campaignSkills } from '../../game/campaign/skills'
import { deriveCombatStats, statLabels } from '../../game/campaign/rules'
import type {
  Background,
  CharacterClassId,
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
const stepLabels = ['Identity', 'Origin', 'Stats', 'Skills', 'Review']

export function CharacterCreation() {
  const { createCharacter } = useGame()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [portrait, setPortrait] = useState(portraitOptions[0])
  const [biography, setBiography] = useState('')
  const [classId, setClassId] = useState<CharacterClassId>('vanguard')
  const [background, setBackground] = useState<Background>('wayfarer')
  const [trait, setTrait] = useState<PersonalityTrait>('curious')
  const [stats, setStats] = useState<CharacterStats>({
    might: 3,
    finesse: 2,
    mind: 1,
    spirit: 1,
  })
  const [skillIds, setSkillIds] = useState<string[]>([])
  const [previewSkillId, setPreviewSkillId] = useState<string | null>(null)

  const statsValid =
    Object.values(stats)
      .toSorted()
      .join(',') === '1,1,2,3'
  const classDefinition = classDefinitions[classId]
  const starterSkillIds = classDefinition.starterSkillIds
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

  function chooseClass(value: CharacterClassId) {
    setClassId(value)
    setSkillIds([])
  }

  function toggleSkill(skillId: string) {
    const skill = campaignSkills[skillId]
    if (stats[skill.scalingStat] < skill.requiredStat) return
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
      classId,
      armorType: classDefinition.armorType,
      secondaryClassId: 'none',
      stats,
      unlockedSkillIds: skillIds,
    })
    navigate('/')
  }

  return (
    <GameShell title="Create Your Fellow">
      <div className={styles.creation}>
        <Stepper
          active={step}
          className={styles.desktopStepper}
          color="brand"
          size="sm"
        >
          <Stepper.Step label="Identity" />
          <Stepper.Step label="Origin" />
          <Stepper.Step label="Stats" />
          <Stepper.Step label="Skills" />
          <Stepper.Step label="Review" />
        </Stepper>
        <div className={styles.mobileStepper} aria-label="Creation progress">
          <span>
            Step {step + 1} of {stepLabels.length}
          </span>
          <strong>{stepLabels[step]}</strong>
          <div>
            {stepLabels.map((label, index) => (
              <button
                key={label}
                aria-label={`Go to ${label}`}
                data-active={index === step || undefined}
                data-complete={index < step || undefined}
                onClick={() => setStep(index)}
              />
            ))}
          </div>
        </div>

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
                <span>Class, origin, and instinct</span>
                <h1>What shaped them?</h1>
                <p>
                  Class sets armor and starter spell pools. Background and
                  trait still grant a +2 bonus when they fit authored checks.
                </p>
              </div>
              <div>
                <strong className={styles.choiceLabel}>Class</strong>
                <div className={styles.classGrid}>
                  {characterClassIds.map((option) => {
                    const definition = classDefinitions[option]
                    return (
                      <button
                        key={option}
                        onClick={() => chooseClass(option)}
                        data-selected={classId === option || undefined}
                      >
                        <strong>{definition.name}</strong>
                        <span>{definition.role}</span>
                        <small>
                          {definition.armorType} armor ·{' '}
                          {definition.primaryStats
                            .map((stat) => statLabels[stat])
                            .join(' / ')}
                        </small>
                      </button>
                    )
                  })}
                </div>
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
                  This alpha uses four compressed stats; the full rules pass
                  should move closer to D&D-style ability scores.
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
                <p>
                  Your {classDefinition.name} pool determines your starting
                  options. Achievements will unlock rarer class spells later.
                </p>
              </div>
              <div className={styles.skillGrid}>
                {starterSkillIds.map((skillId) => {
                  const skill = campaignSkills[skillId]
                  const eligible = eligibleSkills.includes(skillId)
                  const selected = skillIds.includes(skillId)
                  return (
                    <button
                      key={skillId}
                      data-disabled={!eligible || undefined}
                      data-selected={selected || undefined}
                      onClick={() => setPreviewSkillId(skillId)}
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
                  {classDefinition.name} · {background} · {trait}
                </p>
                <p>
                  {classDefinition.armorType} armor · Secondary path: none
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
        {previewSkillId && (
          <SpellPreview
            contextLabel={`${classDefinition.name} starter pool`}
            isSelected={skillIds.includes(previewSkillId)}
            selectionHint={getStarterSkillPreviewHint({
              className: classDefinition.name,
              isEligible: eligibleSkills.includes(previewSkillId),
              isSelected: skillIds.includes(previewSkillId),
              selectedCount: skillIds.length,
              skillId: previewSkillId,
              stats,
            })}
            skill={campaignSkills[previewSkillId]}
            toggleDisabled={
              !skillIds.includes(previewSkillId) &&
              (!eligibleSkills.includes(previewSkillId) || skillIds.length >= 3)
            }
            disabledActionLabel={
              eligibleSkills.includes(previewSkillId)
                ? '3 skills selected'
                : 'Stat requirement not met'
            }
            onClose={() => setPreviewSkillId(null)}
            onToggle={() => {
              toggleSkill(previewSkillId)
              setPreviewSkillId(null)
            }}
          />
        )}
      </div>
    </GameShell>
  )
}

function getStarterSkillPreviewHint({
  className,
  isEligible,
  isSelected,
  selectedCount,
  skillId,
  stats,
}: {
  className: string
  isEligible: boolean
  isSelected: boolean
  selectedCount: number
  skillId: string
  stats: CharacterStats
}) {
  const skill = campaignSkills[skillId]
  if (isSelected) return 'Currently chosen as one of your starting skills.'
  if (!isEligible) {
    return `${className}s need ${statLabels[skill.scalingStat]} ${skill.requiredStat} to choose this. Current ${statLabels[skill.scalingStat]}: ${stats[skill.scalingStat]}.`
  }
  if (selectedCount >= 3) return 'Remove a selected skill before choosing this one.'
  return `Choose this as one of your ${className} starting skills.`
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
