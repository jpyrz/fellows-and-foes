import { useDisclosure } from '@mantine/hooks'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  advanceCombatTurn,
  createInitialCombatState,
  getActiveCombatant,
  getValidTargets,
  passHeroTurn,
  resolveEnemyAction,
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
import { BattleResult } from './BattleResult/BattleResult'
import { Battlefield } from './Battlefield/Battlefield'
import { CombatLog } from './CombatLog/CombatLog'
import { CommandDeck } from './CommandDeck/CommandDeck'
import { EncounterHud } from './EncounterHud/EncounterHud'
import { GameHeader } from './GameHeader/GameHeader'
import { TurnAnnouncement } from './TurnAnnouncement/TurnAnnouncement'
import styles from './CombatPrototype.module.scss'

interface CombatPrototypeProps {
  initialState?: CombatState
}

const ROLL_DURATION_MS = 700
const BOARD_ACTION_WINDUP_MS = 620
const BOARD_ACTION_IMPACT_MS = 760
const TURN_ANNOUNCEMENT_MS = 1450

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
  const [boardAction, setBoardAction] = useState<{
    actorId: string
    effect: Skill['effect']['type']
    phase: 'windup' | 'impact'
    resolvedState: CombatState
    targetId: string
  } | null>(null)
  const [turnAnnouncement, setTurnAnnouncement] = useState<{
    combatantName: string
    team: 'heroes' | 'enemies'
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

  const advanceToNextTurn = useCallback((state: CombatState) => {
    const nextState = advanceCombatTurn(state)
    const nextCombatant = getActiveCombatant(nextState)

    setCombat(nextState)
    if (nextState.status === 'active' && nextCombatant) {
      setTurnAnnouncement({
        combatantName: nextCombatant.name,
        team: nextCombatant.team,
      })
    }
  }, [])

  useEffect(() => {
    if (
      combat.status !== 'active' ||
      pendingAction ||
      boardAction ||
      turnAnnouncement ||
      activeCombatant?.team !== 'enemies'
    ) {
      return
    }

    const resolution = resolveEnemyAction(combat)
    if (!resolution) {
      return
    }

    const timeout = window.setTimeout(() => {
      setBoardAction({
        actorId: resolution.actorId,
        effect: resolution.skill.effect.type,
        phase: 'windup',
        resolvedState: resolution.state,
        targetId: resolution.targetId,
      })
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [
    activeCombatant?.team,
    boardAction,
    combat,
    pendingAction,
    turnAnnouncement,
  ])

  useEffect(() => {
    if (!turnAnnouncement) {
      return
    }

    const timeout = window.setTimeout(
      () => setTurnAnnouncement(null),
      TURN_ANNOUNCEMENT_MS,
    )
    return () => window.clearTimeout(timeout)
  }, [turnAnnouncement])

  useEffect(() => {
    if (!boardAction) {
      return
    }

    const timeout = window.setTimeout(() => {
      if (boardAction.phase === 'windup') {
        setCombat(boardAction.resolvedState)
        setBoardAction({ ...boardAction, phase: 'impact' })
        return
      }

      const resolvedState = boardAction.resolvedState
      setBoardAction(null)
      resolvingAction.current = false
      if (resolvedState.status === 'active') {
        advanceToNextTurn(resolvedState)
      }
    }, boardAction.phase === 'windup' ? BOARD_ACTION_WINDUP_MS : BOARD_ACTION_IMPACT_MS)
    return () => window.clearTimeout(timeout)
  }, [advanceToNextTurn, boardAction])

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

    const { resolution, skillId, targetId } = pendingAction
    const actor = activeCombatant
    const skill = actor?.skills.find((candidate) => candidate.id === skillId)

    if (!actor || !skill) {
      setPendingAction(null)
      resolvingAction.current = false
      return
    }

    setBoardAction({
      actorId: actor.id,
      effect: skill.effect.type,
      phase: 'windup',
      resolvedState: resolution.state,
      targetId,
    })
    setPendingAction(null)
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

  function skipTurn() {
    if (
      combat.status !== 'active' ||
      activeCombatant?.team !== 'heroes' ||
      resolvingAction.current
    ) {
      return
    }

    setInspectedCombatantId(null)
    cancelSelection()
    advanceToNextTurn(passHeroTurn(combat))
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
    setBoardAction(null)
    setTurnAnnouncement(null)
    setInspectedCombatantId(null)
    setSelectedSkillId(null)
    setIsTargeting(false)
    setPendingAction(null)
  }

  return (
    <main className={styles.shell}>
      <div
        className={styles.gameFrame}
        inert={
          pendingAction || boardAction || turnAnnouncement ? true : undefined
        }
        aria-hidden={
          pendingAction || turnAnnouncement ? true : undefined
        }
      >
        <GameHeader />
        <EncounterHud
          activeCombatantId={activeCombatant?.id}
          combatants={combat.combatants}
          onOpenLog={openLog}
          onReset={resetCombat}
          round={combat.round}
          status={combat.status}
          turnOrder={combat.turnOrder}
        />
        <Battlefield
          activeCombatantId={activeCombatant?.id}
          actionActorId={boardAction?.actorId}
          actionEffect={boardAction?.effect}
          actionPhase={boardAction?.phase}
          actionTargetId={boardAction?.targetId}
          enemies={enemies}
          heroes={heroes}
          isTargeting={isTargeting}
          inspectedCombatantId={inspectedCombatantId}
          onCloseInspection={() => setInspectedCombatantId(null)}
          onChooseTarget={chooseTarget}
          onInspect={setInspectedCombatantId}
          targetableIds={
            isTargeting ? validTargets.map((target) => target.id) : []
          }
        />
        <CommandDeck
          activeCombatant={
            activeCombatant?.team === 'heroes' ? activeCombatant : undefined
          }
          isTargeting={isTargeting}
          isSkillAvailable={isSkillAvailable}
          onCancelSelection={cancelSelection}
          onSelectSkill={selectSkill}
          onSkipTurn={skipTurn}
          selectedSkill={selectedSkill}
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

      {turnAnnouncement && (
        <TurnAnnouncement
          combatantName={turnAnnouncement.combatantName}
          onDismiss={() => setTurnAnnouncement(null)}
          team={turnAnnouncement.team}
        />
      )}

      {combat.status !== 'active' &&
        !boardAction &&
        !turnAnnouncement && (
        <BattleResult onReset={resetCombat} status={combat.status} />
      )}

      <CombatLog entries={combat.log} onClose={closeLog} opened={logOpened} />
    </main>
  )
}
