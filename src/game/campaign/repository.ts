import type { GameSave } from './types'

const STORAGE_KEY = 'fellows-and-foes-save'

export const emptyGameSave: GameSave = {
  version: 1,
  character: null,
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

      return {
        version: 1,
        character: parsed.character ?? null,
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
