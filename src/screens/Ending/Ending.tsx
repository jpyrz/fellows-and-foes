import { Button } from '@mantine/core'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { GameShell } from '../../components/GameShell/GameShell'
import { useGame } from '../../game/campaign/gameContext'
import styles from './Ending.module.scss'

export function Ending() {
  const { runId = '' } = useParams()
  const { completeCampaign, getRun, save } = useGame()
  const navigate = useNavigate()
  const run = getRun(runId)

  if (!run) return <Navigate to="/" replace />
  const activeRun = run

  function finish() {
    completeCampaign(activeRun.id)
    navigate('/')
  }

  return (
    <GameShell eyebrow="The Old Road" title="First Contact">
      <article className={styles.ending}>
        <span>Chronicle complete</span>
        <h1>A Road Reopened</h1>
        <div className={styles.flourish}>◆</div>
        <p>
          At dawn, the surviving travelers follow the shrine lamp home. The
          Old Road remains, but it no longer feels abandoned. Something farther
          along it now knows your names.
        </p>
        <div className={styles.party}>
          {activeRun.party.map((member) => (
            <div key={member.id}>
              <img src={member.portrait} alt="" />
              <strong>{member.name}</strong>
            </div>
          ))}
        </div>
        <section className={styles.progress}>
          <span>Persistent progress</span>
          <strong>
            {save.character?.name} · Level {save.character?.level} ·{' '}
            {save.character?.xp} XP
          </strong>
          <small>
            Boss and checkpoint rewards have been added to this fellow forever.
          </small>
        </section>
        <Button
          color="brand"
          size="lg"
          onClick={finish}
          data-cy="complete-campaign"
        >
          Close the chronicle
        </Button>
      </article>
    </GameShell>
  )
}
