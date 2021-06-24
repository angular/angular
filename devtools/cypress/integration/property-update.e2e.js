describe('change of the state should reflect in property update', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should update the property value', () => {
    // Complete the todo
    cy.enter('#sample-app').then((getBody) => {
      getBody().find('input[type="checkbox"].toggle').first().click();
    });

    // Select the todo item
    cy.get('.tree-wrapper').find('.tree-node:contains("app-todo[TooltipDirective]")').first().click({ force: true });

    // Expand the todo in the property explorer
    cy.get('.explorer-panel:contains("app-todo")').find('ng-property-view mat-tree-node:contains("todo")').click();

    // Verify its value is now completed
    cy.get('.explorer-panel:contains("app-todo")')
      .find('ng-property-view mat-tree-node:contains("completed")')
      .find('ng-property-editor .editor')
      .should((el) => {
        expect(el.text().trim()).equal('true');
      });
  });
});
