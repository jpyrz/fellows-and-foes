import { Button } from '@mantine/core'
import { GameShell } from '../../components/GameShell/GameShell'
import { useFellowsTheme } from '../../theme/themeContext'
import { themeIds } from '../../theme/themes'
import styles from './Settings.module.scss'

export function Settings() {
  const { setThemeId, themeId, themeOptions } = useFellowsTheme()

  return (
    <GameShell title="Settings">
      <div className={styles.settings}>
        <header>
          <span>Table preferences</span>
          <h1>Choose the lantern light.</h1>
          <p>
            Theme choices apply across the company ledger, campaign pages, and
            battle screen.
          </p>
        </header>

        <section className={styles.themeGrid}>
          {themeIds.map((optionId) => {
            const option = themeOptions[optionId]
            return (
              <button
                key={optionId}
                data-active={optionId === themeId || undefined}
                onClick={() => setThemeId(optionId)}
              >
                <span>{option.label}</span>
                <p>{option.description}</p>
                <div style={{ background: option.tokens['--ff-accent'] }} />
              </button>
            )
          })}
        </section>

        <Button color="brand" component="a" href="/">
          Return to ledger
        </Button>
      </div>
    </GameShell>
  )
}
