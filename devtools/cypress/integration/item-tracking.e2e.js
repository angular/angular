/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

require('cypress-iframe');

describe('Tracking items from application to component tree', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should have only one todo item on start', () => {
    cy.enter('#sample-app').then((getBody) => {
      getBody().find('app-todo').contains('Buy milk');
    });

    cy.get('.tree-wrapper')
      .find('.tree-node:contains("app-todo[TooltipDirective]")')
      .its('length')
      .should('eq', 2);
  });

  it('should be able to detect a new todo from user and add it to the tree', () => {
    cy.enter('#sample-app')
      .then((getBody) => {
        getBody().find('input.new-todo').type('Buy cookies{enter}');
      })
      .then(() => {
        cy.enter('#sample-app').then((getBody) => {
          getBody().find('app-todo').contains('Buy milk');

          getBody().find('app-todo').contains('Build something fun!');

          getBody().find('app-todo').contains('Buy cookies');
        });
      });

    cy.get('.tree-wrapper .tree-node:contains("app-todo[TooltipDirective]")').should(
      'have.length',
      3,
    );
  });
});
