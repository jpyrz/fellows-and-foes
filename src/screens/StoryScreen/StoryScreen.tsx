import { Button, Modal } from '@mantine/core'
import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { GameShell } from '../../components/GameShell/GameShell'
import { useGame } from '../../game/campaign/gameContext'
import { getCampaignDefinition } from '../../game/campaign/content'
import type {
  ExplorationRoll,
  SceneActionDefinition,
} from '../../game/campaign/types'
import { ExplorationRoller } from './ExplorationRoller'
import styles from './StoryScreen.module.scss'

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
  const [outcome, setOutcome] = useState<{
    action: SceneActionDefinition
    success: boolean
  } | null>(null)
  const [journalOpen, setJournalOpen] = useState(false)

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

  function perform(action: SceneActionDefinition) {
    if (action.id === 'rest-at-shrine') {
      navigate(`/campaign/${activeRun.id}/checkpoint`)
      return
    }
    if (action.check) {
      setPendingAction(action)
      setRollResult(undefined)
      return
    }
    resolveSceneAction(activeRun.id, action, actorId)
    setOutcome({ action, success: true })
  }

  function roll() {
    if (!pendingAction) return
    setRollResult(resolveSceneAction(activeRun.id, pendingAction, actorId))
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
        <Button
          size="compact-sm"
          variant="subtle"
          color="gray"
          onClick={() => setJournalOpen(true)}
        >
          Journal
        </Button>
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
          <div className={styles.art}>
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
              {run.party.find((member) => member.id === actorId)?.name} leads
            </strong>
          </div>
          <div className={styles.actionList}>
            {visibleActions.map((action) => {
              const completed =
                run.completedActionIds.includes(action.id) && !action.repeatable
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
                  {action.check && (
                    <small>
                      {action.check.stat} check · DC {action.check.dc}
                    </small>
                  )}
                </button>
              )
            })}
          </div>
        </section>
      </div>

      {pendingAction && (
        <ExplorationRoller
          action={pendingAction}
          actor={run.party.find((member) => member.id === actorId)!}
          result={rollResult}
          onBack={() => setPendingAction(null)}
          onRoll={roll}
          onContinue={() => {
            const action = pendingAction
            const success = rollResult?.success ?? false
            setPendingAction(null)
            setRollResult(undefined)
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
