import {
  createTheme,
  MantineProvider,
  type CSSVariablesResolver,
} from '@mantine/core'
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  FellowsThemeContext,
  THEME_STORAGE_KEY,
} from './themeContext'
import {
  defaultThemeId,
  isThemeId,
  themes,
  type ThemeId,
} from './themes'

function getInitialTheme(): ThemeId {
  if (typeof window === 'undefined') {
    return defaultThemeId
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  return isThemeId(storedTheme) ? storedTheme : defaultThemeId
}

type FellowsThemeProviderProps = {
  children: ReactNode
}

export function FellowsThemeProvider({
  children,
}: FellowsThemeProviderProps) {
  const [themeId, setThemeId] = useState<ThemeId>(getInitialTheme)
  const activeTheme = themes[themeId]

  const mantineTheme = useMemo(
    () =>
      createTheme({
        primaryColor: 'brand',
        colors: {
          brand: activeTheme.brand,
        },
        defaultRadius: 'md',
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        headings: {
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        },
      }),
    [activeTheme],
  )

  const cssVariablesResolver = useMemo<CSSVariablesResolver>(
    () => () => ({
      variables: activeTheme.tokens,
      light: {},
      dark: {},
    }),
    [activeTheme],
  )

  useEffect(() => {
    document.documentElement.dataset.ffTheme = themeId
    window.localStorage.setItem(THEME_STORAGE_KEY, themeId)
  }, [themeId])

  const contextValue = useMemo(
    () => ({
      themeId,
      setThemeId,
      themeOptions: themes,
    }),
    [themeId],
  )

  return (
    <FellowsThemeContext.Provider value={contextValue}>
      <MantineProvider
        theme={mantineTheme}
        cssVariablesResolver={cssVariablesResolver}
        forceColorScheme="dark"
      >
        {children}
      </MantineProvider>
    </FellowsThemeContext.Provider>
  )
}
