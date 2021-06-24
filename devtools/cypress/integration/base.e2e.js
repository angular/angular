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
    cy.get('.mat-tab-links').contains('Components');
  });

  it('should contain the "Profiler" tab', () => {
    cy.get('.mat-tab-links').contains('Profiler');
  });

  it('should contain "app-root" and "app-todo-demo" in the component tree', () => {
    cy.get('.tree-node').contains('app-root');
    cy.get('.tree-node').contains('app-todo-demo');
  });
});
