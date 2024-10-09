/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

require('cypress-iframe');

describe('edit properties of directive in the property view tab', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('edit app-todo component', () => {
    beforeEach(() => {
      // select todo node in component tree
      cy.get('.tree-wrapper')
        .find('.tree-node:contains("app-todo[TooltipDirective]")')
        .first()
        .click({force: true});
    });

    it('should be able to enable editMode', () => {
      cy.enter('#sample-app').then((getBody) => {
        getBody().find('app-todo input.edit').should('not.be.visible');
      });

      cy.get('.explorer-panel:contains("app-todo")')
        .find('ng-property-view mat-tree-node:contains("editMode")')
        .find('ng-property-editor .editor')
        .click({force: true})
        .find('.editor-input')
        .clear()
        .type('true')
        .type('{enter}');

      cy.enter('#sample-app').then((getBody) => {
        getBody().find('app-todo input.edit').should('be.visible');
      });
    });

    describe('edit todo property', () => {
      beforeEach(() => {
        // expand todo state
        cy.get('.explorer-panel:contains("app-todo")')
          .find('ng-property-view mat-tree-node:contains("todo")')
          .click();
      });

      it('should change todo label in app when edited', () => {
        // check initial todo label
        cy.enter('#sample-app').then((getBody) => {
          getBody().find('app-todo').contains('Buy milk').its('length').should('eq', 1);
        });

        // find label variable and run through edit logic
        cy.get('.explorer-panel:contains("app-todo")')
          .find('ng-property-view mat-tree-node:contains("label")')
          .find('ng-property-editor .editor')
          .click()
          .find('.editor-input')
          .clear()
          .type('Buy cookies')
          .type('{enter}');

        // assert that the page has been updated
        cy.enter('#sample-app').then((getBody) => {
          getBody().find('app-todo').contains('Buy cookies').its('length').should('eq', 1);
        });
      });

      it('should change todo completed in app when edited', () => {
        // check initial todo completed status
        cy.enter('#sample-app').then((getBody) => {
          getBody().find('app-todo li').not('.completed').its('length').should('eq', 2);
        });

        // find completed variable and run through edit logic
        cy.get('.explorer-panel:contains("app-todo")')
          .find('ng-property-view mat-tree-node:contains("completed")')
          .find('ng-property-editor .editor')
          .click()
          .find('.editor-input')
          .clear()
          .type('true')
          .type('{enter}');

        // assert that the page has been updated
        cy.enter('#sample-app').then((getBody) => {
          getBody().find('app-todo li.completed').its('length').should('eq', 1);
        });
      });
    });
  });
});
