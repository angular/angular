/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

function showComments() {
  cy.get('#main-toolbar > .tools > button:nth-child(2)').click();
  cy.get('#mat-slide-toggle-3 > label > div').click();
}

describe('Comment nodes', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should not find any comment nodes by default', () => {
    const nodes = cy.$$('.tree-node:contains("#comment")');
    expect(nodes.length).to.eql(0);
  });

  it('should find comment nodes when the setting is enabled', () => {
    showComments();
    cy.get('.tree-wrapper')
      .find('.tree-node:contains("#comment")')
      .its('length')
      .should('not.eq', 0);
  });
});
