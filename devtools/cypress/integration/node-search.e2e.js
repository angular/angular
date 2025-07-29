/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

function checkSearchedNodesLength(type, length) {
  cy.get(`.tree-wrapper:first ${type}`).its('length').should('eq', length);
}

function inputSearchText(text) {
  cy.get('ng-filter .filter-input').type(text, {force: true});
}

function checkComponentName(name) {
  cy.get('.component-name > span').should('have.text', name);
}

function checkEmptyNodes() {
  cy.get('.tree-wrapper').find('.matched-text').should('not.exist');
}

function clickSearchArrows(upwards) {
  const buttons = cy.get('.up-down-buttons').find('button');

  if (upwards) {
    buttons.first().then((btn) => btn[0].click());
  } else {
    buttons.last().then((btn) => btn[0].click());
  }
}

describe('Search items in component tree', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should not highlight any node if not present', () => {
    inputSearchText('tado');
    checkEmptyNodes();
  });

  it('should highlight correct nodes when searching and clear out', () => {
    inputSearchText('todo');
    checkSearchedNodesLength('.matched-text', 4);

    // clear search input
    inputSearchText('{backspace}{backspace}{backspace}{backspace}');
    checkEmptyNodes();
  });

  it('should highlight correct nodes when searching and using arrow keys', () => {
    inputSearchText('todo');
    checkSearchedNodesLength('.matched-text', 4);
    checkComponentName('app-todo-demo');

    // press down arrow
    clickSearchArrows(false);
    checkSearchedNodesLength('.selected', 1);
    checkComponentName('app-todos');

    // press down arrow
    clickSearchArrows(false);
    checkSearchedNodesLength('.selected', 1);
    checkComponentName('app-todo');

    // press up arrow
    clickSearchArrows(true);
    checkSearchedNodesLength('.selected', 1);
    checkComponentName('app-todos');

    // clear search input
    inputSearchText('{backspace}{backspace}{backspace}{backspace}');
    checkEmptyNodes();
  });

  it('should select correct node on enter', () => {
    inputSearchText('todo{enter}');
    checkSearchedNodesLength('.selected', 1);

    // should show correct buttons in breadcrumbs
    const amountOfBreadcrumbButtons = 4;
    const amountOfScrollButtons = 2;
    cy.get('ng-breadcrumbs')
      .find('button')
      .its('length')
      .should('eq', amountOfScrollButtons + amountOfBreadcrumbButtons);

    // should display correct text in explorer panel
    checkComponentName('app-todos');

    // should display correct title for properties panel
    cy.get('ng-property-view-header').should('contain.text', 'app-todos');

    // should show correct component properties
    cy.get('ng-property-view').find('mat-tree-node');
  });

  // todo(aleksanderbodurri): revive this test if we decide to revive this functionality
  // it('should focus search input when search icon is clicked', () => {
  //   cy.get('.filter label .search-icon').click({force: true});
  //   cy.get('.filter label input').should('have.focus');
  // });
});
