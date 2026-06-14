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
  const slots = Array.from({ length: 5 }, (_, index) => skills[index])

  return (
    <div className={styles.hotbar} aria-label="Abilities">
      {slots.map((skill, index) =>
        skill ? (
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
        ) : (
          <div
            key={`empty-${index}`}
            className={styles.emptySlot}
            aria-label="Empty ability slot"
          >
            <span className={styles.slotNumber}>{index + 1}</span>
            <span className={styles.emptyMark}>+</span>
          </div>
        ),
      )}
    </div>
  )
}
