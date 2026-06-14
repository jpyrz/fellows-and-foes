import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { CombatPrototype } from '../../components/CombatPrototype/CombatPrototype'
import { useGame } from '../../game/campaign/gameContext'
import { createCampaignCombatState } from '../../game/campaign/combatAdapter'

export function CampaignBattle() {
  const { runId = '' } = useParams()
  const { getRun, resolveBattle } = useGame()
  const navigate = useNavigate()
  const run = getRun(runId)
  const [initialState] = useState(
    () => (run ? createCampaignCombatState(run) : undefined),
  )

  if (!run || !initialState) return <Navigate to="/" replace />

  return (
    <CombatPrototype
      campaignTitle="The Old Road"
      encounterTitle="Smoke in the Mire"
      initialState={initialState}
      onComplete={(combat) => {
        resolveBattle(run.id, combat)
        navigate(`/campaign/${run.id}`)
      }}
    />
  )
}
