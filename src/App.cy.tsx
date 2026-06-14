/// <reference types="cypress" />

import { CombatPrototype } from './components/CombatPrototype/CombatPrototype'
import {
  createInitialCombatState,
  getValidItemTargets,
  resolveHeroItem,
} from './game/combat/engine'

function resolvePendingAction() {
  cy.get('[data-cy="roll-trigger"]').click()
  cy.get('[data-cy="action-roll-overlay"]').should('contain.text', 'Result')
  cy.contains('button', 'Continue').click()
  cy.get('[data-action-actor]').should('be.visible')
  cy.get('[data-action-actor]').should('not.exist')
}

function finishEnemyTurn(expectHeroTurn = true) {
  cy.get('[data-cy="turn-announcement"]')
    .should('have.attr', 'data-team', 'enemies')
    .click()
  cy.get('[data-action-actor]').should('be.visible')
  cy.get('[data-action-actor]').should('not.exist')
  if (expectHeroTurn) {
    cy.get('[data-cy="turn-announcement"]')
      .should('have.attr', 'data-team', 'heroes')
      .click()
  }
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
    cy.mount(<CombatPrototype initialState={createInitialCombatState(553)} />)

    cy.get('[data-cy="active-turn"]').should('contain.text', 'Nyra')
    cy.get('[data-cy="active-initiative-marker"]').should('be.visible')
    selectSkillAndTarget('quick-shot', 'ashfang')

    cy.get('[data-cy="action-roll-overlay"]')
      .should('be.visible')
      .and('contain.text', 'Ready to roll')
      .and('contain.text', 'Roll d20 + 4 against Defense 14')
    cy.get('[data-cy="action-roll-overlay"]')
      .contains('button', 'Back')
      .should('be.visible')
    cy.get('[data-cy="active-turn"]').should('contain.text', 'Nyra')
    cy.get('[data-cy="ashfang-health"]').should('contain.text', '24/24')

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

    cy.get('[data-action-actor][data-action-phase="windup"]')
      .should('contain', 'Nyra')
      .and('have.attr', 'data-action-effect', 'damage')
    cy.get('[data-action-target]').should('contain', 'Ashfang')
    cy.get('[data-action-target][data-feedback="damage"]')
      .should('have.attr', 'data-action-phase', 'impact')
      .and('contain', 'Ashfang')
    cy.get('[data-action-actor]').should('not.exist')
    cy.get('[data-cy="turn-announcement"]')
      .should('be.visible')
      .and('have.attr', 'data-team', 'enemies')
      .and('contain.text', 'Enemy Turn')
      .and('contain.text', 'Ashfang advances')
      .click()
    cy.get('[data-action-actor][data-action-phase="windup"]')
      .should('contain', 'Ashfang')
      .and('have.attr', 'data-action-effect', 'damage')
    cy.get('[data-action-target]').should('contain', 'Elowen')
    cy.get('[data-action-actor]').should('not.exist')
    cy.get('[data-cy="turn-announcement"]')
      .should('be.visible')
      .and('have.attr', 'data-team', 'heroes')
      .and('contain.text', 'Your Turn')
      .and('contain.text', 'Elowen is ready')
      .click()
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
    finishEnemyTurn()
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
    cy.get('[data-action-actor][data-action-phase="windup"]')
      .should('be.visible')
      .and('have.attr', 'data-action-effect', 'shield')
      .and('contain', 'Elowen')
    cy.get('[data-action-target]').should('contain', 'Brann')
    cy.get('[data-action-target][data-feedback="shield"]').should(
      'have.attr',
      'data-action-phase',
      'impact',
    )
    cy.get('[data-action-actor]').should('not.exist')
    finishEnemyTurn()
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
    cy.get('[data-cy="ashfang-health"]').should('contain.text', '24/24')
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
    cy.get('[data-cy="ashfang-health"]').should('contain.text', '24/24')

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

  it('keeps skill details vertically centered for every target type', () => {
    cy.mount(<CombatPrototype />)

    cy.get('[data-cy="skill-quick-shot"]').click()
    cy.get('[data-cy="skill-detail"]').then(($detail) => {
      const enemyCenter = $detail[0].getBoundingClientRect()
      expect(enemyCenter.top + enemyCenter.height / 2).to.be.closeTo(450, 1)
    })

    cy.contains('button', 'Close').click()
    cy.get('[data-cy="skill-evasive-guard"]').click()
    cy.get('[data-cy="skill-detail"]').then(($detail) => {
      const allyCenter = $detail[0].getBoundingClientRect()
      expect(allyCenter.top + allyCenter.height / 2).to.be.closeTo(450, 1)
    })
  })

  it('keeps secondary unit stats behind inspection', () => {
    cy.mount(<CombatPrototype />)

    cy.contains('DEF 14').should('not.exist')
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
    finishEnemyTurn(false)

    cy.get('[data-cy="combat-status"]', { timeout: 10000 }).should(
      'contain.text',
      'defeat',
    )
    cy.contains('h2', 'The expedition has fallen.').should('be.visible')
  })

  it('allows a hero to skip their turn', () => {
    cy.mount(<CombatPrototype initialState={createInitialCombatState(553)} />)

    cy.contains('button', 'Skip turn').click()
    cy.get('[data-cy="turn-announcement"]')
      .should('have.attr', 'data-team', 'enemies')
      .and('contain.text', 'Ashfang advances')

    finishEnemyTurn()
    cy.get('[data-cy="active-turn"]').should('contain.text', 'Elowen')
    cy.contains('button', 'Log').click()
    cy.get('[data-cy="combat-log"]').should(
      'contain.text',
      'Nyra holds position and passes the turn.',
    )
  })

  it('uses a battle item through targeting and confirmation', () => {
    cy.mount(<CombatPrototype initialState={createInitialCombatState(553)} />)

    cy.contains('button', 'Items').click()
    cy.get('[data-cy="item-healing-draught"]').should('be.disabled')
    cy.get('[data-cy="item-ember-flask"]')
      .should('be.visible')
      .and('have.attr', 'aria-label', 'Ember Flask, quantity 1')
      .click()
    cy.get('[data-cy="item-detail"]')
      .should('contain.text', '5 damage')
      .and('contain.text', 'Owned')

    cy.get('[data-cy="target-ashfang"]').click()
    cy.get('[data-cy="item-confirmation"]')
      .should('be.visible')
      .and('contain.text', 'still use an ability this turn')
    cy.contains('button', 'Back').click()
    cy.get('[data-cy="item-confirmation"]').should('not.exist')
    cy.get('[data-cy="ashfang-health"]').should('contain.text', '24/24')

    cy.get('[data-cy="target-ashfang"]').click()
    cy.contains('button', 'Use item').click()
    cy.get('[data-action-actor][data-action-effect="damage"]').should(
      'contain',
      'Nyra',
    )
    cy.get('[data-action-target][data-feedback="damage"]')
      .should('contain', 'Ashfang')
      .and('have.attr', 'data-action-phase', 'impact')
    cy.get('[data-cy="ashfang-health"]').should('contain.text', '19/24')
    cy.get('[data-action-actor]').should('not.exist')
    cy.get('[data-cy="active-turn"]').should('contain.text', 'Nyra')
    cy.contains('button', 'Items')
      .should('be.disabled')
      .and('contain.text', 'Used')

    selectSkillAndTarget('quick-shot', 'ashfang')
    resolvePendingAction()
    cy.get('[data-cy="turn-announcement"]').should(
      'have.attr',
      'data-team',
      'enemies',
    )
  })

  it('consumes item stacks and enforces item target rules', () => {
    const state = createInitialCombatState(553)

    expect(getValidItemTargets(state, 'nyra', 'healing-draught')).to.have
      .length(0)
    expect(getValidItemTargets(state, 'nyra', 'ember-flask')).to.have.length(
      2,
    )

    const resolution = resolveHeroItem(state, 'ember-flask', 'ashfang')
    expect(resolution).not.to.equal(null)
    expect(
      resolution?.state.combatants.find(
        (combatant) => combatant.id === 'ashfang',
      )?.health,
    ).to.equal(19)
    expect(
      resolution?.state.combatants
        .find((combatant) => combatant.id === 'nyra')
        ?.inventory.some((stack) => stack.itemId === 'ember-flask'),
    ).to.equal(false)
  })

  it('keeps the skip turn control visible on compact screens', () => {
    cy.viewport(480, 900)
    cy.mount(<CombatPrototype />)
    cy.contains('button', 'Skip').should('be.visible')

    cy.viewport(375, 812)
    cy.contains('button', 'Skip').should('be.visible')
  })

  it('shows two empty ability slots', () => {
    cy.mount(<CombatPrototype />)

    cy.get('[aria-label="Empty ability slot"]').should('have.length', 2)
    cy.get('[aria-label="Empty ability slot"]')
      .should('contain.text', '4')
      .and('contain.text', '+')
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
