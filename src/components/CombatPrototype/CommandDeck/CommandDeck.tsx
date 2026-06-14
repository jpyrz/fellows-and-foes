import { Button, Text } from '@mantine/core'
import type { Combatant, Skill } from '../../../game/combat/types'
import { SkillDetail } from './SkillDetail/SkillDetail'
import { SkillMenu } from './SkillMenu/SkillMenu'
import styles from './CommandDeck.module.scss'

interface CommandDeckProps {
  activeCombatant?: Combatant
  isTargeting: boolean
  isSkillAvailable: (skill: Skill) => boolean
  onCancelSelection: () => void
  onSelectSkill: (skillId: string) => void
  onSkipTurn: () => void
  selectedSkill?: Skill
}

export function CommandDeck({
  activeCombatant,
  isTargeting,
  isSkillAvailable,
  onCancelSelection,
  onSelectSkill,
  onSkipTurn,
  selectedSkill,
}: CommandDeckProps) {
  return (
    <section className={styles.commandDeck}>
      {activeCombatant ? (
        <>
          <div className={styles.commandHeader}>
            <div className={styles.activePortrait}>
              <img src={activeCombatant.portrait} alt="" />
            </div>
            <div className={styles.commandTitle}>
              <Text size="10px" c="brand" fw={800} tt="uppercase">
                Your turn
              </Text>
              <Text fw={800} data-cy="active-turn">
                {activeCombatant.name}
              </Text>
            </div>
            <div className={styles.activeStamina}>
              <Text size="10px" c="dimmed" fw={700}>
                STAMINA
              </Text>
              <Text fw={800}>{activeCombatant.stamina}</Text>
            </div>
            <Button
              className={styles.skipButton}
              color="gray"
              size="compact-xs"
              variant="subtle"
              onClick={onSkipTurn}
            >
              <span className={styles.fullSkipLabel}>Skip turn</span>
              <span className={styles.compactSkipLabel}>Skip</span>
            </Button>
          </div>

          <div className={styles.abilityLabel}>
            <Text size="10px" c="dimmed" fw={800} tt="uppercase">
              {isTargeting ? 'Select a combatant' : 'Abilities'}
            </Text>
            <Text size="10px" c={isTargeting ? 'brand' : 'dimmed'} fw={800}>
              {isTargeting ? 'Valid targets are marked' : 'Tap to inspect'}
            </Text>
          </div>

          <SkillMenu
            isSkillAvailable={isSkillAvailable}
            onSelectSkill={onSelectSkill}
            selectedSkillId={selectedSkill?.id}
            skills={activeCombatant.skills}
          />

          {selectedSkill && (
            <SkillDetail onCancel={onCancelSelection} skill={selectedSkill} />
          )}
        </>
      ) : (
        <div className={styles.waiting}>
          <span />
          <Text size="10px" c="dimmed" fw={900} tt="uppercase">
            Battle in progress
          </Text>
        </div>
      )}
    </section>
  )
}
