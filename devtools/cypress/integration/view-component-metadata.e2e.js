const prepareHeaderExpansionPanelForAssertions = (selector) => {
  cy.get('.tree-wrapper').find(selector).first().click({ force: true });
  cy.get('.element-header .component-name').click();
};

describe('Viewing component metadata', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('viewing TodoComponent', () => {
    beforeEach(() => prepareHeaderExpansionPanelForAssertions('.tree-node:contains("app-todo[TooltipDirective]")'));

    it('should display view encapsulation', () => {
      cy.get('.meta-data-container').find('.mat-button').first().should('have.text', ' View Encapsulation: Emulated');
    });

    it('should display change detection strategy', () => {
      cy.get('.meta-data-container')
        .find('.mat-button')
        .last()
        .should('have.text', ' Change Detection Strategy: OnPush');
    });
  });

  describe('viewing DemoAppComponent', () => {
    beforeEach(() => prepareHeaderExpansionPanelForAssertions('.tree-node:contains("app-demo-component")'));

    it('should display view encapsulation', () => {
      cy.get('.meta-data-container').find('.mat-button').first().should('have.text', ' View Encapsulation: None');
    });

    it('should display change detection strategy', () => {
      cy.get('.meta-data-container')
        .find('.mat-button')
        .last()
        .should('have.text', ' Change Detection Strategy: Default');
    });

    it('should display correct set of inputs', () => {
      cy.get('mat-expansion-panel')
        .eq(1)
        .find('mat-expansion-panel-header')
        .first()
        .should('have.text', ' @Inputs open_in_new');

      cy.get('mat-expansion-panel')
        .eq(1)
        .find('mat-tree-node')
        .eq(0)
        .find('span')
        .eq(0)
        .should('have.text', ' inputOne ');

      cy.get('mat-expansion-panel')
        .eq(1)
        .find('mat-tree-node')
        .eq(1)
        .find('span')
        .eq(0)
        .should('have.text', ' inputTwo ');
    });

    it('should display correct set of outputs', () => {
      cy.get('mat-expansion-panel')
        .eq(2)
        .find('mat-expansion-panel-header')
        .first()
        .should('have.text', ' @Outputs open_in_new');

      cy.get('mat-expansion-panel')
        .eq(2)
        .find('mat-tree-node')
        .eq(0)
        .find('span')
        .eq(0)
        .should('have.text', ' outputOne ');

      cy.get('mat-expansion-panel')
        .eq(2)
        .find('mat-tree-node')
        .eq(1)
        .find('span')
        .eq(0)
        .should('have.text', ' outputTwo ');
    });

    it('should display correct set of properties', () => {
      cy.get('mat-expansion-panel')
        .eq(3)
        .find('mat-expansion-panel-header')
        .first()
        .should('have.text', ' Properties open_in_new');

      cy.get('mat-expansion-panel')
        .eq(3)
        .find('mat-tree-node')
        .eq(0)
        .find('span')
        .eq(0)
        .should('have.text', ' elementRef ');

      cy.get('mat-expansion-panel').eq(3).find('mat-tree-node').eq(1).find('span').eq(0).should('have.text', ' zippy ');
    });
  });
});
