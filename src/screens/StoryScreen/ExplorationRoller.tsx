import { Button } from '@mantine/core'
import { useEffect, useState } from 'react'
import type {
  ExplorationRoll,
  PartyMemberSnapshot,
  SceneActionDefinition,
} from '../../game/campaign/types'
import { calculateSuccessChance, statLabels } from '../../game/campaign/rules'
import styles from './ExplorationRoller.module.scss'

interface ExplorationRollerProps {
  action: SceneActionDefinition
  actor: PartyMemberSnapshot
  phase: 'ready' | 'rolling' | 'result'
  result: ExplorationRoll | null | undefined
  onBack(): void
  onContinue(): void
  onRoll(): void
}

export function ExplorationRoller({
  action,
  actor,
  onBack,
  onContinue,
  onRoll,
  phase,
  result,
}: ExplorationRollerProps) {
  const check = action.check!
  const identityMatch =
    check.matchingBackgrounds?.includes(actor.background) ||
    check.matchingTraits?.includes(actor.trait)
  const identityBonus = identityMatch ? 2 : 0
  const totalBonus = actor.stats[check.stat] + identityBonus
  const chance = calculateSuccessChance(totalBonus, check.dc)
  const rollLabel = identityBonus > 0
    ? `${actor.stats[check.stat]} ${statLabels[check.stat]} + 2 identity`
    : `${actor.stats[check.stat]} ${statLabels[check.stat]}`
  const [rollingValue, setRollingValue] = useState(1)

  useEffect(() => {
    if (phase !== 'rolling') return

    const interval = window.setInterval(() => {
      setRollingValue((current) => (current * 7 + 3) % 20 || 20)
    }, 70)

    return () => window.clearInterval(interval)
  }, [phase])

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      data-cy="exploration-roll"
    >
      <div className={styles.content} data-phase={phase}>
        <div className={styles.heading}>
          <span className={styles.eyebrow}>
            {phase === 'ready'
              ? 'Ready to roll'
              : phase === 'rolling'
                ? 'Rolling'
                : 'Result'}
          </span>
          <h2>{action.label}</h2>
          <p className={styles.actor}>
            <img src={actor.portrait} alt="" />
            <span>
              <strong>{actor.name}</strong>
              <small>{statLabels[check.stat]} check</small>
            </span>
          </p>
        </div>

        {phase !== 'result' ? (
          <>
            <button
              className={styles.die}
              onClick={onRoll}
              aria-label="Roll exploration check"
              data-rolling={phase === 'rolling' || undefined}
              data-cy="exploration-roll-trigger"
              disabled={phase === 'rolling'}
            >
              <img src="/assets/ui/d20.svg" alt="" />
              <strong>{phase === 'rolling' ? rollingValue : 'd20'}</strong>
            </button>
            <p className={styles.rollInstruction}>
              {phase === 'ready' ? 'Tap the die to roll' : 'd20 in motion'}
            </p>
            <div className={styles.formula}>
              <span>Check preview</span>
              <strong>
                Roll d20 + {rollLabel} against DC {check.dc}
              </strong>
              <small>
                {chance}% chance · {identityBonus > 0
                  ? 'Background or trait applies'
                  : 'No identity bonus'}
              </small>
            </div>
            <p className={styles.stakes}>{check.stakes}</p>
            {phase === 'ready' && (
              <Button variant="subtle" color="gray" onClick={onBack}>
                Back
              </Button>
            )}
          </>
        ) : (
          <>
            <div
              className={styles.settled}
              data-success={result?.success || undefined}
              data-failure={!result?.success || undefined}
            >
              <img src="/assets/ui/d20.svg" alt="" />
              <strong>{result?.die}</strong>
            </div>
            <div
              className={styles.verdict}
              data-success={result?.success || undefined}
            >
              <strong>{result?.success ? 'SUCCESS' : 'FAILURE'}</strong>
              <span>
                {result?.die} + {result?.statBonus}
                {result?.identityBonus ? ` + ${result.identityBonus}` : ''} ={' '}
                {result?.total} vs DC {result?.dc}
              </span>
            </div>
            <p className={styles.outcome}>
              {result?.success ? action.successText : action.failureText}
            </p>
            <Button color="brand" size="md" onClick={onContinue}>
              Continue
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
