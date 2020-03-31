describe('Tracking items from application to component tree', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should have only one todo item on start', () => {
    cy.enter('#sample-app').then((getBody) => {
      getBody().find('app-todo').contains('Buy milk');
    });

    cy.get('mat-tree').find('mat-tree-node:contains("app-todo[TooltipDirective]")').its('length').should('eq', 2);
  });

  it('should be able to detect a new todo from user and add it to the tree', () => {
    cy.enter('#sample-app')
      .then((getBody) => {
        getBody().find('input.new-todo').type('Buy cookies{enter}');
      })
      .then(() => {
        cy.enter('#sample-app').then((getBody) => {
          getBody().find('app-todo').contains('Buy milk');

          getBody().find('app-todo').contains('Save the world');

          getBody().find('app-todo').contains('Buy cookies');
        });
      });

    cy.get('mat-tree mat-tree-node:contains("app-todo[TooltipDirective]")', { timeout: 200 }).should('have.length', 3);
  });
});
