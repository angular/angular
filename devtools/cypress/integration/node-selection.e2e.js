/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

describe('node selection', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('logic after change detection', () => {
    it('should deselect node if it is no longer on the page', () => {
      cy.get('.tree-wrapper')
        .get('ng-tree-node:contains("app-todo[TooltipDirective]")')
        .should('not.have.class', 'selected');

      cy.get('.tree-wrapper')
        .find('ng-tree-node:contains("app-todo[TooltipDirective]")')
        .first()
        .click({force: true});

      cy.get('.tree-wrapper')
        .get('ng-tree-node:contains("app-todo[TooltipDirective]")')
        .should('have.class', 'selected');

      cy.enterIframe('#sample-app').then((getBody) => {
        getBody().find('a:contains("About")').click();
      });

      cy.get('.tree-wrapper')
        .get('ng-tree-node:contains("app-todo[TooltipDirective]")')
        .should('not.exist');
    });

    it('should reselect the previously selected node if it is still present', () => {
      cy.get('.tree-wrapper').get('ng-tree-node.selected').should('not.exist');

      cy.enterIframe('#sample-app').then((getBody) => {
        getBody().find('input.new-todo').type('Buy cookies{enter}');
      });

      cy.get('.tree-wrapper')
        .find('ng-tree-node:contains("app-todo[TooltipDirective]")')
        .last()
        .click({force: true});

      cy.enterIframe('#sample-app').then((getBody) => {
        getBody().find('app-todo:contains("Buy milk")').find('.destroy').click();
      });

      cy.get('.tree-wrapper').find('ng-tree-node.selected').its('length').should('eq', 1);
    });

    it('should select nodes with same name', () => {
      cy.get('.tree-wrapper')
        .find('ng-tree-node:contains("app-todo[TooltipDirective]")')
        .first()
        .click({force: true});

      cy.get('.tree-wrapper')
        .find('ng-tree-node:contains("app-todo[TooltipDirective]")')
        .last()
        .click({force: true});

      cy.get('ng-property-view').last().find('mat-tree-node:contains("todo")').click();

      cy.get('ng-property-view')
        .last()
        .find('mat-tree-node:contains("Build something fun!")')
        .its('length')
        .should('eq', 1);
    });
  });

  describe('breadcrumb logic', () => {
    it('should overflow when breadcrumb list is long enough', () => {
      cy.get('.tree-wrapper')
        .find('ng-tree-node:contains("div[TooltipDirective]")')
        .last()
        .click({force: true})
        .then(() => {
          cy.get('ng-breadcrumbs')
            .find('.breadcrumbs')
            .then((breadcrumbsContainer) => {
              const hasOverflowX = () =>
                breadcrumbsContainer[0].scrollWidth > breadcrumbsContainer[0].clientWidth;
              expect(hasOverflowX()).to.be.true;
            });
        });
    });

    it('should scroll right when right scroll button is clicked', () => {
      cy.get('.tree-wrapper')
        .find('ng-tree-node:contains("div[TooltipDirective]")')
        .last()
        .click({force: true})
        .then(() => {
          cy.get('ng-breadcrumbs')
            .find('.breadcrumbs')
            .then((el) => {
              el[0].style.scrollBehavior = 'auto';
            })
            .then((breadcrumbsContainer) => {
              const scrollLeft = () => breadcrumbsContainer[0].scrollLeft;
              expect(scrollLeft()).to.eql(0);

              cy.get('ng-breadcrumbs')
                .find('.scroll-button')
                .last()
                .click({force: true})
                .then(() => {
                  expect(scrollLeft()).to.be.greaterThan(0);
                });
            });
        });
    });

    it('should scroll left when left scroll button is clicked', () => {
      cy.get('.tree-wrapper')
        .find('ng-tree-node:contains("div[TooltipDirective]")')
        .last()
        .click({force: true})
        .then(() => {
          cy.get('ng-breadcrumbs')
            .find('.breadcrumbs')
            .then((el) => {
              el[0].style.scrollBehavior = 'auto';
            })
            .then((breadcrumbsContainer) => {
              const scrollLeft = () => breadcrumbsContainer[0].scrollLeft;
              expect(scrollLeft()).to.eql(0);

              cy.get('ng-breadcrumbs')
                .find('.scroll-button')
                .last()
                .click({force: true})
                .then(() => {
                  expect(scrollLeft()).to.be.greaterThan(0);

                  cy.get('ng-breadcrumbs')
                    .find('.scroll-button')
                    .first()
                    .click({force: true})
                    .then(() => {
                      expect(scrollLeft()).to.eql(0);
                    });
                });
            });
        });
    });
  });
});
