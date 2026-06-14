/// <reference types="cypress" />

import { CombatPrototype } from './components/CombatPrototype/CombatPrototype'
import { createInitialCombatState } from './game/combat/engine'

function resolvePendingAction() {
  cy.get('[data-cy="roll-trigger"]').click()
  cy.get('[data-cy="action-roll-overlay"]').should('contain.text', 'Result')
  cy.contains('button', 'Continue').click()
  cy.get('[data-cy="hero-action-overlay"]').should('be.visible')
  cy.get('[data-cy="hero-action-overlay"]').should('not.exist')
}

function selectSkillAndTarget(skillId: string, targetId: string) {
  cy.get(`[data-cy="skill-${skillId}"]`).click()
  cy.get(`[data-cy="target-${targetId}"]`).click()
}

describe('<CombatPrototype />', () => {
  beforeEach(() => {
    cy.viewport(430, 900)
    cy.clearLocalStorage()
  })

  it('resolves a hero action, automates the enemy, and advances the turn', () => {
    cy.mount(<CombatPrototype initialState={createInitialCombatState(423)} />)

    cy.get('[data-cy="active-turn"]').should('contain.text', 'Nyra')
    selectSkillAndTarget('quick-shot', 'ashfang')

    cy.get('[data-cy="action-roll-overlay"]')
      .should('be.visible')
      .and('contain.text', 'Ready to roll')
      .and('contain.text', 'Roll d20 + 4 against Defense 13')
    cy.get('[data-cy="action-roll-overlay"]')
      .contains('button', 'Back')
      .should('be.visible')
    cy.get('[data-cy="active-turn"]').should('contain.text', 'Nyra')
    cy.get('[data-cy="ashfang-health"]').should('contain.text', '20/20')

    cy.get('[data-cy="roll-trigger"]').click()
    cy.get('[data-cy="action-roll-overlay"]').should('contain.text', 'Rolling')
    cy.get('[data-cy="action-roll-overlay"]').should('contain.text', 'Result')
    cy.get('[data-cy="action-roll-overlay"]')
      .contains('button', 'Back')
      .should('not.exist')
    cy.get('[data-cy="settled-die"]').should('be.visible')
    cy.get('[data-cy="action-verdict"]').should('contain.text', 'Success')
    cy.get('[data-cy="active-turn"]').should('contain.text', 'Nyra')
    cy.contains('button', 'Continue').click()

    cy.get('[data-cy="hero-action-overlay"]')
      .should('be.visible')
      .and('contain.text', 'Hero attack')
      .and('contain.text', 'Nyra readies Quick Shot')
      .and('contain.text', 'Ashfang')
    cy.get('[data-cy="hero-action-overlay"]').should(
      'contain.text',
      'Nyra uses Quick Shot',
    )
    cy.get('[data-feedback]').should('not.exist')
    cy.get('[data-cy="hero-action-overlay"]').should('contain.text', 'Hit')
    cy.get('[data-cy="hero-action-overlay"]').should('not.exist')
    cy.get('[data-feedback]').should('not.exist')
    cy.get('[data-cy="turn-announcement"]')
      .should('be.visible')
      .and('have.attr', 'data-team', 'enemies')
      .and('contain.text', 'Enemy Turn')
      .and('contain.text', 'Ashfang advances')
    cy.get('[data-cy="turn-announcement"]').should('not.exist')
    cy.get('[data-cy="enemy-turn-overlay"]')
      .should('be.visible')
      .and('contain.text', 'Enemy turn')
      .and('contain.text', 'Ashfang')
      .and('contain.text', 'Elowen')
    cy.get('[data-feedback]').should('not.exist')
    cy.get('[data-cy="enemy-turn-overlay"]').should('not.exist')
    cy.get('[data-feedback]').should('not.exist')
    cy.get('[data-cy="turn-announcement"]')
      .should('be.visible')
      .and('have.attr', 'data-team', 'heroes')
      .and('contain.text', 'Your Turn')
      .and('contain.text', 'Elowen is ready')
    cy.get('[data-cy="turn-announcement"]').should('not.exist')
    cy.get('[data-cy="active-turn"]').should('contain.text', 'Elowen')
    cy.contains('button', 'Log').click()
    cy.get('[data-cy="combat-log"]')
      .should('contain.text', 'Nyra')
      .and('contain.text', 'Ashfang')
  })

  it('spends stamina and allows support skills to target allies', () => {
    cy.mount(<CombatPrototype />)

    selectSkillAndTarget('twin-strike', 'mireling')
    resolvePendingAction()
    cy.get('[data-cy="nyra-stamina"]').should('contain.text', '1/4')
    cy.get('[data-cy="active-turn"]', { timeout: 10000 }).should(
      'contain.text',
      'Elowen',
    )

    selectSkillAndTarget('aegis', 'brann')
    cy.get('[data-cy="action-roll-overlay"]').should(
      'contain.text',
      'Ready to invoke',
    )
    cy.get('[data-cy="roll-trigger"]').click()
    cy.get('[data-cy="action-roll-overlay"]').should('contain.text', 'Result')
    cy.contains('button', 'Continue').click()
    cy.get('[data-cy="hero-action-overlay"]')
      .should('be.visible')
      .and('have.attr', 'data-effect', 'shield')
      .and('contain.text', 'Protection')
    cy.get('[data-cy="hero-action-overlay"]').should(
      'contain.text',
      'Shielded',
    )
    cy.get('[data-cy="hero-action-overlay"]').should('not.exist')
    cy.get('[data-cy="active-turn"]', { timeout: 10000 }).should(
      'contain.text',
      'Brann',
    )
    cy.contains('button', 'Log').click()
    cy.get('[data-cy="combat-log"]').should(
      'contain.text',
      'Elowen uses Aegis. Brann gains 7 shield.',
    )
    cy.get('body').type('{esc}')
    cy.get('[data-cy="active-turn"]').should('contain.text', 'Brann')
  })

  it('clearly presents a failed roll and keeps the settled die visible', () => {
    cy.mount(<CombatPrototype initialState={createInitialCombatState(1)} />)

    selectSkillAndTarget('quick-shot', 'ashfang')
    cy.get('[data-cy="roll-trigger"]').click()

    cy.get('[data-cy="action-verdict"]')
      .should('be.visible')
      .and('contain.text', 'Failure')
    cy.get('[data-cy="settled-die"]')
      .should('be.visible')
      .and('have.attr', 'aria-label', 'Rolled 5 on a d20')
    cy.get('[data-cy="ashfang-health"]').should('contain.text', '20/20')
  })

  it('allows backing out before rolling without committing the action', () => {
    cy.mount(<CombatPrototype initialState={createInitialCombatState(1)} />)

    selectSkillAndTarget('quick-shot', 'ashfang')
    cy.get('[data-cy="action-roll-overlay"]').should('be.visible')
    cy.get('[data-cy="action-roll-overlay"]')
      .contains('button', 'Back')
      .click()

    cy.get('[data-cy="action-roll-overlay"]').should('not.exist')
    cy.get('[data-cy="target-ashfang"]').should('be.visible')
    cy.get('[data-cy="nyra-stamina"]').should('contain.text', '4/4')
    cy.get('[data-cy="ashfang-health"]').should('contain.text', '20/20')

    cy.get('[data-cy="target-ashfang"]').click()
    cy.get('[data-cy="roll-trigger"]').click()
    cy.get('[data-cy="settled-die"]').should(
      'have.attr',
      'aria-label',
      'Rolled 5 on a d20',
    )
  })

  it('shows ability details and targets immediately after selection', () => {
    cy.mount(<CombatPrototype />)

    cy.get('[data-cy="skill-quick-shot"]').click()
    cy.contains('h2', 'Quick Shot').should('be.visible')
    cy.get('[data-cy="target-ashfang"]').should('be.visible')
    cy.contains('Choose a marked enemy').should('be.visible')
    cy.contains('Cast on').next().should('contain.text', 'Enemy')
  })

  it('keeps secondary unit stats behind inspection', () => {
    cy.mount(<CombatPrototype />)

    cy.contains('DEF 12').should('not.exist')
    cy.get('button[aria-label="Inspect Ashfang"]').click()
    cy.get('[data-cy="unit-inspector"]')
      .should('contain.text', 'Ember Stalker')
      .and('contain.text', 'Defense')
      .and('contain.text', 'Pounces on the living hero')

    cy.get('button[aria-label="Close unit details"]').click()
    cy.get('[data-cy="unit-inspector"]').should('not.exist')
  })

  it('ends the encounter when the final enemy is defeated', () => {
    const winningState = createInitialCombatState(1)
    winningState.combatants = winningState.combatants.map((combatant) => {
      if (combatant.id === 'ashfang') {
        return { ...combatant, health: 1, defense: 0 }
      }

      if (combatant.id === 'mireling') {
        return { ...combatant, health: 0 }
      }

      return combatant
    })

    cy.mount(<CombatPrototype initialState={winningState} />)
    selectSkillAndTarget('quick-shot', 'ashfang')
    resolvePendingAction()

    cy.get('[data-cy="combat-status"]').should('contain.text', 'victory')
    cy.contains('h2', 'The road is yours.').should('be.visible')
  })

  it('ends the encounter when the entire party is downed', () => {
    const losingState = createInitialCombatState(1)
    losingState.combatants = losingState.combatants.map((combatant) => {
      if (combatant.id === 'nyra') {
        return { ...combatant, health: 1, defense: 0 }
      }

      if (combatant.team === 'heroes') {
        return { ...combatant, health: 0 }
      }

      if (combatant.id === 'ashfang') {
        return { ...combatant, health: 50, maxHealth: 50 }
      }

      return combatant
    })

    cy.mount(<CombatPrototype initialState={losingState} />)
    selectSkillAndTarget('quick-shot', 'ashfang')
    resolvePendingAction()

    cy.get('[data-cy="combat-status"]', { timeout: 10000 }).should(
      'contain.text',
      'defeat',
    )
    cy.contains('h2', 'The expedition has fallen.').should('be.visible')
  })

  it('uses the full viewport without creating a simulated device frame', () => {
    cy.viewport(1280, 720)
    cy.mount(<CombatPrototype />)

    cy.get('[data-cy="combatant-ashfang"]').should('be.visible')
    cy.get('[data-cy="skill-quick-shot"]').should('be.visible')
    cy.document().then((document) => {
      expect(document.documentElement.scrollHeight).to.be.at.most(720)
    })
  })

  it('switches color themes and remembers the selection', () => {
    cy.mount(<CombatPrototype />)

    cy.get('html').should('have.attr', 'data-ff-theme', 'verdant')
    cy.get('button[aria-label="Theme: Verdant"]').click()
    cy.get('[role="menuitem"]').contains('Ember').click()

    cy.get('html').should('have.attr', 'data-ff-theme', 'ember')
    cy.window().then((window) => {
      expect(window.localStorage.getItem('fellows-and-foes-theme')).to.equal(
        'ember',
      )
    })
    cy.get('button[aria-label="Theme: Ember"]').should('be.visible')
  })
})
