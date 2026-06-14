import { Text } from "@mantine/core";
import type {
  ActionEffectType,
  Combatant,
} from "../../../game/combat/types";
import { UnitInspector } from "./UnitInspector/UnitInspector";
import { UnitPanel } from "./UnitPanel/UnitPanel";
import styles from "./Battlefield.module.scss";

interface BattlefieldProps {
  activeCombatantId?: string;
  actionActorId?: string;
  actionEffect?: ActionEffectType;
  actionPhase?: "windup" | "impact";
  actionTargetId?: string;
  enemies: Combatant[];
  heroes: Combatant[];
  isTargeting: boolean;
  inspectedCombatantId: string | null;
  onCloseInspection: () => void;
  onChooseTarget: (targetId: string) => void;
  onInspect: (combatantId: string) => void;
  targetableIds: string[];
}

export function Battlefield({
  activeCombatantId,
  actionActorId,
  actionEffect,
  actionPhase,
  actionTargetId,
  enemies,
  heroes,
  isTargeting,
  inspectedCombatantId,
  onCloseInspection,
  onChooseTarget,
  onInspect,
  targetableIds,
}: BattlefieldProps) {
  const combatants = [...enemies, ...heroes];
  const inspectedCombatant = combatants.find(
    (combatant) => combatant.id === inspectedCombatantId,
  );

  return (
    <section className={styles.battlefield}>
      <div className={styles.enemyLane}>
        <Text className={styles.laneLabel}>Enemies</Text>
        <div className={`${styles.unitGrid} ${styles.enemyGrid}`}>
          {enemies.map((enemy) => (
            <UnitPanel
              key={enemy.id}
              actionEffect={actionEffect}
              actionPhase={actionPhase}
              combatant={enemy}
              isActive={activeCombatantId === enemy.id}
              isActionActor={actionActorId === enemy.id}
              isActionTarget={actionTargetId === enemy.id}
              isTargetable={targetableIds.includes(enemy.id)}
              isTargeting={isTargeting}
              onInspect={onInspect}
              onChooseTarget={onChooseTarget}
            />
          ))}
        </div>
      </div>

      <div className={styles.versus} aria-label="Fellows versus foes">
        <strong>VS</strong>
      </div>

      <div className={styles.partyLane}>
        <Text className={styles.laneLabel}>Party</Text>
        <div className={`${styles.unitGrid} ${styles.partyGrid}`}>
          {heroes.map((hero) => (
            <UnitPanel
              key={hero.id}
              actionEffect={actionEffect}
              actionPhase={actionPhase}
              combatant={hero}
              isActive={activeCombatantId === hero.id}
              isActionActor={actionActorId === hero.id}
              isActionTarget={actionTargetId === hero.id}
              isTargetable={targetableIds.includes(hero.id)}
              isTargeting={isTargeting}
              layout="party"
              onInspect={onInspect}
              onChooseTarget={onChooseTarget}
            />
          ))}
        </div>
      </div>

      {inspectedCombatant && (
        <UnitInspector
          combatant={inspectedCombatant}
          onClose={onCloseInspection}
        />
      )}
    </section>
  );
}
