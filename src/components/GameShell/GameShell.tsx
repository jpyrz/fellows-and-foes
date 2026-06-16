import { UnstyledButton } from '@mantine/core'
import type { PropsWithChildren, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { GameMenuDrawer } from '../GameMenu/GameMenuDrawer'
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
  const navigate = useNavigate()

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
          <GameMenuDrawer campaignTitle={title} />
        </div>
      </header>

      <main className={styles.content}>{children}</main>
    </div>
  )
}
