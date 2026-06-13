import { Drawer, ScrollArea, Stack, Text } from '@mantine/core'
import type { LogEntry } from '../../../game/combat/types'
import styles from './CombatLog.module.scss'

interface CombatLogProps {
  entries: LogEntry[]
  onClose: () => void
  opened: boolean
}

export function CombatLog({ entries, onClose, opened }: CombatLogProps) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title="Encounter log"
      position="bottom"
      size="65%"
      classNames={{ content: styles.logDrawer, header: styles.logDrawerHeader }}
    >
      <ScrollArea h="calc(65vh - 5rem)" offsetScrollbars>
        <Stack gap="xs" data-cy="combat-log">
          {[...entries].reverse().map((entry) => (
            <div
              key={entry.id}
              className={styles.logEntry}
              data-tone={entry.tone}
            >
              <Text size="10px" c="dimmed">
                Round {entry.round}
              </Text>
              <Text size="sm">{entry.message}</Text>
            </div>
          ))}
        </Stack>
      </ScrollArea>
    </Drawer>
  )
}
