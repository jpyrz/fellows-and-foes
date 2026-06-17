import { Button, Modal } from '@mantine/core'
import { useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { GameShell } from '../../components/GameShell/GameShell'
import { useGame } from '../../game/campaign/gameContext'
import { getCampaignDefinition } from '../../game/campaign/content'
import {
  calculateSuccessChance,
  statLabels,
} from '../../game/campaign/rules'
import type {
  ExplorationRoll,
  PartyMemberSnapshot,
  SceneActionDefinition,
} from '../../game/campaign/types'
import { ExplorationRoller } from './ExplorationRoller'
import styles from './StoryScreen.module.scss'

const STORY_ROLL_DURATION_MS = 850

export function StoryScreen() {
  const { runId = '' } = useParams()
  const { getRun, resolveSceneAction } = useGame()
  const navigate = useNavigate()
  const run = getRun(runId)
  const campaign = run ? getCampaignDefinition(run.campaignId) : undefined
  const scene = run && campaign ? campaign.scenes[run.sceneId] : undefined
  const [actorId, setActorId] = useState(run?.party[0]?.id ?? '')
  const [pendingAction, setPendingAction] =
    useState<SceneActionDefinition | null>(null)
  const [rollResult, setRollResult] = useState<
    ExplorationRoll | null | undefined
  >(undefined)
  const [rollPhase, setRollPhase] = useState<'ready' | 'rolling' | 'result'>(
    'ready',
  )
  const [outcome, setOutcome] = useState<{
    action: SceneActionDefinition
    success: boolean
  } | null>(null)
  const [journalOpen, setJournalOpen] = useState(false)
  const rollToken = useRef(0)

  if (!run || !campaign || !scene) return <Navigate to="/" replace />
  const activeRun = run
  if (run.currentEncounterId) {
    return <Navigate to={`/campaign/${run.id}/battle`} replace />
  }

  const visibleActions = scene.actions.filter((action) => {
    if (
      action.requiredFlags?.some((flag) => !activeRun.flags.includes(flag))
    ) {
      return false
    }
    if (
      action.hiddenUntilRevealed &&
      !activeRun.revealedActionIds.includes(action.id)
    ) {
      return false
    }
    return true
  })
  const currentActor =
    run.party.find((member) => member.id === actorId) ?? run.party[0]!
  const canOpenMap = Object.values(campaign.scenes).some((campaignScene) =>
    campaignScene.actions.some((action) => {
      if (!activeRun.completedActionIds.includes(action.id)) return false
      return [
        ...action.successEffects,
        ...(action.failureEffects ?? []),
      ].some((effect) => effect.type === 'open-map')
    }),
  )
  const hasUsableActions = visibleActions.some(
    (action) =>
      !activeRun.completedActionIds.includes(action.id) || action.repeatable,
  )

  function perform(action: SceneActionDefinition) {
    if (action.id === 'rest-at-shrine') {
      navigate(`/campaign/${activeRun.id}/checkpoint`)
      return
    }
    if (action.check) {
      setPendingAction(action)
      setRollResult(undefined)
      setRollPhase('ready')
      return
    }
    resolveSceneAction(activeRun.id, action, currentActor.id)
    setOutcome({ action, success: true })
  }

  function roll() {
    if (!pendingAction || rollPhase !== 'ready') return
    setRollPhase('rolling')
    const token = rollToken.current + 1
    rollToken.current = token
    const result = resolveSceneAction(activeRun.id, pendingAction, currentActor.id)
    window.setTimeout(() => {
      if (rollToken.current !== token) return
      setRollResult(result)
      setRollPhase('result')
    }, STORY_ROLL_DURATION_MS)
  }

  function routeAfter(action: SceneActionDefinition, success: boolean) {
    const effects = success
      ? action.successEffects
      : (action.failureEffects ?? [])
    if (effects.some((effect) => effect.type === 'start-encounter')) {
      navigate(`/campaign/${activeRun.id}/battle`)
    } else if (effects.some((effect) => effect.type === 'open-map')) {
      navigate(`/campaign/${activeRun.id}/map`)
    }
  }

  return (
    <GameShell
      eyebrow={campaign.title}
      title={scene.chapter}
      actions={
        <div className={styles.shellActions}>
          {canOpenMap && (
            <Button
              size="compact-sm"
              variant="subtle"
              color="brand"
              onClick={() => navigate(`/campaign/${activeRun.id}/map`)}
            >
              Map
            </Button>
          )}
          <Button
            size="compact-sm"
            variant="subtle"
            color="gray"
            onClick={() => setJournalOpen(true)}
          >
            Journal
          </Button>
        </div>
      }
    >
      <div className={styles.story}>
        <aside className={styles.partyRail}>
          <span>Choose the acting fellow</span>
          <div>
            {run.party.map((member) => (
              <button
                key={member.id}
                onClick={() => setActorId(member.id)}
                data-selected={actorId === member.id || undefined}
                aria-label={`${member.name} acts`}
              >
                <img src={member.portrait} alt="" />
                <strong>{member.name}</strong>
                <small>
                  {member.health}/{member.maxHealth} HP
                </small>
              </button>
            ))}
          </div>
        </aside>

        <article className={styles.book}>
          <div className={styles.art} data-scene={scene.id}>
            <span>{scene.location}</span>
            <p>{scene.artworkTone}</p>
          </div>
          <div className={styles.page}>
            <span className={styles.chapter}>{scene.chapter}</span>
            <h1>{scene.title}</h1>
            <div className={styles.flourish}>◆</div>
            <p className={styles.prose}>{scene.text}</p>
            {run.completedActionIds
              .filter((id) => scene.actions.some((action) => action.id === id))
              .map((id) => {
                const action = scene.actions.find(
                  (candidate) => candidate.id === id,
                )
                return action ? (
                  <p className={styles.annotation} key={id}>
                    {action.successText}
                  </p>
                ) : null
              })}
          </div>
        </article>

        <section className={styles.actions}>
          <div>
            <span>Available actions</span>
            <strong>
              {currentActor.name} leads
            </strong>
          </div>
          <div className={styles.actionList}>
            {visibleActions.map((action) => {
              const completed =
                run.completedActionIds.includes(action.id) && !action.repeatable
              const checkContext = action.check
                ? getActionCheckContext(action, currentActor, run.party)
                : null
              return (
                <button
                  key={action.id}
                  disabled={completed}
                  onClick={() => perform(action)}
                  data-cy={`scene-action-${action.id}`}
                >
                  <span>{action.category}</span>
                  <strong>{completed ? 'Completed' : action.label}</strong>
                  <p>{action.description}</p>
                  {checkContext && (
                    <div className={styles.checkHint}>
                      <small>
                        {statLabels[action.check!.stat]} DC {action.check!.dc} ·{' '}
                        {checkContext.selectedChance}% with {currentActor.name}
                      </small>
                      <em>
                        Best: {checkContext.bestActor.name}{' '}
                        {checkContext.bestActor.id === currentActor.id
                          ? '(selected)'
                          : `(${checkContext.bestChance}%)`}
                      </em>
                      <span>{getRetryLabel(action.retryPolicy)}</span>
                    </div>
                  )}
                </button>
              )
            })}
            {!hasUsableActions && (
              <div className={styles.noActions}>
                <strong>This page is resolved.</strong>
                <span>
                  Open the map to choose the next leg of the road, or read the
                  journal before moving on.
                </span>
                <Button
                  color="brand"
                  disabled={!canOpenMap}
                  onClick={() => navigate(`/campaign/${activeRun.id}/map`)}
                >
                  Open map
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>

      {pendingAction && (
        <ExplorationRoller
          action={pendingAction}
          actor={currentActor}
          phase={rollPhase}
          result={rollResult}
          onBack={() => {
            rollToken.current += 1
            setPendingAction(null)
            setRollPhase('ready')
          }}
          onRoll={roll}
          onContinue={() => {
            const action = pendingAction
            const success = rollResult?.success ?? false
            rollToken.current += 1
            setPendingAction(null)
            setRollResult(undefined)
            setRollPhase('ready')
            routeAfter(action, success)
          }}
        />
      )}

      <Modal
        opened={Boolean(outcome)}
        onClose={() => setOutcome(null)}
        centered
        title={outcome?.success ? 'The road changes' : 'A setback'}
        styles={{
          content: { background: 'var(--ff-bg-panel)' },
          header: { background: 'var(--ff-bg-panel)' },
        }}
      >
        <p>
          {outcome?.success
            ? outcome.action.successText
            : outcome?.action.failureText}
        </p>
        <Button
          fullWidth
          color="brand"
          onClick={() => {
            if (outcome) routeAfter(outcome.action, outcome.success)
            setOutcome(null)
          }}
        >
          Continue
        </Button>
      </Modal>

      <Modal
        opened={journalOpen}
        onClose={() => setJournalOpen(false)}
        title="Campaign journal"
        size="lg"
        styles={{
          content: { background: 'var(--ff-bg-panel)' },
          header: { background: 'var(--ff-bg-panel)' },
        }}
      >
        <div className={styles.journal}>
          {run.journal.length === 0 && <p>No pages recorded yet.</p>}
          {run.journal.map((page) => (
            <article key={page.id}>
              <h3>{page.title}</h3>
              <p>{page.text}</p>
            </article>
          ))}
        </div>
      </Modal>
    </GameShell>
  )
}

function getActionCheckContext(
  action: SceneActionDefinition,
  selectedActor: PartyMemberSnapshot,
  party: PartyMemberSnapshot[],
) {
  const check = action.check!
  const selectedBonus = getCheckBonus(action, selectedActor)
  const bestActor = party
    .map((member) => ({
      member,
      bonus: getCheckBonus(action, member),
    }))
    .toSorted((a, b) => b.bonus - a.bonus)[0].member

  return {
    bestActor,
    bestChance: calculateSuccessChance(
      getCheckBonus(action, bestActor),
      check.dc,
    ),
    selectedChance: calculateSuccessChance(selectedBonus, check.dc),
  }
}

function getCheckBonus(
  action: SceneActionDefinition,
  actor: PartyMemberSnapshot,
) {
  const check = action.check!
  const identityBonus =
    check.matchingBackgrounds?.includes(actor.background) ||
    check.matchingTraits?.includes(actor.trait)
      ? 2
      : 0
  return actor.stats[check.stat] + identityBonus
}

function getRetryLabel(retryPolicy: SceneActionDefinition['retryPolicy']) {
  if (retryPolicy === 'closed') return 'Failure closes this lead'
  if (retryPolicy === 'another-hero') return 'Another fellow may try'
  if (retryPolicy === 'after-advantage') return 'Retry after finding leverage'
  if (retryPolicy === 'changed') return 'Failure changes the path'
  return 'Story outcome'
}
