import '@mantine/core/styles.css'
import '../../src/index.scss'
import { mount } from 'cypress/react'
import type { ReactNode } from 'react'
import { AppProviders } from '../../src/providers/AppProviders'

Cypress.Commands.add('mount', (children: ReactNode) =>
  mount(<AppProviders>{children}</AppProviders>),
)
