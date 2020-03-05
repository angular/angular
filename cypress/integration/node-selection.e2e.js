describe('node selection', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('logic after change detection', () => {
    it('should deselect node if it is no longer on the page', () => {
      cy.get('mat-tree')
        .get('mat-tree-node.selected')
        .should('not.exist');

      cy.get('mat-tree')
        .find('mat-tree-node:contains("app-todo[TooltipDirective]")')
        .click();

      cy.get('mat-tree')
        .find('mat-tree-node.selected')
        .its('length')
        .should('eq', 1);

      cy.enter('#sample-app').then(getBody => {
        getBody()
          .find('a:contains("About")')
          .click();
      });

      cy.get('mat-tree')
        .get('mat-tree-node.selected')
        .should('not.exist');
    });

    it('should reselect the previously selected node if it is still present', () => {
      cy.get('mat-tree')
        .get('mat-tree-node.selected')
        .should('not.exist');

      cy.enter('#sample-app').then(getBody => {
        getBody()
          .find('input.new-todo')
          .type('Buy cookies{enter}');
      });

      cy.get('mat-tree')
        .find('mat-tree-node:contains("app-todo[TooltipDirective]")')
        .last()
        .click();

      cy.enter('#sample-app').then(getBody => {
        getBody()
          .find('app-todo:contains("Buy milk")')
          .find('.destroy')
          .click();
      });

      cy.get('mat-tree')
        .find('mat-tree-node.selected')
        .its('length')
        .should('eq', 1);
    });
  });
});
