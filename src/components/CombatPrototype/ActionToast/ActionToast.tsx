import { Text } from '@mantine/core'
import type { LogEntry } from '../../../game/combat/types'
import styles from './ActionToast.module.scss'

export interface BattleNotice {
  id: number
  message: string
  tone: LogEntry['tone']
}

interface ActionToastProps {
  notice: BattleNotice
}

export function ActionToast({ notice }: ActionToastProps) {
  return (
    <div
      className={styles.toast}
      data-cy="battle-toast"
      data-tone={notice.tone}
      role="status"
    >
      <span>◆</span>
      <Text size="xs" fw={800}>
        {notice.message}
      </Text>
    </div>
  )
}
