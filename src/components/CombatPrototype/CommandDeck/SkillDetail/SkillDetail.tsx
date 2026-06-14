import { Button, Text } from '@mantine/core'
import type { Skill } from '../../../../game/combat/types'
import {
  formatSkillAccuracy,
  formatSkillEffect,
} from '../SkillMenu/formatSkillEffect'
import styles from './SkillDetail.module.scss'

interface SkillDetailProps {
  onCancel: () => void
  skill: Skill
  targetCount: number
}

export function SkillDetail({
  onCancel,
  skill,
  targetCount,
}: SkillDetailProps) {
  return (
    <div className={styles.detail} data-target-type={skill.target}>
      <div className={styles.iconFrame}>
        <img src={skill.icon} alt="" />
        <span>{skill.cost}</span>
      </div>

      <div className={styles.copy}>
        <div className={styles.titleRow}>
          <Text component="h2" fw={900} size="lg">
            {skill.name}
          </Text>
          <Text size="10px" c="dimmed" fw={800} tt="uppercase">
            {skill.cost} stamina
          </Text>
        </div>
        <Text size="xs" c="dimmed" lineClamp={2}>
          {skill.description}
        </Text>
        <div className={styles.stats}>
          <span>
            <small>Accuracy</small>
            <strong>{formatSkillAccuracy(skill)}</strong>
          </span>
          <span>
            <small>Effect</small>
            <strong>{formatSkillEffect(skill)}</strong>
          </span>
          <span>
            <small>Targets</small>
            <strong>{targetCount}</strong>
          </span>
        </div>
      </div>

      <div className={styles.actions}>
        <Text size="10px" c="brand" fw={800} tt="uppercase">
          Tap one of {targetCount} glowing targets
        </Text>
        <Button
          color="gray"
          onClick={onCancel}
          size="xs"
          variant="subtle"
        >
          Close
        </Button>
      </div>
    </div>
  )
}
