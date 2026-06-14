import type { PropsWithChildren } from 'react'
import { GameProvider } from '../game/campaign/GameProvider'
import { FellowsThemeProvider } from '../theme/FellowsThemeProvider'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <FellowsThemeProvider>
      <GameProvider>{children}</GameProvider>
    </FellowsThemeProvider>
  )
}
