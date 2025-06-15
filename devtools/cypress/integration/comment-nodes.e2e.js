/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

function showComments() {
  cy.get('#nav-buttons > button:nth-child(2)').click();
  cy.get('.cdk-overlay-container mat-slide-toggle label:contains("Show comment nodes")').click();
}

describe('Comment nodes', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should not find any comment nodes by default', () => {
    const nodes = cy.$$('ng-tree-node:contains("#comment")');
    expect(nodes.length).to.eql(0);
  });

  it('should find comment nodes when the setting is enabled', () => {
    showComments();
    cy.get('.tree-wrapper')
      .find('ng-tree-node:contains("#comment")')
      .its('length')
      .should('not.eq', 0);
  });
});
