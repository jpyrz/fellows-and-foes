import { Button, Select } from '@mantine/core'
import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { GameShell } from '../../components/GameShell/GameShell'
import { useGame } from '../../game/campaign/gameContext'
import {
  campaignSkills,
  checkpointSkillChoices,
} from '../../game/campaign/skills'
import { itemDefinitions } from '../../game/combat/items'
import styles from './Checkpoint.module.scss'

const itemChoices = ['healing-draught', 'ember-flask', 'guard-tonic']

export function Checkpoint() {
  const { runId = '' } = useParams()
  const { completeCheckpoint, getRun } = useGame()
  const navigate = useNavigate()
  const run = getRun(runId)
  const [skillsByMemberId, setSkillsByMemberId] = useState<
    Record<string, string>
  >({})
  const [itemId, setItemId] = useState(itemChoices[0])
  const [itemRecipientId, setItemRecipientId] = useState(
    run?.party[0]?.id ?? '',
  )

  if (!run) return <Navigate to="/" replace />
  const activeRun = run

  const ready =
    activeRun.party.every((member) => skillsByMemberId[member.id]) &&
    Boolean(itemRecipientId)

  function claim() {
    completeCheckpoint(activeRun.id, {
      skillsByMemberId,
      itemId,
      itemRecipientId,
    })
    navigate(`/campaign/${activeRun.id}/ending`)
  }

  return (
    <GameShell eyebrow="The Old Road" title="Wayfarer Shrine">
      <div className={styles.checkpoint}>
        <header>
          <span>Checkpoint reached · +40 XP</span>
          <h1>The fire remembers you.</h1>
          <p>
            The party is fully restored. Choose one technique for each fellow
            and assign a supply from the shrine.
          </p>
        </header>

        <section className={styles.rewards}>
          {activeRun.party.map((member) => (
            <article key={member.id}>
              <div className={styles.member}>
                <img src={member.portrait} alt="" />
                <span>
                  <strong>{member.name}</strong>
                  <small>
                    {member.owner === 'player'
                      ? 'Permanent unlock'
                      : 'This campaign only'}
                  </small>
                </span>
              </div>
              <div className={styles.skills}>
                {checkpointSkillChoices.map((skillId) => {
                  const skill = campaignSkills[skillId]
                  return (
                    <button
                      key={skillId}
                      data-cy={`checkpoint-skill-${member.id}-${skillId}`}
                      data-selected={
                        skillsByMemberId[member.id] === skillId || undefined
                      }
                      onClick={() =>
                        setSkillsByMemberId((current) => ({
                          ...current,
                          [member.id]: skillId,
                        }))
                      }
                    >
                      <img src={skill.icon} alt="" />
                      <span>
                        <strong>{skill.name}</strong>
                        <small>{skill.description}</small>
                        <em>Tier {skill.tier} · Cost {skill.cost}</em>
                      </span>
                    </button>
                  )
                })}
              </div>
            </article>
          ))}
        </section>

        <section className={styles.supply}>
          <div>
            <span>Camp supply</span>
            <h2>One item remains.</h2>
          </div>
          <Select
            label="Choose item"
            value={itemId}
            onChange={(value) => setItemId(value ?? itemChoices[0])}
            data={itemChoices.map((id) => ({
              value: id,
              label: itemDefinitions[id as keyof typeof itemDefinitions].name,
            }))}
          />
          <Select
            label="Give to"
            value={itemRecipientId}
            onChange={(value) =>
              setItemRecipientId(value ?? activeRun.party[0].id)
            }
            data={activeRun.party.map((member) => ({
              value: member.id,
              label: member.name,
            }))}
          />
        </section>

        <footer>
          <div>
            <strong>Checkpoint autosave</strong>
            <span>
              Defeat after this point returns the party here with these rewards.
            </span>
          </div>
          <Button
            color="brand"
            size="lg"
            disabled={!ready}
            onClick={claim}
            data-cy="claim-checkpoint"
          >
            Claim rewards
          </Button>
        </footer>
      </div>
    </GameShell>
  )
}
