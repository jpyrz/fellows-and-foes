# Combat Prototype

The first combat slice tests a small party against authored enemy behavior.

## Rules

- Combatants act once per round in initiative order.
- The solo player controls all three heroes.
- Enemies choose targets automatically according to their behavior.
- Attacks roll `d20 + attack bonus` against Defense.
- Successful attacks roll their listed damage dice.
- Skills may cost Stamina; zero-cost skills remain available.
- Each standing hero restores 1 Stamina at the start of a new round.
- Shields absorb damage before Health.
- Stagger causes a combatant to lose its next turn.
- A hero at 0 Health is Downed for the encounter.
- Defeat all enemies to win. Lose all heroes to fail the encounter.

## Prototype Party

- **Nyra:** Fast ranged damage and light protection
- **Elowen:** Magic damage, healing, and strong shields
- **Brann:** Durable melee damage, control, and self-healing

## Prototype Enemies

- **Ashfang:** Targets the living hero with the lowest Health
- **Mireling:** Targets the living hero with the highest Health

The numbers are intentionally provisional. Playtesting should determine whether
turns present meaningful choices and whether Stamina creates useful tension.
