describe('node selection', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('logic after change detection', () => {
    it('should deselect node if it is no longer on the page', () => {
      cy.get('.tree-wrapper').get('.tree-node.selected').should('not.exist');

      cy.get('.tree-wrapper').find('.tree-node:contains("app-todo[TooltipDirective]")').first().click({ force: true });

      cy.get('.tree-wrapper').find('.tree-node.selected').its('length').should('eq', 1);

      cy.enter('#sample-app').then((getBody) => {
        getBody().find('a:contains("About")').click();
      });

      cy.get('.tree-wrapper').get('.tree-node.selected').should('not.exist');
    });

    it('should reselect the previously selected node if it is still present', () => {
      cy.get('.tree-wrapper').get('.tree-node.selected').should('not.exist');

      cy.enter('#sample-app').then((getBody) => {
        getBody().find('input.new-todo').type('Buy cookies{enter}');
      });

      cy.get('.tree-wrapper').find('.tree-node:contains("app-todo[TooltipDirective]")').last().click({ force: true });

      cy.enter('#sample-app').then((getBody) => {
        getBody().find('app-todo:contains("Buy milk")').find('.destroy').click();
      });

      cy.get('.tree-wrapper').find('.tree-node.selected').its('length').should('eq', 1);
    });

    it('should select nodes with same name', () => {
      cy.get('.tree-wrapper').find('.tree-node:contains("app-todo[TooltipDirective]")').first().click({ force: true });

      cy.get('.tree-wrapper').find('.tree-node:contains("app-todo[TooltipDirective]")').last().click({ force: true });

      cy.get('ng-property-view').last().find('mat-tree-node:contains("todo")').click();

      cy.get('ng-property-view').last().find('mat-tree-node:contains("Save the world")').its('length').should('eq', 1);
    });
  });
});
