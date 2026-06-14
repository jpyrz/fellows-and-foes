import { Button } from '@mantine/core'
import type { CSSProperties } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { GameShell } from '../../components/GameShell/GameShell'
import { useGame } from '../../game/campaign/gameContext'
import { getCampaignDefinition } from '../../game/campaign/content'
import styles from './CampaignMap.module.scss'

export function CampaignMap() {
  const { runId = '' } = useParams()
  const { getRun, travelTo } = useGame()
  const navigate = useNavigate()
  const run = getRun(runId)
  const campaign = run ? getCampaignDefinition(run.campaignId) : undefined

  if (!run || !campaign) return <Navigate to="/" replace />
  const activeRun = run

  function visit(sceneId: string) {
    travelTo(activeRun.id, sceneId)
    navigate(`/campaign/${activeRun.id}`)
  }

  return (
    <GameShell eyebrow={campaign.title} title="Road Map">
      <div className={styles.map}>
        <header>
          <span>Choose the next page</span>
          <h1>Gloamfen Verge</h1>
          <p>
            Optional paths may offer supplies or knowledge, but the mire waits
            ahead.
          </p>
        </header>

        <div className={styles.route}>
          <div className={styles.road} />
          {campaign.mapNodes.map((node, index) => {
            const visited =
              activeRun.visitedNodeIds.includes(node.sceneId ?? '') ||
              activeRun.sceneId === node.sceneId
            const current = activeRun.sceneId === node.sceneId
            const cacheAlreadyClaimed =
              node.id === 'reedway-cache' &&
              activeRun.flags.includes('cache-found')
            const disabled =
              node.id === 'flooded-gaol' || cacheAlreadyClaimed || current
            return (
              <button
                key={node.id}
                className={styles.node}
                style={{ '--node-index': index } as CSSProperties}
                data-optional={node.optional || undefined}
                data-visited={visited || undefined}
                disabled={disabled}
                onClick={() => node.sceneId && visit(node.sceneId)}
                data-cy={`map-node-${node.id}`}
              >
                <i>{index + 1}</i>
                <span>
                  <small>
                    {node.optional
                      ? 'Optional path'
                      : visited
                        ? 'Visited'
                        : 'Main road'}
                  </small>
                  <strong>{node.label}</strong>
                </span>
              </button>
            )
          })}
        </div>

        <footer>
          <Button
            variant="subtle"
            color="gray"
            onClick={() => navigate(`/campaign/${activeRun.id}`)}
          >
            Return to current page
          </Button>
          <div className={styles.legend}>
            <span><i data-kind="main" /> Main road</span>
            <span><i data-kind="optional" /> Optional</span>
            <span><i data-kind="visited" /> Visited</span>
          </div>
        </footer>
      </div>
    </GameShell>
  )
}
