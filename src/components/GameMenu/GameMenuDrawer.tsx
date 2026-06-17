import { Button, Drawer, UnstyledButton } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  useInRouterContext,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { useGame } from '../../game/campaign/gameContext'
import styles from './GameMenuDrawer.module.scss'

interface GameMenuDrawerProps {
  campaignTitle?: string
}

export function GameMenuDrawer({ campaignTitle }: GameMenuDrawerProps) {
  const inRouter = useInRouterContext()

  if (!inRouter) {
    return <UnroutedGameMenuDrawer campaignTitle={campaignTitle} />
  }

  return <RoutedGameMenuDrawer campaignTitle={campaignTitle} />
}

function RoutedGameMenuDrawer({ campaignTitle }: GameMenuDrawerProps) {
  const [opened, { close, open }] = useDisclosure(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { runId } = useParams()
  const { getRun } = useGame()
  const run = runId ? getRun(runId) : undefined

  function go(path: string) {
    navigate(path)
    close()
  }

  return (
    <>
      <UnstyledButton
        className={styles.menuButton}
        aria-label="Open game menu"
        onClick={open}
      >
        <span />
        <span />
        <span />
      </UnstyledButton>
      <Drawer
        opened={opened}
        onClose={close}
        position="right"
        title={
          <div className={styles.drawerTitle}>
            <span>F&F</span>
            <strong>Company Menu</strong>
          </div>
        }
        styles={{
          content: { background: 'var(--ff-bg-panel)' },
          header: { background: 'var(--ff-bg-panel)' },
        }}
      >
        <div className={styles.drawer}>
          <section className={styles.menuHero}>
            <span>Fellows & Foes</span>
            <h2>{campaignTitle ?? run?.chapter ?? 'Company Ledger'}</h2>
            <p>
              Manage the company, inspect your party, tune the table, or step
              into the battle yard.
            </p>
          </section>

          <nav className={styles.navigation} aria-label="Game menu">
            <MenuItem
              active={location.pathname === '/'}
              eyebrow="Roster and runs"
              label="Company ledger"
              onClick={() => go('/')}
            />
            <MenuItem
              active={location.pathname === '/achievements'}
              eyebrow="Boasts and unlocks"
              label="Achievement log"
              onClick={() => go('/achievements')}
            />
            {run && (
              <>
                <MenuItem
                  active={location.pathname === `/campaign/${run.id}`}
                  eyebrow="Current chronicle"
                  label="Campaign page"
                  onClick={() => go(`/campaign/${run.id}`)}
                />
                <MenuItem
                  active={location.pathname === `/campaign/${run.id}/party`}
                  eyebrow="Fellows in the field"
                  label="Party view"
                  onClick={() => go(`/campaign/${run.id}/party`)}
                />
              </>
            )}
            <MenuItem
              active={location.pathname === '/settings'}
              eyebrow="Theme and preferences"
              label="Settings"
              onClick={() => go('/settings')}
            />
            <MenuItem
              active={location.pathname === '/battle-lab'}
              eyebrow="Prototype yard"
              label="Battle training"
              onClick={() => go('/battle-lab')}
            />
          </nav>

          <div className={styles.footer}>
            <span>Alpha build</span>
            <strong>The Old Road is ready.</strong>
          </div>
        </div>
      </Drawer>
    </>
  )
}

function UnroutedGameMenuDrawer({ campaignTitle }: GameMenuDrawerProps) {
  const [opened, { close, open }] = useDisclosure(false)

  return (
    <>
      <UnstyledButton
        className={styles.menuButton}
        aria-label="Open game menu"
        onClick={open}
      >
        <span />
        <span />
        <span />
      </UnstyledButton>
      <Drawer
        opened={opened}
        onClose={close}
        position="right"
        title={
          <div className={styles.drawerTitle}>
            <span>F&F</span>
            <strong>Company Menu</strong>
          </div>
        }
        styles={{
          content: { background: 'var(--ff-bg-panel)' },
          header: { background: 'var(--ff-bg-panel)' },
        }}
      >
        <div className={styles.drawer}>
          <section className={styles.menuHero}>
            <span>Fellows & Foes</span>
            <h2>{campaignTitle ?? 'Battle Training'}</h2>
            <p>Open the full app to access ledger, party, and settings links.</p>
          </section>
        </div>
      </Drawer>
    </>
  )
}

function MenuItem({
  active,
  eyebrow,
  label,
  onClick,
}: {
  active: boolean
  eyebrow: string
  label: string
  onClick(): void
}) {
  return (
    <Button
      className={styles.menuItem}
      data-active={active || undefined}
      fullWidth
      justify="space-between"
      variant="subtle"
      onClick={onClick}
    >
      <span>
        <small>{eyebrow}</small>
        <strong>{label}</strong>
      </span>
      <i>›</i>
    </Button>
  )
}
