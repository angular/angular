const prepareHeaderExpansionPanelForAssertions = (selector) => {
  cy.get('.tree-wrapper').find(selector).first().click({ force: true });
  cy.wait(1000);
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
    beforeEach(() => prepareHeaderExpansionPanelForAssertions('.tree-node:contains("ng-component")'));

    it('should display view encapsulation', () => {
      cy.get('.meta-data-container').find('.mat-button').first().should('have.text', ' View Encapsulation: None');
    });

    it('should display change detection strategy', () => {
      cy.get('.meta-data-container')
        .find('.mat-button')
        .last()
        .should('have.text', ' Change Detection Strategy: Default');
    });
  });
});
