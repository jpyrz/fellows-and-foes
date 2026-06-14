import { Button } from '@mantine/core'
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
  result,
}: ExplorationRollerProps) {
  const check = action.check!
  const identityMatch =
    check.matchingBackgrounds?.includes(actor.background) ||
    check.matchingTraits?.includes(actor.trait)
  const identityBonus = identityMatch ? 2 : 0
  const totalBonus = actor.stats[check.stat] + identityBonus
  const chance = calculateSuccessChance(totalBonus, check.dc)

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      data-cy="exploration-roll"
    >
      <div className={styles.content}>
        <span className={styles.eyebrow}>
          {result === undefined ? 'Action check' : 'Result'}
        </span>
        <h2>{action.label}</h2>
        <p className={styles.actor}>
          {actor.name} · {statLabels[check.stat]}
        </p>

        {result === undefined ? (
          <>
            <button
              className={styles.die}
              onClick={onRoll}
              aria-label="Roll exploration check"
              data-cy="exploration-roll-trigger"
            >
              <img src="/assets/ui/d20.svg" alt="" />
              <strong>d20</strong>
            </button>
            <div className={styles.formula}>
              <span>Roll formula</span>
              <strong>
                d20 + {actor.stats[check.stat]} {statLabels[check.stat]}
                {identityBonus > 0 ? ' + 2 identity' : ''}
              </strong>
              <small>
                DC {check.dc} · {chance}% chance
              </small>
            </div>
            <p className={styles.stakes}>{check.stakes}</p>
            <Button variant="subtle" color="gray" onClick={onBack}>
              Back
            </Button>
          </>
        ) : (
          <>
            <div
              className={styles.settled}
              data-success={result?.success || undefined}
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
