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

  describe('viewing TodosComponent', () => {
    beforeEach(() =>
      prepareHeaderExpansionPanelForAssertions('ng-tree-node:contains("app-todos")'),
    );

    it('should display view encapsulation', () => {
      cy.contains('ng-component-metadata', 'View Encapsulation: None');
    });

    it('should display change detection strategy', () => {
      cy.contains('ng-component-metadata', 'Change Detection Strategy: Default');
    });
  });

  describe('viewing DemoAppComponent', () => {
    beforeEach(() =>
      prepareHeaderExpansionPanelForAssertions('ng-tree-node:contains("app-demo-component")'),
    );

    it('should display view encapsulation', () => {
      cy.contains('ng-component-metadata', 'View Encapsulation: None');
    });

    it('should display change detection strategy', () => {
      cy.contains('ng-component-metadata', 'Change Detection Strategy: Default');
    });

    it('should display correct set of inputs', () => {
      cy.contains('.mat-accordion-content#Inputs', 'Inputs');
      cy.contains('.mat-accordion-content#Inputs mat-tree-node:first span:first', 'inputOne');
      cy.contains('.mat-accordion-content#Inputs mat-tree-node:last span:first', 'inputTwo');
    });

    it('should display correct set of outputs', () => {
      cy.contains('.mat-accordion-content#Outputs', 'Outputs');
      cy.contains('.mat-accordion-content#Outputs mat-tree-node:first span:first', 'outputOne');
      cy.contains('.mat-accordion-content#Outputs mat-tree-node:last span:first', 'outputTwo');
    });

    it('should display correct set of properties', () => {
      cy.contains('.mat-accordion-content#Properties', 'Properties');
      cy.contains('.mat-accordion-content#Properties mat-tree-node:first span:first', 'elementRef');
      cy.contains('.mat-accordion-content#Properties mat-tree-node:last span:first', 'zippy');
    });
  });
});
