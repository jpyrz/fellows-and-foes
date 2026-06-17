import type {
  CampaignDefinition,
  PartyMemberSnapshot,
} from './types'
import { deriveCombatStats } from './rules'

const companionBase = [
  {
    id: 'brann',
    name: 'Brann',
    title: 'Shieldbearer',
    portrait: '/assets/portraits/brann.png',
    background: 'soldier' as const,
    trait: 'bold' as const,
    stats: { might: 3, finesse: 1, mind: 1, spirit: 2 },
    equippedSkillIds: ['iron-strike', 'shield-bash', 'second-wind'],
    inventory: [{ itemId: 'healing-draught', quantity: 1 }],
  },
  {
    id: 'nyra',
    name: 'Nyra',
    title: 'Wayfinder',
    portrait: '/assets/portraits/nyra.png',
    background: 'wayfarer' as const,
    trait: 'cautious' as const,
    stats: { might: 1, finesse: 3, mind: 2, spirit: 1 },
    equippedSkillIds: ['quick-shot', 'twin-strike', 'aegis'],
    inventory: [{ itemId: 'ember-flask', quantity: 1 }],
  },
  {
    id: 'elowen',
    name: 'Elowen',
    title: 'Ember Scholar',
    portrait: '/assets/portraits/elowen.png',
    background: 'scholar' as const,
    trait: 'curious' as const,
    stats: { might: 1, finesse: 1, mind: 3, spirit: 2 },
    equippedSkillIds: ['arc-bolt', 'mend', 'aegis'],
    inventory: [{ itemId: 'focus-elixir', quantity: 1 }],
  },
]

export const companionDefinitions: PartyMemberSnapshot[] = companionBase.map(
  (companion) => {
    const derived = deriveCombatStats(companion.stats)
    return {
      ...companion,
      owner: 'companion',
      level: 1,
      ...derived,
      health: derived.maxHealth,
      stamina: derived.maxStamina,
      unlockedSkillIds: companion.equippedSkillIds,
    }
  },
)

export const portraitOptions = [
  '/assets/portraits/nyra.png',
  '/assets/portraits/elowen.png',
  '/assets/portraits/brann.png',
  '/assets/portraits/lemurs/human_01.png',
  '/assets/portraits/lemurs/human_02.png',
  '/assets/portraits/lemurs/human_03.png',
  '/assets/portraits/lemurs/human_04.png',
  '/assets/portraits/lemurs/human_05.png',
  '/assets/portraits/lemurs/human_06.png',
  '/assets/portraits/lemurs/human_07.png',
  '/assets/portraits/lemurs/human_08.png',
  '/assets/portraits/lemurs/human_09.png',
  '/assets/portraits/lemurs/human_10.png',
  '/assets/portraits/lemurs/elf_01.png',
  '/assets/portraits/lemurs/elf_02.png',
  '/assets/portraits/lemurs/elf_03.png',
  '/assets/portraits/lemurs/elf_04.png',
  '/assets/portraits/lemurs/elf_05.png',
  '/assets/portraits/lemurs/dwarf_01.png',
  '/assets/portraits/lemurs/dwarf_02.png',
  '/assets/portraits/lemurs/dwarf_03.png',
  '/assets/portraits/lemurs/halfling_01.png',
  '/assets/portraits/lemurs/halfling_02.png',
  '/assets/portraits/lemurs/gnome_01.png',
  '/assets/portraits/lemurs/gnome_02.png',
]

export const oldRoadCampaign: CampaignDefinition = {
  id: 'the-old-road',
  title: 'The Old Road',
  subtitle: 'First Contact',
  description:
    'Travelers are vanishing near Gloamfen, where smoke hangs over a road the maps insist is abandoned.',
  recommendedLevel: '1–2',
  openingSceneId: 'prologue',
  scenes: {
    prologue: {
      id: 'prologue',
      chapter: 'First Contact',
      title: 'The Road Remembers',
      location: 'Gloamfen Verge',
      artworkTone: 'A drowned road fading beneath green fog',
      text: 'Three travelers entered Gloamfen before the last bell. None returned. At dusk, your party finds their wagon abandoned beside the Old Road, its wheels still turning in wind that cannot be felt.',
      actions: [
        {
          id: 'enter-gaol',
          label: 'Follow the drag marks',
          description: 'Descend from the road into the flooded ruins.',
          category: 'travel',
          approach: 'risky',
          successMoment: {
            title: 'The Road Drops Away',
            text: 'The party crosses the first threshold and cannot simply turn back.',
            tone: 'route',
          },
          successText:
            'The trail ends beneath a broken watchtower. The floor gives way, dropping the party into cold black water and rusted bars.',
          successEffects: [
            {
              type: 'add-journal',
              title: 'The Road Remembers',
              text: 'The missing travelers left a trail toward a ruined watchtower.',
            },
            { type: 'navigate-scene', sceneId: 'flooded-gaol' },
          ],
        },
      ],
    },
    'flooded-gaol': {
      id: 'flooded-gaol',
      chapter: 'First Contact',
      title: 'Flooded Gaol',
      location: 'Beneath the Watchtower',
      artworkTone: 'Iron bars reflected in ankle-deep black water',
      text: 'The chamber is an old holding cell. Water presses through the stones, runes glow beneath the surface, and something beyond the wall breathes in slow, wet pulls. The exit gate is chained from the far side.',
      actions: [
        {
          id: 'inspect-marks',
          label: 'Inspect the claw marks',
          description: 'Study the wall and learn what hunts beyond it.',
          category: 'inspect',
          approach: 'clever',
          check: {
            stat: 'mind',
            dc: 11,
            stakes:
              'Success reveals a battle weakness. Failure alerts the hunters and closes this lead.',
            matchingBackgrounds: ['scholar', 'wayfarer'],
            matchingTraits: ['curious'],
          },
          retryPolicy: 'closed',
          successMoment: {
            title: 'Weakness Revealed',
            text: 'Ashfang defenses will be lower when battle begins.',
            tone: 'discovery',
          },
          failureMoment: {
            title: 'The Hunters Stir',
            text: 'Something hears the scraping stone. The mire will be less forgiving.',
            tone: 'danger',
          },
          successText:
            'The marks belong to ashfangs. Their vision blurs in heavy smoke; the party can exploit that hesitation.',
          failureText:
            'Water ruins the oldest marks. As you pull away, claws scrape somewhere beyond the wall.',
          successEffects: [
            { type: 'set-flag', flag: 'ashfang-weakness' },
            {
              type: 'add-journal',
              title: 'Hunter in the Smoke',
              text: 'Ashfangs lose their bearings when the smoke grows dense.',
            },
          ],
          failureEffects: [{ type: 'set-flag', flag: 'ashfang-alerted' }],
        },
        {
          id: 'call-through-wall',
          label: 'Call to the prisoner',
          description: 'A frightened voice answers from the next chamber.',
          category: 'talk',
          approach: 'social',
          check: {
            stat: 'spirit',
            dc: 8,
            stakes:
              'Success earns hidden supplies. Failure closes this voice off for now.',
            matchingTraits: ['compassionate'],
          },
          retryPolicy: 'another-hero',
          successMoment: {
            title: 'Supplies Found',
            text: 'A healing draught joins the acting fellow’s pack.',
            tone: 'reward',
          },
          failureMoment: {
            title: 'Trust Fractures',
            text: 'The stranger falls silent. Another fellow may still find the right words.',
            tone: 'setback',
          },
          successText:
            'A hand reaches through a drainage gap and passes you a sealed healing draught.',
          failureText:
            'The stranger mistakes your questions for a threat and falls silent.',
          successEffects: [
            {
              type: 'grant-item',
              itemId: 'healing-draught',
              quantity: 1,
            },
          ],
        },
        {
          id: 'study-runes',
          label: 'Study the drowned runes',
          description: 'Trace the magic beneath the water.',
          category: 'magic',
          approach: 'magic',
          check: {
            stat: 'mind',
            dc: 11,
            stakes:
              'Success unlocks the safest escape. Failure means you need leverage before trying again.',
            matchingBackgrounds: ['scholar'],
            matchingTraits: ['curious'],
          },
          retryPolicy: 'after-advantage',
          successMoment: {
            title: 'Safer Route Opened',
            text: 'The gate can be folded instead of forced.',
            tone: 'route',
          },
          failureMoment: {
            title: 'Pattern Resists',
            text: 'The runes do not reject you, but they demand another clue.',
            tone: 'setback',
          },
          successText:
            'The runes are not a lock but a hinge. Their final symbol can fold the gate briefly out of the world.',
          failureText:
            'The pattern resists you. Another clue may make its rhythm clear.',
          successEffects: [
            { type: 'set-flag', flag: 'runes-understood' },
            { type: 'reveal-action', actionId: 'fold-gate' },
          ],
        },
        {
          id: 'fold-gate',
          label: 'Fold the gate',
          description: 'Complete the rune and step through the iron.',
          category: 'magic',
          approach: 'safe',
          hiddenUntilRevealed: true,
          requiredFlags: ['runes-understood'],
          successMoment: {
            title: 'Clean Escape',
            text: 'No wounds. No noise. The road opens without protest.',
            tone: 'route',
          },
          successText:
            'The bars flatten into silver lines. The party steps through before the gaol remembers its shape.',
          successEffects: [
            { type: 'set-flag', flag: 'safe-escape' },
            { type: 'open-map' },
          ],
        },
        {
          id: 'pick-drain-lock',
          label: 'Work the drain lock',
          description: 'Reach through the flooded channel and pick the mechanism.',
          category: 'inspect',
          approach: 'sneaky',
          check: {
            stat: 'finesse',
            dc: 11,
            stakes: 'Escape quietly. Failure costs health but leaves another route.',
            matchingBackgrounds: ['scoundrel'],
            matchingTraits: ['cautious'],
          },
          retryPolicy: 'closed',
          successMoment: {
            title: 'Quiet Passage',
            text: 'A narrow route opens without drawing the mire’s attention.',
            tone: 'route',
          },
          failureMoment: {
            title: 'Wounded',
            text: 'The acting fellow loses health, but the campaign can continue.',
            tone: 'setback',
          },
          successText:
            'The mechanism clicks. A narrow reed-choked passage opens behind the gate.',
          failureText:
            'The rusted teeth snap shut on your arm before you pull free.',
          successEffects: [
            { type: 'set-flag', flag: 'safe-escape' },
            { type: 'open-map' },
          ],
          failureEffects: [{ type: 'adjust-health', amount: -3 }],
        },
        {
          id: 'break-chain',
          label: 'Break the chain',
          description: 'Force the gate before the water rises further.',
          category: 'force',
          approach: 'force',
          check: {
            stat: 'might',
            dc: 14,
            stakes: 'Escape directly. Failure injures the acting hero.',
            matchingBackgrounds: ['soldier'],
            matchingTraits: ['bold'],
          },
          retryPolicy: 'another-hero',
          successMoment: {
            title: 'Brute Escape',
            text: 'The gate breaks, but every creature nearby hears it.',
            tone: 'route',
          },
          failureMoment: {
            title: 'Iron Bites Back',
            text: 'The acting fellow is injured. Another strong arm may still try.',
            tone: 'setback',
          },
          successText:
            'The chain tears free with a crack that rolls through the drowned halls.',
          failureText:
            'The chain holds. The recoil drives iron into your shoulder.',
          successEffects: [
            { type: 'set-flag', flag: 'noisy-escape' },
            { type: 'open-map' },
          ],
          failureEffects: [{ type: 'adjust-health', amount: -4 }],
        },
        {
          id: 'wade-through-breach',
          label: 'Wade through the breach',
          description:
            'Take the flooded crawlspace. It will hurt, but it cannot hold you.',
          category: 'travel',
          approach: 'desperate',
          successMoment: {
            title: 'Bloodied Escape',
            text: 'The party reaches open air, wounded but moving.',
            tone: 'setback',
          },
          successText:
            'The party crawls through broken stone and freezing runoff. You emerge bloodied beneath the open sky.',
          successEffects: [
            { type: 'adjust-health', amount: -2 },
            { type: 'open-map' },
          ],
        },
      ],
    },
    'reedway-cache': {
      id: 'reedway-cache',
      chapter: 'First Contact',
      title: 'Reedway Cache',
      location: 'The Sunken Verge',
      artworkTone: 'A leather satchel caught high in silver reeds',
      text: 'A path known only to old wayfinders curls away from the mire. Someone lashed a supply satchel above the flood line, then left in a hurry.',
      actions: [
        {
          id: 'search-cache',
          label: 'Open the satchel',
          description: 'Take what the missing travelers could not carry.',
          category: 'inspect',
          approach: 'safe',
          successMoment: {
            title: 'Cache Found',
            text: 'An ember flask is added to the acting fellow’s pack.',
            tone: 'reward',
          },
          successText:
            'Inside rests an ember flask wrapped in oilcloth and a map marked with a warning: do not trust the smoke.',
          successEffects: [
            { type: 'grant-item', itemId: 'ember-flask', quantity: 1 },
            { type: 'set-flag', flag: 'cache-found' },
            { type: 'open-map' },
          ],
        },
      ],
    },
    'mire-approach': {
      id: 'mire-approach',
      chapter: 'First Contact',
      title: 'Smoke in the Mire',
      location: 'Gloamfen Crossing',
      artworkTone: 'Eyes moving behind curtains of ember-red smoke',
      text: 'The Old Road rises from the water ahead. Ashfangs prowl between its stones while a mireling heaves itself from the bog, dragging half the road with it.',
      actions: [
        {
          id: 'begin-smoke-battle',
          label: 'Stand together',
          description: 'Enter battle with the party state you carried here.',
          category: 'combat',
          approach: 'combat',
          successMoment: {
            title: 'Battle Joined',
            text: 'Your exploration choices now shape the fight.',
            tone: 'battle',
          },
          successText: 'Steel clears leather. The mire answers.',
          successEffects: [
            { type: 'start-encounter', encounterId: 'smoke-in-the-mire' },
          ],
        },
      ],
    },
    'after-battle': {
      id: 'after-battle',
      chapter: 'First Contact',
      title: 'The Wayfarer Shrine',
      location: 'Beyond Gloamfen Crossing',
      artworkTone: 'A warm shrine lamp beneath an ancient stone arch',
      text: 'Beyond the fallen creatures, the road reaches a dry island and an old wayfarer shrine. Its lamp wakes as your party approaches. For the first time all night, the fog draws back.',
      actions: [
        {
          id: 'rest-at-shrine',
          label: 'Make camp',
          description: 'Restore the party and claim the shrine’s reward.',
          category: 'travel',
          approach: 'safe',
          successMoment: {
            title: 'Checkpoint Reached',
            text: 'Rest, recover, and choose new strength before the road closes.',
            tone: 'reward',
          },
          successText:
            'The shrine accepts your offering. Old techniques return as if remembered from another life.',
          successEffects: [],
        },
      ],
    },
    epilogue: {
      id: 'epilogue',
      chapter: 'First Contact',
      title: 'A Road Reopened',
      location: 'Dawn at Gloamfen',
      artworkTone: 'Morning light touching an old road through the reeds',
      text: 'At dawn, the surviving travelers follow the shrine lamp home. The Old Road remains, but it no longer feels abandoned. Something farther along it now knows your names.',
      actions: [],
    },
  },
  mapNodes: [
    { id: 'flooded-gaol', label: 'Flooded Gaol', sceneId: 'flooded-gaol' },
    {
      id: 'reedway-cache',
      label: 'Reedway Cache',
      sceneId: 'reedway-cache',
      optional: true,
    },
    {
      id: 'smoke-in-the-mire',
      label: 'Smoke in the Mire',
      sceneId: 'mire-approach',
    },
  ],
}

export const campaignDefinitions = {
  [oldRoadCampaign.id]: oldRoadCampaign,
}

export function getCampaignDefinition(campaignId: string) {
  return campaignDefinitions[campaignId as keyof typeof campaignDefinitions]
}
