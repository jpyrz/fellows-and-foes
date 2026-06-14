import { Button, Drawer, UnstyledButton } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import type { PropsWithChildren, ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styles from './GameShell.module.scss'

interface GameShellProps extends PropsWithChildren {
  eyebrow?: string
  title?: string
  actions?: ReactNode
  immersive?: boolean
}

export function GameShell({
  actions,
  children,
  eyebrow = 'Fellows & Foes',
  immersive = false,
  title,
}: GameShellProps) {
  const [opened, { close, open }] = useDisclosure(false)
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className={styles.shell} data-immersive={immersive || undefined}>
      <header className={styles.header}>
        <UnstyledButton
          className={styles.brand}
          onClick={() => navigate('/')}
          aria-label="Return to dashboard"
        >
          <span className={styles.mark}>F&F</span>
          <span>
            <small>{eyebrow}</small>
            <strong>{title ?? 'The Company Ledger'}</strong>
          </span>
        </UnstyledButton>
        <div className={styles.actions}>
          {actions}
          <UnstyledButton
            className={styles.menu}
            aria-label="Open game menu"
            onClick={open}
          >
            <span />
            <span />
            <span />
          </UnstyledButton>
        </div>
      </header>

      <main className={styles.content}>{children}</main>

      <Drawer
        opened={opened}
        onClose={close}
        position="right"
        title="Fellows & Foes"
        styles={{
          content: { background: 'var(--ff-bg-panel)' },
          header: { background: 'var(--ff-bg-panel)' },
        }}
      >
        <div className={styles.navigation}>
          <Button
            variant={location.pathname === '/' ? 'filled' : 'subtle'}
            onClick={() => {
              navigate('/')
              close()
            }}
          >
            Company ledger
          </Button>
          <Button
            variant="subtle"
            onClick={() => {
              navigate('/battle-lab')
              close()
            }}
          >
            Battle training
          </Button>
        </div>
      </Drawer>
    </div>
  )
}
