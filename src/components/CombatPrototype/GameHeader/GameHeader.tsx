import { Group, Text } from '@mantine/core'
import { GameMenuDrawer } from '../../GameMenu/GameMenuDrawer'
import styles from './GameHeader.module.scss'

export function GameHeader({ campaignTitle = 'Road to Bellweather' }) {
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
          <Text className={styles.campaignTitle}>{campaignTitle}</Text>
        </div>
      </Group>

      <GameMenuDrawer campaignTitle={campaignTitle} />
    </header>
  )
}
