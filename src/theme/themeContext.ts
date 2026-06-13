import { createContext, useContext } from 'react'
import { themes, type ThemeId } from './themes'

export const THEME_STORAGE_KEY = 'fellows-and-foes-theme'

export type FellowsThemeContextValue = {
  themeId: ThemeId
  setThemeId: (themeId: ThemeId) => void
  themeOptions: typeof themes
}

export const FellowsThemeContext =
  createContext<FellowsThemeContextValue | null>(null)

export function useFellowsTheme() {
  const context = useContext(FellowsThemeContext)

  if (!context) {
    throw new Error(
      'useFellowsTheme must be used within a FellowsThemeProvider',
    )
  }

  return context
}
