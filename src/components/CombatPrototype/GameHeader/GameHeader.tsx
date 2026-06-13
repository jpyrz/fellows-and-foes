import { ActionIcon, Button, Group, Menu, Text } from '@mantine/core'
import { useFellowsTheme } from '../../../theme/themeContext'
import { themeIds } from '../../../theme/themes'
import styles from './GameHeader.module.scss'

interface GameHeaderProps {
  onOpenLog: () => void
  onReset: () => void
}

export function GameHeader({ onOpenLog, onReset }: GameHeaderProps) {
  const { setThemeId, themeId, themeOptions } = useFellowsTheme()

  return (
    <header className={styles.topBar}>
      <Group gap="xs">
        <div className={styles.mark} aria-label="Fellows and Foes">
          F&F
        </div>
        <div>
          <Text className={styles.location}>Old Road</Text>
          <Text size="10px" c="dimmed" tt="uppercase" fw={700}>
            First contact
          </Text>
        </div>
      </Group>

      <Group gap="xs">
        <Menu position="bottom-end" shadow="md" width={210}>
          <Menu.Target>
            <Button
              size="compact-xs"
              color="gray"
              variant="subtle"
              aria-label={`Theme: ${themeOptions[themeId].label}`}
            >
              Theme
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Color theme</Menu.Label>
            {themeIds.map((optionId) => {
              const option = themeOptions[optionId]

              return (
                <Menu.Item
                  key={optionId}
                  className={styles.themeOption}
                  data-active={optionId === themeId || undefined}
                  onClick={() => setThemeId(optionId)}
                >
                  <Text size="sm" fw={700}>
                    {option.label}
                  </Text>
                  <Text size="10px" c="dimmed">
                    {option.description}
                  </Text>
                </Menu.Item>
              )
            })}
          </Menu.Dropdown>
        </Menu>
        <Button
          size="compact-xs"
          color="gray"
          variant="subtle"
          onClick={onOpenLog}
        >
          Log
        </Button>
        <ActionIcon
          variant="subtle"
          color="gray"
          aria-label="Reset encounter"
          onClick={onReset}
        >
          ↻
        </ActionIcon>
      </Group>
    </header>
  )
}
