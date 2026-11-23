/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

function goToTransferStateTab() {
  cy.get('a[mat-tab-link]:contains("Transfer State")').click();
  cy.get('ng-transfer-state').should('exist');
  cy.get('ng-transfer-state').should('be.visible');
}

describe('transfer state tab', () => {
  beforeEach(() => {
    cy.visit('/');
    goToTransferStateTab();
  });

  it('shows summary stats with Keys and Size labels', () => {
    cy.get('ng-transfer-state .summary-stats .stat-label').contains('Keys');
    cy.get('ng-transfer-state .summary-stats .stat-label').contains('Size');
  });

  it('renders table headers', () => {
    cy.get('.transfer-state-table th').contains('Key');
    cy.get('.transfer-state-table th').contains('Type');
    cy.get('.transfer-state-table th').contains('Size');
    cy.get('.transfer-state-table th').contains('Value');
  });

  it('renders the object row with a type badge and an expandable value', () => {
    cy.get('.transfer-state-table tr[mat-row]')
      .filter(':contains("obj")')
      .first()
      .within(() => {
        cy.get('.key-cell code').should('have.text', 'obj');
        cy.get('.type-badge').should('have.text', 'object');
        cy.get('.value-cell ng-object-tree-explorer').should('exist');
      });
  });

  it('renders the array row with a type badge', () => {
    cy.get('.transfer-state-table tr[mat-row]')
      .filter(':contains("arr")')
      .first()
      .within(() => {
        cy.get('.key-cell code').should('have.text', 'arr');
        cy.get('.type-badge').should('have.text', 'array');
      });
  });

  it('filters rows by key', () => {
    cy.get('.transfer-state-table tr[mat-row]').its('length').should('be.greaterThan', 1);

    cy.get('.filter input.filter-input').type('greeting');

    cy.get('.transfer-state-table tr[mat-row]').should('have.length', 1);
    cy.get('.transfer-state-table tr[mat-row] .key-cell code').should('have.text', 'greeting');
  });

  it('clears the filter via the clear button', () => {
    cy.get('.filter input.filter-input').type('nope-no-match');
    cy.get('.transfer-state-table tr[mat-row]').should('have.length', 0);

    cy.get('.filter .filter-clear').click();
    cy.get('.filter input.filter-input').should('have.value', '');
    cy.get('.transfer-state-table tr[mat-row]').its('length').should('be.greaterThan', 1);
  });

  it('sorts by key when the Key header is clicked', () => {
    cy.get('.transfer-state-table th:contains("Key")').click();

    cy.get('.transfer-state-table tr[mat-row] .key-cell code').then(($cells) => {
      const keys = Array.from($cells, (el) => el.textContent.trim());
      const sorted = [...keys].sort((a, b) => a.localeCompare(b));
      expect(keys).to.deep.equal(sorted);
    });
  });
});
