import { Button } from '@mantine/core'
import {
  formatSkillAccuracy,
  formatSkillEffect,
} from '../CombatPrototype/CommandDeck/SkillMenu/formatSkillEffect'
import { statLabels } from '../../game/campaign/rules'
import type { CampaignSkill } from '../../game/campaign/skills'
import styles from './SpellPreview.module.scss'

interface SpellPreviewProps {
  actionLabel?: string
  contextLabel: string
  disabledActionLabel?: string
  isSelected: boolean
  onClose(): void
  onToggle(): void
  selectionHint: string
  skill?: CampaignSkill
  toggleDisabled?: boolean
}

const targetLabels = {
  ally: 'Ally',
  enemy: 'Enemy',
  self: 'Self',
} as const

export function SpellPreview({
  actionLabel = 'Select spell',
  contextLabel,
  disabledActionLabel = 'Unavailable',
  isSelected,
  onClose,
  onToggle,
  selectionHint,
  skill,
  toggleDisabled = false,
}: SpellPreviewProps) {
  if (!skill) return null

  return (
    <div
      className={styles.previewOverlay}
      role="dialog"
      aria-label={`${skill.name} spell details`}
      aria-modal="true"
    >
      <article
        className={styles.spellPreview}
        data-selected={isSelected || undefined}
        data-target-type={skill.target}
      >
        <div className={styles.previewIcon}>
          <img src={skill.icon} alt="" />
          <span>{skill.cost}</span>
        </div>
        <div className={styles.previewCopy}>
          <span>{contextLabel}</span>
          <h2>{skill.name}</h2>
          <em>
            Tier {skill.tier} · {targetLabels[skill.target]} spell
          </em>
          <p>{skill.description}</p>
          <div className={styles.previewStats}>
            <span>
              <small>Accuracy</small>
              <strong>{formatSkillAccuracy(skill)}</strong>
            </span>
            <span>
              <small>Effect</small>
              <strong>{formatSkillEffect(skill)}</strong>
            </span>
            <span>
              <small>Target</small>
              <strong>{targetLabels[skill.target]}</strong>
            </span>
            <span>
              <small>Scaling</small>
              <strong>
                {statLabels[skill.scalingStat]} {skill.requiredStat}
              </strong>
            </span>
          </div>
          <p className={styles.previewHint}>{selectionHint}</p>
        </div>
        <footer className={styles.previewActions}>
          <Button color="gray" variant="subtle" onClick={onClose}>
            Close
          </Button>
          <Button
            color={isSelected ? 'red' : 'brand'}
            disabled={toggleDisabled}
            onClick={onToggle}
          >
            {isSelected
              ? 'Remove spell'
              : toggleDisabled
                ? disabledActionLabel
                : actionLabel}
          </Button>
        </footer>
      </article>
    </div>
  )
}
