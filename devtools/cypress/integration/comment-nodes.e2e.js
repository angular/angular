/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

describe('Comment nodes', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should not find any comment nodes', () => {
    const nodes = cy.$$('ng-tree-node:contains("#comment")');
    expect(nodes.length).to.eql(0);
  });
});
