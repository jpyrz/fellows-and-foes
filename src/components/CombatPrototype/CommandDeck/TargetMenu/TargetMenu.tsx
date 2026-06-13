import { Button, Group, Text, UnstyledButton } from '@mantine/core'
import type { Combatant, Skill } from '../../../../game/combat/types'
import styles from './TargetMenu.module.scss'

interface TargetMenuProps {
  onBack: () => void
  onChooseTarget: (targetId: string) => void
  skill: Skill
  targets: Combatant[]
}

export function TargetMenu({
  onBack,
  onChooseTarget,
  skill,
  targets,
}: TargetMenuProps) {
  return (
    <div className={styles.targetMenu}>
      <Group justify="space-between" mb="sm">
        <div>
          <Text size="10px" c="dimmed" tt="uppercase" fw={800}>
            Select target
          </Text>
          <Text fw={800}>{skill.name}</Text>
        </div>
        <Button
          size="compact-xs"
          variant="subtle"
          color="gray"
          onClick={onBack}
        >
          Back
        </Button>
      </Group>

      <div className={styles.targetGrid}>
        {targets.map((target) => (
          <UnstyledButton
            key={target.id}
            className={styles.targetCommand}
            onClick={() => onChooseTarget(target.id)}
            data-cy={`target-${target.id}`}
          >
            <span className={styles.targetPortrait}>
              {target.name.slice(0, 1)}
            </span>
            <span>
              <Text fw={800} size="sm">
                {target.name}
              </Text>
              <Text size="10px" c="dimmed">
                {target.health}/{target.maxHealth} HP · Defense {target.defense}
              </Text>
            </span>
          </UnstyledButton>
        ))}
      </div>
    </div>
  )
}
