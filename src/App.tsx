import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { CombatPrototype } from './components/CombatPrototype/CombatPrototype'
import { Achievements } from './screens/Achievements/Achievements'
import { CampaignBattle } from './screens/CampaignBattle/CampaignBattle'
import { CampaignMap } from './screens/CampaignMap/CampaignMap'
import { CampaignSetup } from './screens/CampaignSetup/CampaignSetup'
import { CharacterCreation } from './screens/CharacterCreation/CharacterCreation'
import { CharacterDetail } from './screens/CharacterDetail/CharacterDetail'
import { Checkpoint } from './screens/Checkpoint/Checkpoint'
import { Dashboard } from './screens/Dashboard/Dashboard'
import { Ending } from './screens/Ending/Ending'
import { PartyView } from './screens/PartyView/PartyView'
import { Settings } from './screens/Settings/Settings'
import { StoryScreen } from './screens/StoryScreen/StoryScreen'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/character/create" element={<CharacterCreation />} />
        <Route path="/characters/:characterId" element={<CharacterDetail />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/campaign/new" element={<CampaignSetup />} />
        <Route path="/campaign/:runId" element={<StoryScreen />} />
        <Route path="/campaign/:runId/map" element={<CampaignMap />} />
        <Route path="/campaign/:runId/battle" element={<CampaignBattle />} />
        <Route path="/campaign/:runId/party" element={<PartyView />} />
        <Route path="/campaign/:runId/checkpoint" element={<Checkpoint />} />
        <Route path="/campaign/:runId/ending" element={<Ending />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/battle-lab" element={<CombatPrototype />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
