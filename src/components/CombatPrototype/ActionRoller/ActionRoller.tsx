import { Button, Text, UnstyledButton } from '@mantine/core'
import { useEffect, useState } from 'react'
import type { DiceRoll } from '../../../game/combat/types'
import styles from './ActionRoller.module.scss'

export interface ActionSequence {
  actorName: string
  attackBonus?: number
  message: string
  phase: 'ready' | 'rolling' | 'result'
  rollSides: number[]
  rolls: DiceRoll[]
  skillName: string
  targetDefense?: number
  targetName: string
}

interface ActionRollerProps {
  onBack: () => void
  onContinue: () => void
  onRoll: () => void
  sequence: ActionSequence
}

export function ActionRoller({
  onBack,
  onContinue,
  onRoll,
  sequence,
}: ActionRollerProps) {
  const primaryRoll = sequence.rolls[0]
  const primarySides = sequence.rollSides[0]
  const [rollingValue, setRollingValue] = useState(1)
  const hasDice = sequence.rollSides.length > 0
  const attackRolls = sequence.rolls.filter((roll) => roll.kind === 'attack')
  const actionSucceeded =
    attackRolls.length === 0 ||
    attackRolls.some((roll) => roll.success === true)
  const verdict = actionSucceeded ? 'Success' : 'Failure'
  const hasAttackCheck =
    sequence.attackBonus !== undefined && sequence.targetDefense !== undefined

  useEffect(() => {
    if (sequence.phase !== 'rolling' || !primarySides) {
      return
    }

    const interval = window.setInterval(() => {
      setRollingValue(
        (current) => (current * 7 + 3) % primarySides || primarySides,
      )
    }, 70)

    return () => window.clearInterval(interval)
  }, [primarySides, sequence.phase])

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={`${sequence.skillName} action roll`}
      data-cy="action-roll-overlay"
    >
      <div className={styles.actionRoller} data-phase={sequence.phase}>
        <div className={styles.rollHeading}>
          <Text size="10px" c="brand" fw={800} tt="uppercase">
            {sequence.phase === 'ready'
              ? hasDice
                ? 'Ready to roll'
                : 'Ready to invoke'
              : sequence.phase === 'rolling'
                ? hasDice
                  ? 'Rolling'
                  : 'Invoking'
                : 'Result'}
          </Text>
          <Text component="h2" fw={800} size="xl">
            {sequence.skillName}
          </Text>
          <Text size="sm" c="dimmed">
            {sequence.actorName} → {sequence.targetName}
          </Text>
          {sequence.phase !== 'result' && hasAttackCheck && (
            <div className={styles.rollPreview}>
              <span>Hit check</span>
              <strong>
                Roll d20 + {sequence.attackBonus} against Defense{' '}
                {sequence.targetDefense}
              </strong>
              <small>Meet or beat Defense to hit</small>
            </div>
          )}
        </div>

        {sequence.phase !== 'result' ? (
          <div className={styles.rollingStage}>
            <UnstyledButton
              className={styles.die}
              data-rolling={sequence.phase === 'rolling' || undefined}
              data-no-dice={!hasDice || undefined}
              data-cy="roll-trigger"
              aria-label={hasDice ? 'Roll dice' : 'Invoke action'}
              autoFocus
              disabled={sequence.phase === 'rolling'}
              onClick={onRoll}
            >
              {hasDice ? (
                <>
                  <img src="/assets/ui/d20.svg" alt="" />
                  <span>
                    {sequence.phase === 'rolling'
                      ? rollingValue
                      : `d${primarySides}`}
                  </span>
                </>
              ) : (
                <span className={styles.sigil}>◆</span>
              )}
            </UnstyledButton>
            <Text size="xs" c="dimmed">
              {sequence.phase === 'ready'
                ? hasDice
                  ? 'Tap the die to roll'
                  : 'Tap the sigil to invoke'
                : hasDice
                  ? `${sequence.rollSides.map((sides) => `d${sides}`).join(' + ')} in motion`
                  : 'Gathering power'}
            </Text>
            {sequence.phase === 'ready' && (
              <Button
                color="gray"
                size="compact-sm"
                variant="subtle"
                onClick={onBack}
              >
                Back
              </Button>
            )}
          </div>
        ) : (
          <div className={styles.resultStage} aria-live="polite">
            <div
              className={styles.die}
              data-settled
              data-success={actionSucceeded || undefined}
              data-failure={!actionSucceeded || undefined}
              data-cy="settled-die"
              aria-label={
                hasDice
                  ? `Rolled ${primaryRoll?.result} on a d${primaryRoll?.sides}`
                  : 'Action invoked'
              }
            >
              {hasDice ? (
                <>
                  <img src="/assets/ui/d20.svg" alt="" />
                  <span>{primaryRoll?.result}</span>
                </>
              ) : (
                <span className={styles.sigil}>◆</span>
              )}
            </div>
            <div
              className={styles.verdict}
              data-success={actionSucceeded || undefined}
              data-failure={!actionSucceeded || undefined}
              data-cy="action-verdict"
            >
              <span>{verdict}</span>
              <small>
                {actionSucceeded
                  ? attackRolls.length > 0
                    ? 'The action connects'
                    : 'The action takes effect'
                  : 'The action misses'}
              </small>
            </div>
            {hasDice && (
              <div className={styles.rollResults}>
                {sequence.rolls.map((roll, index) => (
                  <div
                    key={`${roll.label}-${index}`}
                    className={styles.rollResult}
                    data-success={roll.success === true || undefined}
                    data-failure={roll.success === false || undefined}
                  >
                    <span>
                      {roll.kind === 'attack'
                        ? `${roll.label} check`
                        : `${roll.label} roll`}
                    </span>
                    <strong>
                      {roll.result}
                      {roll.bonus > 0 ? ` + ${roll.bonus}` : ''}
                      {roll.bonus < 0 ? ` − ${Math.abs(roll.bonus)}` : ''}
                      {' = '}
                      {roll.total}
                    </strong>
                    {roll.target !== undefined && (
                      <small>
                        {roll.total} total vs Defense {roll.target} ·{' '}
                        {roll.success ? 'Hit' : 'Miss'}
                      </small>
                    )}
                  </div>
                ))}
              </div>
            )}
            <Text className={styles.resultMessage} size="md" fw={700}>
              {sequence.message}
            </Text>
            <Button
              className={styles.continueButton}
              color="brand"
              size="md"
              autoFocus
              onClick={onContinue}
            >
              Continue
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
