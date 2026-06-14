import type { ItemDefinition } from './types'

export const itemDefinitions = {
  'healing-draught': {
    id: 'healing-draught',
    name: 'Healing Draught',
    description: 'A bitter red tonic that closes wounds quickly.',
    icon: '/assets/icons/items/healing-draught.svg',
    category: 'battle',
    target: 'ally',
    effect: { type: 'heal', amount: 6 },
    maxStack: 3,
  },
  'ember-flask': {
    id: 'ember-flask',
    name: 'Ember Flask',
    description: 'Shatters on impact and erupts in bottled flame.',
    icon: '/assets/icons/items/ember-flask.svg',
    category: 'battle',
    target: 'enemy',
    effect: { type: 'damage', amount: 5 },
    maxStack: 3,
  },
  'guard-tonic': {
    id: 'guard-tonic',
    name: 'Guard Tonic',
    description: 'Hardens the air around an ally into a temporary ward.',
    icon: '/assets/icons/items/guard-tonic.svg',
    category: 'battle',
    target: 'ally',
    effect: { type: 'shield', amount: 6 },
    maxStack: 3,
  },
  'focus-elixir': {
    id: 'focus-elixir',
    name: 'Focus Elixir',
    description: 'Restores clarity and a measure of spent stamina.',
    icon: '/assets/icons/items/focus-elixir.svg',
    category: 'battle',
    target: 'ally',
    effect: { type: 'stamina', amount: 2 },
    maxStack: 3,
  },
} satisfies Record<string, ItemDefinition>

export function getItemDefinition(itemId: string) {
  return itemDefinitions[itemId as keyof typeof itemDefinitions]
}
