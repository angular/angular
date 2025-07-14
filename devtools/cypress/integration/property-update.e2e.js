/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

describe('change of the state should reflect in property update', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should update the property value', () => {
    // Complete the todo
    cy.enterIframe('#sample-app').then((getBody) => {
      getBody().find('input[type="checkbox"].toggle').first().click();
    });

    // Select the todo item
    cy.get('.tree-wrapper')
      .find('ng-tree-node:contains("app-todo[TooltipDirective]")')
      .first()
      .click({force: true});

    // Expand the todo in the property explorer
    cy.get('.explorer-panel:contains("app-todo")')
      .find('ng-property-view mat-tree-node:contains("todo")')
      .click();

    // Verify its value is now completed
    cy.contains(
      '.explorer-panel:contains("app-todo") ' +
        'ng-property-view mat-tree-node:contains("completed") ' +
        'ng-property-editor .editor',
      'true',
    );
  });
});
