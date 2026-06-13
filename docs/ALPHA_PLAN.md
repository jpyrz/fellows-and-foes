# Group Roguelite RPG: Alpha Plan

> Working design document for a small, playable React prototype.

## One-Sentence Pitch

A turn-based cooperative RPG where persistent characters explore a handcrafted
campaign, make choices, fight enemies, and earn permanent skills at checkpoints.

## What We Are Testing

The alpha only needs to answer three questions:

1. Is exploring an authored campaign through discrete turns fun?
2. Is combat interesting with a small number of skills?
3. Does choosing a permanent skill at a checkpoint make the character feel
   worth building?

If those three things work, the game has a foundation. Everything else can grow
from there.

## Design Pillars

### Authored Campaign, Variable Run

Each campaign has a predetermined story, map, encounters, enemies, rewards, and
ending. Runs differ because of player choices, dice rolls, character builds, and
random selections from the campaign's content pools.

### Persistent Characters

A character keeps every skill they permanently learn, even after a campaign
ends. Campaigns may limit which skills can be equipped at the beginning, but
they never remove ownership of those skills.

### Meaningful Turns

Every turn should ask the player to make a decision. Progress should not depend
on repetitive clicking, grinding, or collecting a constant stream of minor
loot.

### Checkpoint Progression

Normal enemies do not drop randomized equipment. Important progression happens
at authored checkpoints, where each character chooses one reward from a small
selection.

### Solo First, Multiplayer Ready

The first alpha is playable by one person controlling a party. The rules and
game state should later support friends controlling their own characters without
requiring the core game to be redesigned.

## Alpha Scope

The first playable build contains:

- One short campaign lasting roughly 30-60 minutes
- One player controlling a party of three characters
- One small map with 6-8 connected locations
- One prologue
- Three normal encounters
- One optional encounter
- One boss
- Two checkpoints
- Four character stats
- Six starting skills
- Six checkpoint skills
- Three enemy types
- Turn-based combat
- Basic dialogue and skill checks
- Local browser persistence
- One campaign ending

The goal is a complete miniature campaign, not a collection of disconnected
systems.

## Not in the Alpha

- Online accounts
- Live or asynchronous multiplayer
- Matchmaking
- Character trading
- Crafting
- Large inventories
- Equipment rarity
- Procedural maps
- Multiple campaigns
- Branching endings
- Permanent death
- Complex faction reputation
- Character relationships
- Advanced NPC AI
- User-created campaigns

These are not rejected ideas. They are simply outside the first test.

## Core Game Loop

```text
Create a party
      |
Read the current campaign scene
      |
Choose a location or interaction
      |
Explore, talk, investigate, or fight
      |
Spend health and skill resources
      |
Reach a checkpoint
      |
Choose one permanent skill per character
      |
Adjust equipped skills
      |
Continue toward the boss
      |
Complete or fail the campaign
```

## Campaign Structure

The alpha campaign is a directed map rather than an open world.

```text
Prologue
   |
Village
   |\
   | Ruined Chapel (optional)
   |
Old Road
   |
Checkpoint One
   |\
   | Watchtower
   |
The Gate
   |
Checkpoint Two
   |
Boss
```

Some locations contain combat. Others contain dialogue, investigation, a skill
check, or a choice that changes a later encounter.

## Character Creation

For the alpha, character creation should take only a few minutes.

Each character chooses:

- Name
- Portrait or color
- Background
- Personality trait
- Stat allocation
- Two starting skills

### Stats

Use four stats:

| Stat | Purpose |
| --- | --- |
| **Might** | Physical force, health, heavy attacks |
| **Finesse** | Speed, accuracy, stealth |
| **Mind** | Investigation, knowledge, technical magic |
| **Spirit** | Willpower, social influence, mystical magic |

Assign the values `3, 2, 1, 1`.

### Backgrounds

Include three backgrounds:

- **Soldier:** Bonus on checks involving warfare or endurance
- **Scholar:** Bonus on checks involving lore or investigation
- **Outsider:** Bonus on checks involving survival or unusual creatures

Backgrounds may unlock special choices in authored scenes.

### Personality Traits

Include three traits:

- **Bold:** Bonus when taking a direct risk
- **Cautious:** Bonus when detecting danger or defending
- **Compassionate:** Bonus when helping or persuading

For the alpha, traits only grant benefits and unlock occasional choices. Trait
drawbacks can be tested later.

## Skills

Skills are the main source of combat strategy and permanent character growth.

Each skill defines:

- Name
- Description
- Stat requirement, if any
- Resource cost
- Target
- Mechanical effect
- Cooldown, if any

Example:

```text
Shield Bash
Requirement: Might 2
Cost: 1 Stamina
Effect: Deal 3 damage and Stagger the target for one turn.
```

### Starting Skills

Create six broadly useful starting skills:

- Two physical
- Two agile or tactical
- Two magical or support

Each character selects two.

### Equipped Skills

A character may equip three skills during the alpha. Skills can be changed at a
checkpoint.

### Permanent Skill Library

When a character learns a skill, it is added permanently to that character's
library.

At the beginning of a campaign, the character equips only skills allowed by
that campaign's starting rules. For the alpha:

- Equip up to two previously learned skills at campaign start
- Checkpoint One unlocks the third equipped skill slot
- Stronger checkpoint skills may have stat requirements

This is enough to test persistence without introducing tiers, skill capacity,
mastery, or prerequisite trees.

## Exploration Turns

Outside combat, the party acts together. The player selects one character to
lead each action.

Available actions depend on the current location:

- Move to a connected location
- Speak with an NPC
- Investigate
- Search for danger
- Use a skill
- Use a campaign object
- Rest when the location permits it

Authored scenes define their available interactions and consequences.

### Checks

Use:

`d20 + relevant stat + bonuses`

The scene sets the target number. The result is shown openly, including all
modifiers.

For the alpha, checks have two outcomes:

- **Success:** Receive the authored success result
- **Failure:** Receive the authored failure result

Neither outcome should prevent the campaign from continuing.

## Combat

Combat is turn-based and party-based. The solo player controls all three
characters.

### Combat Round

1. All combatants are placed in initiative order.
2. On a character's turn, choose one skill and a valid target.
3. On an enemy's turn, the game selects an action using simple authored rules.
4. Resolve damage, healing, and status effects.
5. Begin another round until one side is defeated.

### Character Resources

Each character has:

- Health
- Stamina
- Three equipped skill slots
- Up to one active status effect in the earliest prototype

Magic and physical techniques both use Stamina for now. Separate mana and
stamina systems can be considered after combat is proven fun.

### Positioning

The first version has no grid. Skills use simple targets:

- Self
- One ally
- One enemy
- All allies
- All enemies

Front and back rows may be added later if combat lacks positional strategy.

### Defeat

If one character reaches zero Health, they are Downed for the rest of that
combat.

If all characters are Downed, the campaign run fails. The player may restart
the campaign with the same persistent characters and owned skills.

## Checkpoints

Checkpoints are the primary source of recovery and progression.

At a checkpoint:

1. Restore the party's Health and Stamina.
2. Offer each character three skills.
3. Each character permanently learns one offered skill.
4. Allow equipped skills to be changed.
5. Save campaign progress.

### Skill Offers

For the alpha, each offer contains:

- One skill matching the character's highest stat
- One skill matching another stat they can use
- One random eligible skill

Avoid complicated personalization until the basic reward choice is proven fun.

## Campaign State

The game only tracks state that produces a visible consequence.

The alpha needs:

- Current location
- Completed locations
- Party health and stamina
- Skills owned and equipped
- One or two story flags
- Checkpoints reached
- Boss defeated

Example flags:

```text
chapel_explored
gate_guard_warned
```

A later scene may change based on these flags.

## Solo Mode

Solo mode is the alpha's default:

- One player creates and controls three characters
- All characters gain permanent skills
- Dialogue and story choices are made for the party
- Enemy turns are automated

This is not a separate ruleset. Future multiplayer replaces control of some
party members with other human players.

## Future Multiplayer Shape

Do not build this yet, but preserve this intended model:

- Each friend owns and controls one persistent character
- Exploration decisions may use a host, turn order, or group vote
- Each player controls their own character in combat
- Checkpoint rewards are chosen privately by each player
- The campaign persists between sessions

The alpha should keep campaign state separate from interface state so this is
possible later.

## Content Model

Campaign content should be stored as data rather than hard-coded into React
components.

The core content types are:

- Campaign
- Location
- Scene
- Choice
- Check
- Encounter
- Enemy
- Skill
- Checkpoint

This allows future campaigns to reuse the same game engine.

## Build Plan

### Milestone 1: Paper Simulation

Before building the full interface:

- Define three sample characters
- Define six starting skills
- Define three enemies
- Simulate one complete combat by hand
- Tune basic health, damage, and stamina values

Success means combat creates at least one meaningful decision per character.

### Milestone 2: Combat Prototype

Build one React screen containing:

- Three player characters
- One or two enemies
- Initiative order
- Skill selection
- Target selection
- Enemy automation
- Victory and defeat

Use fixed test characters and enemies. Do not build character creation yet.

### Milestone 3: Campaign Slice

Add:

- Prologue
- Directed location map
- One non-combat scene
- One skill check
- One normal combat
- One checkpoint
- One boss combat
- One ending

This is the first genuinely playable version.

### Milestone 4: Character Persistence

Add:

- Character creation
- Permanent skill libraries
- Equipped skill selection
- Browser save data
- Campaign restart using existing characters

### Milestone 5: Alpha Content

Expand the slice to the full 30-60 minute alpha scope and playtest it repeatedly.

Only after this milestone should asynchronous multiplayer be designed in detail.

## Decisions We Can Delay

- Whether the final game uses classes
- Equipment and traditional loot
- Skill tiers and mastery
- Character levels
- Account-wide progression
- Relationship systems
- Multiple endings
- Procedural generation
- How asynchronous turns work
- Monetization or campaign expansions

## Immediate Design Tasks

Before implementation, define:

1. The alpha campaign's premise and map
2. The six starting skills
3. The six checkpoint skills
4. The three enemy types and boss
5. The basic combat numbers

That is enough material to build and test the first combat prototype without
committing to the eventual size of the game.
