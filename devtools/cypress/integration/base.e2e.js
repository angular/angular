/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

describe('Testing the Todo app Demo', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should contain the todos application', () => {
    cy.enterIframe('#sample-app').then((getBody) => {
      getBody().contains('Todos');
      getBody().contains('About');
      getBody().contains('Clear completed');
      getBody().contains('Click to expand');
    });
  });

  it('should contain the "Components" tab', () => {
    cy.contains('.devtools-nav', 'Components');
  });

  it('should contain the "Profiler" tab', () => {
    cy.contains('.devtools-nav', 'Profiler');
  });

  it('should contain "app-root" and "app-todo-demo" in the component tree', () => {
    cy.contains('ng-tree-node', 'app-root');
    cy.contains('ng-tree-node', 'app-todo-demo');
  });
});
