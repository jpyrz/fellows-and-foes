/// <reference types="cypress" />

import type { ReactNode } from 'react'

declare global {
  namespace Cypress {
    interface Chainable {
      mount(children: ReactNode): Chainable<void>
    }
  }
}

export {}
