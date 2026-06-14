import { useDisclosure } from '@mantine/hooks'
import { useEffect, useRef, useState } from 'react'
import {
  advanceCombatTurn,
  createInitialCombatState,
  getActiveCombatant,
  getValidTargets,
  resolveHeroAction,
} from '../../game/combat/engine'
import type {
  CombatState,
  HeroActionResolution,
  Skill,
} from '../../game/combat/types'
import {
  ActionRoller,
  type ActionSequence,
} from './ActionRoller/ActionRoller'
import { Battlefield } from './Battlefield/Battlefield'
import { CombatLog } from './CombatLog/CombatLog'
import { CommandDeck } from './CommandDeck/CommandDeck'
import { EncounterHud } from './EncounterHud/EncounterHud'
import { GameHeader } from './GameHeader/GameHeader'
import styles from './CombatPrototype.module.scss'

interface CombatPrototypeProps {
  initialState?: CombatState
}

const ROLL_DURATION_MS = 700
function delay(duration: number) {
  return new Promise((resolve) => window.setTimeout(resolve, duration))
}

export function CombatPrototype({ initialState }: CombatPrototypeProps) {
  const [combat, setCombat] = useState(
    () => initialState ?? createInitialCombatState(),
  )
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null)
  const [isTargeting, setIsTargeting] = useState(false)
  const [inspectedCombatantId, setInspectedCombatantId] = useState<
    string | null
  >(null)
  const [pendingAction, setPendingAction] = useState<{
    resolution?: HeroActionResolution
    sequence: ActionSequence
    skillId: string
    targetId: string
  } | null>(null)
  const actionToken = useRef(0)
  const resolvingAction = useRef(false)
  const [logOpened, { close: closeLog, open: openLog }] = useDisclosure(false)
  const activeCombatant = getActiveCombatant(combat)
  const heroes = combat.combatants.filter(
    (combatant) => combatant.team === 'heroes',
  )
  const enemies = combat.combatants.filter(
    (combatant) => combatant.team === 'enemies',
  )
  const selectedSkill = activeCombatant?.skills.find(
    (skill) => skill.id === selectedSkillId,
  )
  const validTargets =
    activeCombatant && selectedSkillId
      ? getValidTargets(combat, activeCombatant.id, selectedSkillId)
      : []

  useEffect(
    () => () => {
      actionToken.current += 1
    },
    [],
  )

  function isSkillAvailable(skill: Skill) {
    return Boolean(
      activeCombatant &&
        activeCombatant.stamina >= skill.cost &&
        getValidTargets(combat, activeCombatant.id, skill.id).length > 0,
    )
  }

  function chooseTarget(targetId: string) {
    if (
      !isTargeting ||
      !selectedSkillId ||
      !selectedSkill ||
      !activeCombatant ||
      resolvingAction.current
    ) {
      return
    }

    const target = combat.combatants.find(
      (combatant) => combatant.id === targetId,
    )

    if (
      !target ||
      !validTargets.some((validTarget) => validTarget.id === targetId)
    ) {
      return
    }

    resolvingAction.current = true
    let rollSides: number[] = []

    if (selectedSkill.effect.type === 'damage') {
      const hitCount = selectedSkill.effect.hits ?? 1
      const damageDie = selectedSkill.effect.die
      rollSides = Array.from({ length: hitCount }, () => [
        20,
        damageDie,
      ]).flat()
    } else if (selectedSkill.effect.type === 'heal') {
      rollSides = [selectedSkill.effect.die]
    }

    setPendingAction({
      sequence: {
        actorName: activeCombatant.name,
        attackBonus:
          selectedSkill.effect.type === 'damage'
            ? (selectedSkill.attackBonus ?? 0)
            : undefined,
        message: '',
        phase: 'ready',
        rollSides,
        rolls: [],
        skillName: selectedSkill.name,
        targetDefense:
          selectedSkill.effect.type === 'damage' ? target.defense : undefined,
        targetName: target.name,
      },
      skillId: selectedSkillId,
      targetId,
    })
  }

  async function rollPendingAction() {
    if (!pendingAction || pendingAction.sequence.phase !== 'ready') {
      return
    }

    const resolution = resolveHeroAction(
      combat,
      pendingAction.skillId,
      pendingAction.targetId,
    )

    if (resolution.state === combat) {
      setPendingAction(null)
      resolvingAction.current = false
      return
    }

    const token = actionToken.current + 1
    actionToken.current = token
    setSelectedSkillId(null)
    setIsTargeting(false)
    setPendingAction((current) =>
      current
        ? {
            ...current,
            resolution,
            sequence: {
              ...current.sequence,
              message: resolution.message,
              phase: 'rolling',
              rollSides: resolution.rolls.map((roll) => roll.sides),
              rolls: resolution.rolls,
            },
          }
        : current,
    )
    await delay(ROLL_DURATION_MS)
    if (actionToken.current !== token) {
      return
    }

    setPendingAction((current) =>
      current
        ? {
            ...current,
            sequence: { ...current.sequence, phase: 'result' },
          }
        : current,
    )
  }

  function continuePendingAction() {
    if (
      !pendingAction ||
      !pendingAction.resolution ||
      pendingAction.sequence.phase !== 'result'
    ) {
      return
    }

    const { resolution } = pendingAction
    setCombat(
      resolution.state.status === 'active'
        ? advanceCombatTurn(resolution.state)
        : resolution.state,
    )
    setPendingAction(null)
    resolvingAction.current = false
  }

  function selectSkill(skillId: string) {
    setInspectedCombatantId(null)
    setSelectedSkillId(skillId)
    setIsTargeting(true)
  }

  function cancelSelection() {
    setSelectedSkillId(null)
    setIsTargeting(false)
  }

  function cancelPendingAction() {
    if (!pendingAction || pendingAction.sequence.phase !== 'ready') {
      return
    }

    setPendingAction(null)
    resolvingAction.current = false
  }

  function resetCombat() {
    actionToken.current += 1
    resolvingAction.current = false
    setCombat(createInitialCombatState())
    setInspectedCombatantId(null)
    setSelectedSkillId(null)
    setIsTargeting(false)
    setPendingAction(null)
  }

  return (
    <main className={styles.shell}>
      <div
        className={styles.gameFrame}
        inert={pendingAction ? true : undefined}
        aria-hidden={pendingAction ? true : undefined}
      >
        <GameHeader onOpenLog={openLog} onReset={resetCombat} />
        <EncounterHud
          activeCombatantId={activeCombatant?.id}
          combatants={combat.combatants}
          round={combat.round}
          status={combat.status}
          turnOrder={combat.turnOrder}
        />
        <Battlefield
          activeCombatantId={activeCombatant?.id}
          enemies={enemies}
          heroes={heroes}
          isTargeting={isTargeting}
          inspectedCombatantId={inspectedCombatantId}
          latestMessage={combat.log.at(-1)?.message}
          onCloseInspection={() => setInspectedCombatantId(null)}
          onChooseTarget={chooseTarget}
          onInspect={setInspectedCombatantId}
          targetableIds={
            isTargeting ? validTargets.map((target) => target.id) : []
          }
        />
        <CommandDeck
          activeCombatant={activeCombatant}
          isTargeting={isTargeting}
          isSkillAvailable={isSkillAvailable}
          onCancelSelection={cancelSelection}
          onReset={resetCombat}
          onSelectSkill={selectSkill}
          selectedSkill={selectedSkill}
          status={combat.status}
          validTargets={validTargets}
        />
      </div>

      {pendingAction && (
        <ActionRoller
          onBack={cancelPendingAction}
          onContinue={continuePendingAction}
          onRoll={rollPendingAction}
          sequence={pendingAction.sequence}
        />
      )}

      <CombatLog entries={combat.log} onClose={closeLog} opened={logOpened} />
    </main>
  )
}
