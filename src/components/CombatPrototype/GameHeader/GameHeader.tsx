import { ActionIcon, Group, Menu, Text } from '@mantine/core'
import { useFellowsTheme } from '../../../theme/themeContext'
import { themeIds } from '../../../theme/themes'
import styles from './GameHeader.module.scss'

export function GameHeader() {
  const { setThemeId, themeId, themeOptions } = useFellowsTheme()

  return (
    <header className={styles.topBar}>
      <Group gap="sm" wrap="nowrap">
        <div className={styles.mark} aria-label="Fellows and Foes">
          F&F
        </div>
        <div className={styles.campaign}>
          <Text size="9px" c="brand" tt="uppercase" fw={900}>
            Campaign
          </Text>
          <Text className={styles.campaignTitle}>Road to Bellweather</Text>
        </div>
      </Group>

      <Menu position="bottom-end" shadow="md" width={220}>
        <Menu.Target>
          <ActionIcon
            className={styles.menuButton}
            size="lg"
            color="gray"
            variant="subtle"
            aria-label={`Theme: ${themeOptions[themeId].label}`}
          >
            <span aria-hidden="true">☰</span>
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>Campaign</Menu.Label>
          <Menu.Item disabled>Road to Bellweather</Menu.Item>
          <Menu.Divider />
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
    </header>
  )
}
