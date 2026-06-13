import { Text, UnstyledButton } from '@mantine/core'
import type { Skill } from '../../../../game/combat/types'
import {
  formatSkillAccuracy,
  formatSkillEffect,
} from './formatSkillEffect'
import styles from './SkillMenu.module.scss'

interface SkillMenuProps {
  isSkillAvailable: (skill: Skill) => boolean
  onSelectSkill: (skillId: string) => void
  skills: Skill[]
}

export function SkillMenu({
  isSkillAvailable,
  onSelectSkill,
  skills,
}: SkillMenuProps) {
  return (
    <div className={styles.skillMenu}>
      {skills.map((skill, index) => (
        <UnstyledButton
          key={skill.id}
          className={styles.skillCommand}
          data-cy={`skill-${skill.id}`}
          disabled={!isSkillAvailable(skill)}
          onClick={() => onSelectSkill(skill.id)}
        >
          <span className={styles.commandKey}>0{index + 1}</span>
          <span className={styles.skillText}>
            <Text fw={800} size="sm">
              {skill.name}
            </Text>
            <Text size="10px" c="dimmed" lineClamp={1}>
              {skill.description}
            </Text>
          </span>
          <span className={styles.skillMeta}>
            <span>
              <Text size="9px" c="dimmed" fw={800} tt="uppercase">
                Accuracy
              </Text>
              <Text size="10px" fw={800}>
                {formatSkillAccuracy(skill)}
              </Text>
            </span>
            <span>
              <Text size="9px" c="dimmed" fw={800} tt="uppercase">
                Effect
              </Text>
              <Text size="10px" c="brand" fw={800}>
                {formatSkillEffect(skill)}
              </Text>
            </span>
            <span>
              <Text size="9px" c="dimmed" fw={800} tt="uppercase">
                Cost
              </Text>
              <Text size="10px" fw={800}>
                {skill.cost} stamina
              </Text>
            </span>
          </span>
        </UnstyledButton>
      ))}
    </div>
  )
}
