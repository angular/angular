/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

function goToInjectorTreeTab() {
  cy.get('ng-devtools-tabs nav a:contains("Injector Tree")').click();
}

function toggleHideFrameworkInjectors() {
  cy.get('input#hide-fw-injectors').check();
}

function toggleHideInjectorsWithNoProviders() {
  cy.get('input#hide-injectors-no-providers').check();
}

describe('injector tree tab', () => {
  beforeEach(() => {
    cy.visit('/');
    goToInjectorTreeTab();
  });

  it('should display the injector tree', () => {
    cy.get('.node').should('exist');
  });

  it('should hide framework injectors when the toggle is off', () => {
    // First lets check that a framework injector is present
    cy.get('.node:contains("Null Injector")').should('exist');

    // Then lets hide framework injectors
    toggleHideFrameworkInjectors();

    // Now we should not see the Null Injector
    cy.get('.node:contains("Null Injector")').should('not.exist');
  });

  it('should hide injectors with no providers when the toggle is on', () => {
    // There should be many element nodes with no providers
    cy.get('.node-element').should('have.length.greaterThan', 1);
    cy.get('.node:contains("Null Injector")').should('exist');

    // Hide injectors with no providers
    toggleHideInjectorsWithNoProviders();

    // Now we should not see the Null Injector
    // and only one element node should be present because it's the only
    // component (AppTodoComponent) that has a provider
    cy.get('.node:contains("Null Injector")').should('not.exist');
    cy.get('.node-element').should('have.length', 1);
    cy.get('.node-element').first().should('contain.text', 'AppTodoComponent');
  });

  it('should not show providers when a node with no providers is selected', () => {
    // Open providers side tab
    cy.get('.node-element:contains("ZippyComponent")').click();
    // Check that the providers table is not displayed
    cy.get('ng-injector-providers').should('not.exist');
  });

  it('show providers when a node with providers is selected', () => {
    toggleHideInjectorsWithNoProviders();

    // Open providers side tab
    cy.get('.node-element:contains("AppTodoComponent")').click();
    cy.get('ng-injector-providers h2:contains("Providers for AppTodoComponent")').should('exist');

    // Check that the providers table is displayed
    cy.get('ng-injector-providers table tbody tr').within(() => {
      cy.get('td').first().should('contain.text', 'MyServiceA');
      cy.get('td').eq(1).should('contain.text', 'Type');
      cy.get('td').eq(2).should('contain.text', 'check_circle');
      cy.get('td').eq(3).should('contain.text', 'code');
    });
  });

  it('show filter providers when a filter is applied', () => {
    toggleHideInjectorsWithNoProviders();

    // Open providers side tab
    cy.get('.node:contains("Platform")').click();
    cy.get('ng-injector-providers h2:contains("Providers for Platform")').should('exist');

    // Filter using the type filter
    cy.get('ng-injector-providers .provider-row').should('have.length', 8);
    cy.get('#search-by-type').select('Type');
    cy.get('ng-injector-providers .provider-row').should('have.length', 3);
    cy.get('ng-injector-providers .provider-row:contains("Console")').should('exist');
    cy.get('ng-injector-providers .provider-row:contains("PlatformLocation")').should('exist');
    cy.get('ng-injector-providers .provider-row:contains("BrowserPlatformLocation")').should(
      'exist',
    );

    // Filter using the token filter
    cy.get('#search-by-token').type('Location');
    cy.get('ng-injector-providers .provider-row:contains("Console")').should('not.exist');
    cy.get('ng-injector-providers .provider-row:contains("PlatformLocation")').should('exist');
    cy.get('ng-injector-providers .provider-row:contains("BrowserPlatformLocation")').should(
      'exist',
    );
    cy.get('#search-by-token').clear();
    cy.get('#search-by-token').type('Console');
    cy.get('ng-injector-providers .provider-row:contains("Console")').should('exist');
    cy.get('ng-injector-providers .provider-row:contains("PlatformLocation")').should('not.exist');
    cy.get('ng-injector-providers .provider-row:contains("BrowserPlatformLocation")').should(
      'not.exist',
    );
  });
});
