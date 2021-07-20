describe('Angular Elements', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should recognize the zippy as an Angular Element', () => {
    cy.get('.tree-wrapper').find('.tree-node:contains("app-zippy")').its('length').should('eq', 1);
  });
});
