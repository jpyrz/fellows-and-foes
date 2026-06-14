import { Button, Text } from '@mantine/core'
import type {
  CombatStatus,
  Combatant,
  Skill,
} from '../../../game/combat/types'
import { SkillDetail } from './SkillDetail/SkillDetail'
import { SkillMenu } from './SkillMenu/SkillMenu'
import styles from './CommandDeck.module.scss'

interface CommandDeckProps {
  activeCombatant?: Combatant
  isTargeting: boolean
  isSkillAvailable: (skill: Skill) => boolean
  onBeginTargeting: () => void
  onCancelSelection: () => void
  onReset: () => void
  onSelectSkill: (skillId: string) => void
  selectedSkill?: Skill
  status: CombatStatus
  validTargets: Combatant[]
}

export function CommandDeck({
  activeCombatant,
  isTargeting,
  isSkillAvailable,
  onBeginTargeting,
  onCancelSelection,
  onReset,
  onSelectSkill,
  selectedSkill,
  status,
  validTargets,
}: CommandDeckProps) {
  return (
    <section className={styles.commandDeck}>
      {status === 'active' && activeCombatant ? (
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
          </div>

          <div className={styles.abilityLabel}>
            <Text size="10px" c="dimmed" fw={800} tt="uppercase">
              {isTargeting ? 'Select a combatant' : 'Abilities'}
            </Text>
            <Text size="10px" c={isTargeting ? 'brand' : 'dimmed'} fw={800}>
              {isTargeting ? 'Valid targets are glowing' : 'Tap to inspect'}
            </Text>
          </div>

          <SkillMenu
            isSkillAvailable={isSkillAvailable}
            onSelectSkill={onSelectSkill}
            selectedSkillId={selectedSkill?.id}
            skills={activeCombatant.skills}
          />

          {selectedSkill && (
            <SkillDetail
              isTargeting={isTargeting}
              onBeginTargeting={onBeginTargeting}
              onCancel={onCancelSelection}
              skill={selectedSkill}
              targetCount={validTargets.length}
            />
          )}
        </>
      ) : (
        <div className={styles.resultMenu}>
          <Text
            size="10px"
            c={status === 'victory' ? 'brand' : 'red'}
            fw={800}
            tt="uppercase"
          >
            Encounter complete
          </Text>
          <Text component="h2" fw={800} size="xl">
            {status === 'victory'
              ? 'The road is yours.'
              : 'The expedition has fallen.'}
          </Text>
          <Text size="xs" c="dimmed">
            {status === 'victory'
              ? 'The party survives and may continue toward Bellweather.'
              : 'Try a different sequence of attacks and support skills.'}
          </Text>
          <Button color="brand" fullWidth mt="sm" onClick={onReset}>
            Fight again
          </Button>
        </div>
      )}
    </section>
  )
}
