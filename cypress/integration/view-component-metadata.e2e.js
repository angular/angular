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
      cy.get('.view-link:contains("View Encapsulation: Emulated")').should('have.length', 1);
    });

    it('should display change detection strategy', () => {
      cy.get('.view-link:contains("Change Detection Strategy: On Push")').should('have.length', 1);
    });
  });

  describe('viewing DemoAppComponent', () => {
    beforeEach(() => prepareHeaderExpansionPanelForAssertions('.tree-node:contains("ng-component")'));

    it('should display view encapsulation', () => {
      cy.get('.view-link:contains("View Encapsulation: None")').should('have.length', 1);
    });

    it('should display change detection strategy', () => {
      cy.get('.view-link:contains("Change Detection Strategy: Default")').should('have.length', 1);
    });
  });
});
