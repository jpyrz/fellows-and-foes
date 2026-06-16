import { Button } from '@mantine/core'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { GameShell } from '../../components/GameShell/GameShell'
import { useGame } from '../../game/campaign/gameContext'
import { itemDefinitions } from '../../game/combat/items'
import { campaignSkills } from '../../game/campaign/skills'
import { statLabels } from '../../game/campaign/rules'
import type { StatName } from '../../game/campaign/types'
import styles from './PartyView.module.scss'

const statNames = Object.keys(statLabels) as StatName[]

export function PartyView() {
  const { runId = '' } = useParams()
  const { abandonCampaign, getRun } = useGame()
  const navigate = useNavigate()
  const run = getRun(runId)

  if (!run) return <Navigate to="/" replace />
  const activeRun = run

  function abandon() {
    const confirmed = window.confirm(
      'Abandon this campaign? The run will be removed, but persistent character XP and unlocked spells already earned will remain.',
    )
    if (!confirmed) return
    abandonCampaign(activeRun.id)
    navigate('/')
  }

  return (
    <GameShell eyebrow="Campaign Party" title={activeRun.chapter}>
      <div className={styles.partyView}>
        <header>
          <span>The company in the field</span>
          <h1>Party view</h1>
          <p>
            Inspect current campaign health, loadouts, items, and future gear
            slots without advancing the scene.
          </p>
        </header>

        <section className={styles.grid}>
          {activeRun.party.map((member) => (
            <article key={member.id} className={styles.card}>
              <div className={styles.identity}>
                <img src={member.portrait} alt="" />
                <div>
                  <span>
                    {member.owner === 'player'
                      ? 'Persistent fellow'
                      : 'Run companion'}
                  </span>
                  <h2>{member.name}</h2>
                  <p>{member.title}</p>
                </div>
              </div>

              <div className={styles.bars}>
                <span>
                  Health <strong>{member.health}/{member.maxHealth}</strong>
                </span>
                <span>
                  Stamina <strong>{member.stamina}/{member.maxStamina}</strong>
                </span>
                <span>
                  Defense <strong>{member.defense}</strong>
                </span>
              </div>

              <div className={styles.stats}>
                {statNames.map((stat) => (
                  <span key={stat}>
                    {statLabels[stat]} <strong>{member.stats[stat]}</strong>
                  </span>
                ))}
              </div>

              <section className={styles.subsection}>
                <h3>Spells</h3>
                <div className={styles.spells}>
                  {member.equippedSkillIds.map((skillId) => {
                    const skill = campaignSkills[skillId]
                    if (!skill) return null
                    return (
                      <div key={skill.id}>
                        <img src={skill.icon} alt="" />
                        <span>
                          <strong>{skill.name}</strong>
                          <small>Cost {skill.cost}</small>
                        </span>
                      </div>
                    )
                  })}
                </div>
              </section>

              <section className={styles.subsection}>
                <h3>Items</h3>
                <div className={styles.items}>
                  {member.inventory.length === 0 && <span>No items carried.</span>}
                  {member.inventory.map((stack) => {
                    const item =
                      itemDefinitions[
                        stack.itemId as keyof typeof itemDefinitions
                      ]
                    return (
                      <span key={stack.itemId}>
                        {item?.name ?? stack.itemId} ×{stack.quantity}
                      </span>
                    )
                  })}
                </div>
              </section>

              <section className={styles.subsection}>
                <h3>Gear</h3>
                <p>Gear slots are reserved for a later alpha pass.</p>
              </section>
            </article>
          ))}
        </section>

        <footer>
          <Button
            variant="subtle"
            color="gray"
            onClick={() => navigate(`/campaign/${activeRun.id}`)}
          >
            Return to campaign
          </Button>
          <Button color="red" variant="light" onClick={abandon}>
            Abandon campaign
          </Button>
        </footer>
      </div>
    </GameShell>
  )
}
