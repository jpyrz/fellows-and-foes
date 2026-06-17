import { Badge, Button } from '@mantine/core'
import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { GameShell } from '../../components/GameShell/GameShell'
import { SpellPreview } from '../../components/SpellPreview/SpellPreview'
import { classDefinitions } from '../../game/campaign/classes'
import { useGame } from '../../game/campaign/gameContext'
import {
  companionDefinitions,
  oldRoadCampaign,
} from '../../game/campaign/content'
import { campaignSkills } from '../../game/campaign/skills'
import type { CampaignPartySelection } from '../../game/campaign/gameContext'
import styles from './CampaignSetup.module.scss'

type Candidate = {
  id: string
  source: 'character' | 'companion'
  name: string
  title: string
  portrait: string
  subtitle: string
  skillIds: string[]
}

export function CampaignSetup() {
  const { createCampaign, save } = useGame()
  const navigate = useNavigate()
  const candidates = useMemo<Candidate[]>(
    () => [
      ...save.characters.map((character) => ({
        id: character.id,
        source: 'character' as const,
        name: character.name,
        title: `Level ${character.level} ${classDefinitions[character.classId].name}`,
        portrait: character.portrait,
        subtitle: `${character.armorType} armor · ${character.unlockedSkillIds.length} spells`,
        skillIds: character.unlockedSkillIds,
      })),
      ...companionDefinitions.map((companion) => ({
        id: companion.id,
        source: 'companion' as const,
        name: companion.name,
        title: companion.title,
        portrait: companion.portrait,
        subtitle: `${companion.background} · ${companion.trait}`,
        skillIds: companion.unlockedSkillIds,
      })),
    ],
    [save.characters],
  )
  const initialSelectedIds = save.activeCharacterId
    ? [save.activeCharacterId]
    : []
  const initialActiveCandidate = candidates.find(
    (entry) => entry.id === save.activeCharacterId,
  )
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds)
  const [loadouts, setLoadouts] = useState<Record<string, string[]>>(() =>
    initialActiveCandidate
      ? { [initialActiveCandidate.id]: initialActiveCandidate.skillIds.slice(0, 3) }
      : {},
  )
  const [preview, setPreview] = useState<{
    memberId: string
    skillId: string
  } | null>(null)

  if (save.characters.length === 0) {
    return <Navigate to="/character/create" replace />
  }
  if (save.activeRuns.some((run) => run.campaignId === oldRoadCampaign.id)) {
    return <Navigate to="/" replace />
  }

  function toggleMember(id: string) {
    setSelectedIds((current) => {
      const next = current.includes(id)
        ? current.filter((candidate) => candidate !== id)
        : current.length < 3
          ? [...current, id]
          : current

      setLoadouts((existing) => {
        const updated = { ...existing }
        for (const memberId of next) {
          const candidate = candidates.find((entry) => entry.id === memberId)
          if (!updated[memberId] && candidate) {
            updated[memberId] = candidate.skillIds.slice(0, 3)
          }
        }
        return updated
      })
      return next
    })
  }

  function toggleSkill(memberId: string, skillId: string) {
    setLoadouts((current) => {
      const currentLoadout = current[memberId] ?? []
      return {
        ...current,
        [memberId]: currentLoadout.includes(skillId)
          ? currentLoadout.filter((id) => id !== skillId)
          : currentLoadout.length < 3
            ? [...currentLoadout, skillId]
            : currentLoadout,
      }
    })
  }

  function previewSkill(memberId: string, skillId: string) {
    setPreview({ memberId, skillId })
  }

  function begin() {
    const party: CampaignPartySelection[] = selectedIds.map((memberId) => {
      const candidate = candidates.find((entry) => entry.id === memberId)!
      return {
        memberId,
        source: candidate.source,
        equippedSkillIds: loadouts[memberId] ?? candidate.skillIds.slice(0, 3),
      }
    })
    const run = createCampaign(party)
    window.setTimeout(() => navigate(`/campaign/${run.id}`), 0)
  }

  const ready =
    selectedIds.length === 3 &&
    selectedIds.some((id) =>
      candidates.some(
        (candidate) => candidate.id === id && candidate.source === 'character',
      ),
    ) &&
    selectedIds.every((id) => (loadouts[id] ?? []).length === 3)

  return (
    <GameShell title="Choose a Tavern Tale">
      <div className={styles.setup}>
        <section className={styles.campaignCard}>
          <div>
            <Badge color="brand" variant="light">
              Recommended level {oldRoadCampaign.recommendedLevel}
            </Badge>
            <span className={styles.eyebrow}>
              Storyglass tale · {oldRoadCampaign.subtitle}
            </span>
            <h1>{oldRoadCampaign.title}</h1>
            <p>
              An old traveler turns the storyglass toward your table.{' '}
              {oldRoadCampaign.description}
            </p>
          </div>
          <div className={styles.campaignSeal}>I</div>
        </section>

        <section>
          <div className={styles.heading}>
            <span>Table company</span>
            <h2>Choose three fellows for the retelling.</h2>
            <p>
              Custom fellows keep permanent growth between tales. Premade
              fellows still work as run-only allies when your roster is thin.
            </p>
          </div>
          <div className={styles.party}>
            {candidates.map((candidate) => (
              <button
                key={`${candidate.source}-${candidate.id}`}
                className={styles.companion}
                data-selected={selectedIds.includes(candidate.id) || undefined}
                onClick={() => toggleMember(candidate.id)}
                data-cy={`${candidate.source}-${candidate.id}`}
              >
                <img src={candidate.portrait} alt="" />
                <span>
                  <strong>{candidate.name}</strong>
                  <small>{candidate.title}</small>
                  <em>{candidate.subtitle}</em>
                </span>
                <i>
                  {selectedIds.includes(candidate.id)
                    ? 'Chosen'
                    : candidate.source === 'character'
                      ? 'Roster'
                      : 'Premade'}
                </i>
              </button>
            ))}
          </div>
        </section>

        {selectedIds.length > 0 && (
          <section className={styles.loadouts}>
            <div className={styles.heading}>
              <span>Campaign attunement</span>
              <h2>Select three spells each.</h2>
              <p>
                You can rebuild loadouts at the start of every campaign from
                each fellow’s unlocked spell pool. Tap a spell to inspect its
                details before attuning it.
              </p>
            </div>
            {selectedIds.map((memberId) => {
              const candidate = candidates.find((entry) => entry.id === memberId)
              if (!candidate) return null
              const selectedSkills = loadouts[memberId] ?? []
              return (
                <article key={memberId} className={styles.loadoutCard}>
                  <div className={styles.loadoutHeading}>
                    <img src={candidate.portrait} alt="" />
                    <span>
                      <strong>{candidate.name}</strong>
                      <small>{selectedSkills.length}/3 spells selected</small>
                    </span>
                  </div>
                  <div className={styles.spellPicker}>
                    {candidate.skillIds.map((skillId) => {
                      const skill = campaignSkills[skillId]
                      if (!skill) return null
                      return (
                        <button
                          key={skillId}
                          data-selected={
                            selectedSkills.includes(skillId) || undefined
                          }
                          aria-label={`Preview ${skill.name}`}
                          onClick={() => previewSkill(memberId, skillId)}
                        >
                          <img src={skill.icon} alt="" />
                          <span>
                            <strong>{skill.name}</strong>
                            <small>Tier {skill.tier} · Cost {skill.cost}</small>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </article>
              )
            })}
          </section>
        )}

        <footer className={styles.footer}>
          <Button variant="subtle" color="gray" onClick={() => navigate('/')}>
            Back
          </Button>
          <div>
            <span>{selectedIds.length}/3 party members</span>
            <Button
              color="brand"
              size="md"
              disabled={!ready}
              onClick={begin}
              data-cy="begin-campaign"
            >
              Begin The Old Road
            </Button>
          </div>
        </footer>
        {preview && (
          <SpellPreview
            contextLabel={`${
              candidates.find((entry) => entry.id === preview.memberId)?.name ??
              'Fellow'
            }'s spell pool`}
            isSelected={
              loadouts[preview.memberId]?.includes(preview.skillId) ?? false
            }
            selectionHint={getPreviewHint(
              candidates.find((entry) => entry.id === preview.memberId)?.name,
              loadouts[preview.memberId]?.includes(preview.skillId) ?? false,
              loadouts[preview.memberId]?.length ?? 0,
            )}
            skill={campaignSkills[preview.skillId]}
            toggleDisabled={
              !(loadouts[preview.memberId]?.includes(preview.skillId) ?? false) &&
              (loadouts[preview.memberId]?.length ?? 0) >= 3
            }
            disabledActionLabel="3 spells selected"
            onClose={() => setPreview(null)}
            onToggle={() => {
              toggleSkill(preview.memberId, preview.skillId)
              setPreview(null)
            }}
          />
        )}
      </div>
    </GameShell>
  )
}

function getPreviewHint(
  name: string | undefined,
  isSelected: boolean,
  selectedCount: number,
) {
  if (isSelected) return 'Currently attuned for this campaign.'
  if (selectedCount >= 3) return 'Remove a selected spell before attuning this one.'
  return `Attune this spell for ${name ?? 'this fellow'}'s campaign loadout.`
}
