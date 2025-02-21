/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

const prepareHeaderExpansionPanelForAssertions = (selector) => {
  cy.get('.tree-wrapper').find(selector).first().click({force: true});
  cy.get('.element-header .component-name').click();
};

describe('Viewing component metadata', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('viewing TodoComponent', () => {
    beforeEach(() =>
      prepareHeaderExpansionPanelForAssertions('.tree-node:contains("app-todo[TooltipDirective]")'),
    );

    it('should display view encapsulation', () => {
      cy.contains('.meta-data-container .mat-button:first', 'View Encapsulation: Emulated');
    });

    it('should display change detection strategy', () => {
      cy.contains('.meta-data-container .mat-button:last', 'Change Detection Strategy: OnPush');
    });
  });

  describe('viewing DemoAppComponent', () => {
    beforeEach(() =>
      prepareHeaderExpansionPanelForAssertions('.tree-node:contains("app-demo-component")'),
    );

    it('should display view encapsulation', () => {
      cy.contains('.meta-data-container .mat-button:first', 'View Encapsulation: None');
    });

    it('should display change detection strategy', () => {
      cy.contains('.meta-data-container .mat-button:last', 'Change Detection Strategy: Default');
    });

    it('should display correct set of inputs', () => {
      cy.contains('.cy-inputs', 'Inputs');
      cy.contains('.cy-inputs mat-tree-node:first span:first', 'inputOne');
      cy.contains('.cy-inputs mat-tree-node:last span:first', 'inputTwo');
    });

    it('should display correct set of outputs', () => {
      cy.contains('.cy-outputs', 'Outputs');
      cy.contains('.cy-outputs mat-tree-node:first span:first', 'outputOne');
      cy.contains('.cy-outputs mat-tree-node:last span:first', 'outputTwo');
    });

    it('should display correct set of properties', () => {
      cy.contains('.cy-properties', 'Properties');
      cy.contains('.cy-properties mat-tree-node:first span:first', 'elementRef');
      cy.contains('.cy-properties mat-tree-node:last span:first', 'zippy');
    });
  });
});
