import { useDisclosure } from '@mantine/hooks'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  advanceCombatTurn,
  createInitialCombatState,
  getActiveCombatant,
  getValidTargets,
  resolveEnemyAction,
  resolveHeroAction,
} from '../../game/combat/engine'
import type {
  CombatState,
  EnemyActionResolution,
  HeroActionResolution,
  Skill,
} from '../../game/combat/types'
import {
  ActionToast,
  type BattleNotice,
} from './ActionToast/ActionToast'
import {
  ActionRoller,
  type ActionSequence,
} from './ActionRoller/ActionRoller'
import { BattleResult } from './BattleResult/BattleResult'
import { Battlefield } from './Battlefield/Battlefield'
import { CombatLog } from './CombatLog/CombatLog'
import { CommandDeck } from './CommandDeck/CommandDeck'
import {
  EnemyTurnOverlay,
  type EnemyTurnPhase,
} from './EnemyTurnOverlay/EnemyTurnOverlay'
import { EncounterHud } from './EncounterHud/EncounterHud'
import { GameHeader } from './GameHeader/GameHeader'
import {
  HeroActionOverlay,
  type HeroActionPhase,
} from './HeroActionOverlay/HeroActionOverlay'
import { TurnAnnouncement } from './TurnAnnouncement/TurnAnnouncement'
import styles from './CombatPrototype.module.scss'

interface CombatPrototypeProps {
  initialState?: CombatState
}

const ROLL_DURATION_MS = 700
const ACTION_PRESENTATION_TIMING = {
  action: 800,
  exit: 500,
  intent: 1100,
  result: 1250,
} as const
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
  const [enemyTurn, setEnemyTurn] = useState<{
    phase: EnemyTurnPhase
    resolution: EnemyActionResolution
  } | null>(null)
  const [heroAction, setHeroAction] = useState<{
    actorId: string
    phase: HeroActionPhase
    resolution: HeroActionResolution
    skill: Skill
    targetId: string
  } | null>(null)
  const [turnAnnouncement, setTurnAnnouncement] = useState<{
    combatantName: string
    team: 'heroes' | 'enemies'
  } | null>(null)
  const [battleNotice, setBattleNotice] = useState<BattleNotice | null>(null)
  const actionToken = useRef(0)
  const noticeId = useRef(0)
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

  const showBattleNotice = useCallback(
    (
      message: string,
      tone: BattleNotice['tone'] = 'neutral',
    ) => {
      noticeId.current += 1
      setBattleNotice({ id: noticeId.current, message, tone })
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
      heroAction ||
      enemyTurn ||
      turnAnnouncement ||
      activeCombatant?.team !== 'enemies'
    ) {
      return
    }

    const resolution = resolveEnemyAction(combat)
    if (!resolution) {
      return
    }

    const timeout = window.setTimeout(
      () => setEnemyTurn({ phase: 'intent', resolution }),
      0,
    )
    return () => window.clearTimeout(timeout)
  }, [
    activeCombatant?.team,
    combat,
    enemyTurn,
    heroAction,
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
    if (!heroAction) {
      return
    }

    if (heroAction.phase === 'intent') {
      const timeout = window.setTimeout(
        () =>
          setHeroAction((current) =>
            current ? { ...current, phase: 'action' } : current,
          ),
        ACTION_PRESENTATION_TIMING.intent,
      )
      return () => window.clearTimeout(timeout)
    }

    if (heroAction.phase === 'action') {
      const timeout = window.setTimeout(() => {
        setCombat(heroAction.resolution.state)
        setHeroAction((current) =>
          current ? { ...current, phase: 'result' } : current,
        )
      }, ACTION_PRESENTATION_TIMING.action)
      return () => window.clearTimeout(timeout)
    }

    if (heroAction.phase === 'result') {
      const timeout = window.setTimeout(
        () =>
          setHeroAction((current) =>
            current ? { ...current, phase: 'exit' } : current,
          ),
        ACTION_PRESENTATION_TIMING.result,
      )
      return () => window.clearTimeout(timeout)
    }

    const timeout = window.setTimeout(() => {
      const resolvedState = heroAction.resolution.state
      showBattleNotice(heroAction.resolution.message, 'hero')
      setHeroAction(null)
      if (resolvedState.status === 'active') {
        advanceToNextTurn(resolvedState)
      }
      resolvingAction.current = false
    }, ACTION_PRESENTATION_TIMING.exit)
    return () => window.clearTimeout(timeout)
  }, [advanceToNextTurn, heroAction, showBattleNotice])

  useEffect(() => {
    if (!enemyTurn) {
      return
    }

    if (enemyTurn.phase === 'intent') {
      const timeout = window.setTimeout(
        () =>
          setEnemyTurn((current) =>
            current ? { ...current, phase: 'attack' } : current,
          ),
        ACTION_PRESENTATION_TIMING.intent,
      )
      return () => window.clearTimeout(timeout)
    }

    if (enemyTurn.phase === 'attack') {
      const timeout = window.setTimeout(() => {
        setCombat(enemyTurn.resolution.state)
        showBattleNotice(enemyTurn.resolution.message, 'enemy')
        setEnemyTurn((current) =>
          current ? { ...current, phase: 'result' } : current,
        )
      }, ACTION_PRESENTATION_TIMING.action)
      return () => window.clearTimeout(timeout)
    }

    if (enemyTurn.phase === 'result') {
      const timeout = window.setTimeout(
        () =>
          setEnemyTurn((current) =>
            current ? { ...current, phase: 'exit' } : current,
          ),
        ACTION_PRESENTATION_TIMING.result,
      )
      return () => window.clearTimeout(timeout)
    }

    const timeout = window.setTimeout(() => {
      const resolvedState = enemyTurn.resolution.state
      setEnemyTurn(null)
      if (resolvedState.status === 'active') {
        advanceToNextTurn(resolvedState)
      }
    }, ACTION_PRESENTATION_TIMING.exit)
    return () => window.clearTimeout(timeout)
  }, [advanceToNextTurn, enemyTurn, showBattleNotice])

  useEffect(() => {
    if (!battleNotice) {
      return
    }

    const timeout = window.setTimeout(() => setBattleNotice(null), 2700)
    return () => window.clearTimeout(timeout)
  }, [battleNotice])

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

    setHeroAction({
      actorId: actor.id,
      phase: 'intent',
      resolution,
      skill,
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
    setBattleNotice(null)
    setEnemyTurn(null)
    setHeroAction(null)
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
          pendingAction || heroAction || turnAnnouncement ? true : undefined
        }
        aria-hidden={
          pendingAction || heroAction || turnAnnouncement ? true : undefined
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
          enemies={enemies}
          heroes={heroes}
          isFeedbackSuppressed={Boolean(heroAction || enemyTurn)}
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
          selectedSkill={selectedSkill}
        />
      </div>

      {battleNotice && (
        <ActionToast key={battleNotice.id} notice={battleNotice} />
      )}

      {pendingAction && (
        <ActionRoller
          onBack={cancelPendingAction}
          onContinue={continuePendingAction}
          onRoll={rollPendingAction}
          sequence={pendingAction.sequence}
        />
      )}

      {enemyTurn && (
        <EnemyTurnOverlay
          actor={
            combat.combatants.find(
              (combatant) =>
                combatant.id === enemyTurn.resolution.actorId,
            )!
          }
          phase={enemyTurn.phase}
          resolution={enemyTurn.resolution}
          target={
            combat.combatants.find(
              (combatant) =>
                combatant.id === enemyTurn.resolution.targetId,
            )!
          }
        />
      )}

      {heroAction && (
        <HeroActionOverlay
          actor={
            combat.combatants.find(
              (combatant) => combatant.id === heroAction.actorId,
            )!
          }
          phase={heroAction.phase}
          resolution={heroAction.resolution}
          skill={heroAction.skill}
          target={
            combat.combatants.find(
              (combatant) => combatant.id === heroAction.targetId,
            )!
          }
        />
      )}

      {turnAnnouncement && (
        <TurnAnnouncement
          combatantName={turnAnnouncement.combatantName}
          team={turnAnnouncement.team}
        />
      )}

      {combat.status !== 'active' &&
        !enemyTurn &&
        !heroAction &&
        !turnAnnouncement && (
        <BattleResult onReset={resetCombat} status={combat.status} />
      )}

      <CombatLog entries={combat.log} onClose={closeLog} opened={logOpened} />
    </main>
  )
}
