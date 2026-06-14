import { UnstyledButton } from '@mantine/core'
import type { Skill } from '../../../../game/combat/types'
import styles from './SkillMenu.module.scss'

interface SkillMenuProps {
  isSkillAvailable: (skill: Skill) => boolean
  onSelectSkill: (skillId: string) => void
  selectedSkillId?: string
  skills: Skill[]
}

export function SkillMenu({
  isSkillAvailable,
  onSelectSkill,
  selectedSkillId,
  skills,
}: SkillMenuProps) {
  return (
    <div className={styles.hotbar} aria-label="Abilities">
      {skills.map((skill, index) => (
        <UnstyledButton
          key={skill.id}
          aria-label={`${skill.name}, ${skill.cost} stamina`}
          className={styles.skillSlot}
          data-cy={`skill-${skill.id}`}
          data-selected={selectedSkillId === skill.id || undefined}
          disabled={!isSkillAvailable(skill)}
          onClick={() => onSelectSkill(skill.id)}
        >
          <img src={skill.icon} alt="" />
          <span className={styles.slotNumber}>{index + 1}</span>
          <span className={styles.skillCost}>{skill.cost}</span>
        </UnstyledButton>
      ))}
    </div>
  )
}
