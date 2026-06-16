import type { GameSave } from './types'

const STORAGE_KEY = 'fellows-and-foes-save'

export const emptyGameSave: GameSave = {
  version: 1,
  character: null,
  characters: [],
  activeCharacterId: null,
  activeRuns: [],
  completedRuns: [],
}

export interface GameRepository {
  load(): GameSave
  save(data: GameSave): void
  clear(): void
}

export const localGameRepository: GameRepository = {
  load() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return emptyGameSave

      const parsed = JSON.parse(raw) as Partial<GameSave>
      if (parsed.version !== 1) return emptyGameSave
      const legacyCharacter = parsed.character ?? null
      const characters = parsed.characters?.length
        ? parsed.characters
        : legacyCharacter
          ? [legacyCharacter]
          : []
      const activeCharacterId =
        parsed.activeCharacterId ??
        legacyCharacter?.id ??
        characters[0]?.id ??
        null

      return {
        version: 1,
        character:
          characters.find((character) => character.id === activeCharacterId) ??
          legacyCharacter,
        characters,
        activeCharacterId,
        activeRuns: parsed.activeRuns ?? [],
        completedRuns: parsed.completedRuns ?? [],
      }
    } catch {
      return emptyGameSave
    }
  },
  save(data) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  },
  clear() {
    window.localStorage.removeItem(STORAGE_KEY)
  },
}
