import type { PropsWithChildren } from 'react'
import { FellowsThemeProvider } from '../theme/FellowsThemeProvider'

export function AppProviders({ children }: PropsWithChildren) {
  return <FellowsThemeProvider>{children}</FellowsThemeProvider>
}
