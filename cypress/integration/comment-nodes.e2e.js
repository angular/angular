function showComments() {
  cy.get(
    '#nav-buttons > button.mat-focus-indicator.mat-menu-trigger.mat-icon-button.mat-button-base.mat-primary'
  ).click();
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
    cy.get('.tree-wrapper').find('.tree-node:contains("#comment")').its('length').should('not.eq', 0);
  });
});
