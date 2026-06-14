import { Badge, Button } from '@mantine/core'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { GameShell } from '../../components/GameShell/GameShell'
import { useGame } from '../../game/campaign/gameContext'
import {
  companionDefinitions,
  oldRoadCampaign,
} from '../../game/campaign/content'
import styles from './CampaignSetup.module.scss'

export function CampaignSetup() {
  const { createCampaign, save } = useGame()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<string[]>([])

  if (!save.character) return <Navigate to="/character/create" replace />
  if (save.activeRuns.some((run) => run.campaignId === oldRoadCampaign.id)) {
    return <Navigate to="/" replace />
  }

  function toggleCompanion(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((candidate) => candidate !== id)
        : current.length < 2
          ? [...current, id]
          : current,
    )
  }

  function begin() {
    const run = createCampaign(selected)
    window.setTimeout(() => navigate(`/campaign/${run.id}`), 0)
  }

  return (
    <GameShell title="Form an Expedition">
      <div className={styles.setup}>
        <section className={styles.campaignCard}>
          <div>
            <Badge color="brand" variant="light">
              Recommended level {oldRoadCampaign.recommendedLevel}
            </Badge>
            <span className={styles.eyebrow}>{oldRoadCampaign.subtitle}</span>
            <h1>{oldRoadCampaign.title}</h1>
            <p>{oldRoadCampaign.description}</p>
          </div>
          <div className={styles.campaignSeal}>I</div>
        </section>

        <section>
          <div className={styles.heading}>
            <span>Solo expedition</span>
            <h2>Choose two companions.</h2>
            <p>
              You control the entire party. Companion growth belongs to this
              run, while {save.character.name} carries permanent rewards home.
            </p>
          </div>
          <div className={styles.party}>
            <article className={styles.hero} data-selected>
              <img src={save.character.portrait} alt="" />
              <div>
                <strong>{save.character.name}</strong>
                <span>Your fellow · Level {save.character.level}</span>
              </div>
              <Badge color="brand">Leader</Badge>
            </article>
            {companionDefinitions.map((companion) => (
              <button
                key={companion.id}
                className={styles.companion}
                data-selected={selected.includes(companion.id) || undefined}
                onClick={() => toggleCompanion(companion.id)}
                data-cy={`companion-${companion.id}`}
              >
                <img src={companion.portrait} alt="" />
                <span>
                  <strong>{companion.name}</strong>
                  <small>{companion.title}</small>
                  <em>
                    {companion.background} · {companion.trait}
                  </em>
                </span>
                <i>{selected.includes(companion.id) ? 'Chosen' : 'Choose'}</i>
              </button>
            ))}
          </div>
        </section>

        <footer className={styles.footer}>
          <Button variant="subtle" color="gray" onClick={() => navigate('/')}>
            Back
          </Button>
          <div>
            <span>{selected.length}/2 companions</span>
            <Button
              color="brand"
              size="md"
              disabled={selected.length !== 2}
              onClick={begin}
              data-cy="begin-campaign"
            >
              Begin The Old Road
            </Button>
          </div>
        </footer>
      </div>
    </GameShell>
  )
}
