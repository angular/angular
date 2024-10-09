/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

require('cypress-iframe');

describe('Testing the Todo app Demo', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should contain the todos application', () => {
    cy.enter('#sample-app').then((getBody) => {
      getBody().contains('Todos');
      getBody().contains('About');
      getBody().contains('Clear completed');
      getBody().contains('Click to expand');
    });
  });

  it('should contain the "Components" tab', () => {
    cy.contains('.mat-tab-links', 'Components');
  });

  it('should contain the "Profiler" tab', () => {
    cy.contains('.mat-tab-links', 'Profiler');
  });

  it('should contain "app-root" and "app-todo-demo" in the component tree', () => {
    cy.contains('.tree-node', 'app-root');
    cy.contains('.tree-node', 'app-todo-demo');
  });
});
