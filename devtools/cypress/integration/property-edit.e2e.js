/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

describe('edit properties of directive in the property view tab', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('edit app-todo component', () => {
    beforeEach(() => {
      // select todo node in component tree
      cy.get('.tree-wrapper')
        .find('ng-tree-node:contains("app-todo[TooltipDirective]")')
        .first()
        .click({force: true});
    });

    it('should be able to enable editMode', () => {
      cy.enterIframe('#sample-app').then((getBody) => {
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

      cy.enterIframe('#sample-app').then((getBody) => {
        getBody().find('app-todo input.edit').should('be.visible');
      });
    });
  });

  describe('edit title property', () => {
    beforeEach(() => {
      cy.get('.tree-wrapper')
        .find('ng-tree-node:contains("app-todos")')
        .first()
        .click({force: true});
    });

    it('should change title in app when edited', () => {
      cy.enterIframe('#sample-app').then((getBody) => {
        getBody().find('#demo-app-title').contains('Angular Todo');
      });

      // find title variable and run through edit logic
      cy.get('.explorer-panel:contains("app-todos")')
        .find('ng-property-view mat-tree-node:contains("title")')
        .find('ng-property-editor .editor')
        .click()
        .find('.editor-input')
        .clear()
        .type('Hello World')
        .type('{enter}');

      // assert that the page has been updated
      cy.enterIframe('#sample-app').then((getBody) => {
        getBody().find('#demo-app-title').contains('Hello World');
      });
    });
  });
});
