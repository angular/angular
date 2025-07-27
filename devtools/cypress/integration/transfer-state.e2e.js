/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

function showTransferState() {
  cy.get('.main-toolbar > .settings > button:last-child').click();
  cy.get('.cdk-overlay-container mat-slide-toggle:contains("Show Transfer State Tab")').click();
}

function goToTransferStateTab() {
  showTransferState();
  cy.get('body').type('{esc}');
  cy.get('a[mat-tab-link]:contains("Transfer State")').click();
  cy.get('ng-transfer-state').should('exist');
  cy.get('ng-transfer-state').should('be.visible');
}

describe('transfer state tab', () => {
  beforeEach(() => {
    cy.visit('/');
    goToTransferStateTab();
  });

  it('shows summary stats', () => {
    cy.get('.summary-card .stat-label').contains('Keys');
    cy.get('.summary-card .stat-label').contains('Total Size');
  });

  it('shows table headers', () => {
    cy.get('.transfer-state-table th').contains('Key');
    cy.get('.transfer-state-table th').contains('Type');
    cy.get('.transfer-state-table th').contains('Size');
    cy.get('.transfer-state-table th').contains('Value');
  });

  it('shows the object row with correct data', () => {
    cy.get('.transfer-state-table tr[mat-row]')
      .first()
      .within(() => {
        cy.get('td').eq(0).find('code').should('have.text', 'obj');
        cy.get('td').eq(1).find('.type-badge').should('have.text', 'object');
        cy.get('td').eq(2).should('have.text', '79 B');
        cy.get('td').eq(3).find('.value-preview').should('contain.text', '"appName": "DevTools"');
        cy.get('td').eq(3).find('.value-preview').should('contain.text', '"appVersion": "0.0.1"');
        cy.get('td')
          .eq(3)
          .find('.value-preview')
          .should('contain.text', '"appDescription": "Angular DevTools"');
      });
  });

  it('shows the array row with correct data', () => {
    cy.get('.transfer-state-table tr[mat-row]')
      .last()
      .within(() => {
        cy.get('td').eq(0).find('code').should('have.text', 'arr');
        cy.get('td').eq(1).find('.type-badge').should('have.text', 'array');
        cy.get('td').eq(2).should('have.text', '11 B');
        cy.get('td')
          .eq(3)
          .find('.value-preview')
          .should('contain.text', '[\n  1,\n  2,\n  3,\n  4,\n  5\n]');
      });
  });
});
