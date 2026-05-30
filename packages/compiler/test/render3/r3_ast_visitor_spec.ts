/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as t from '../../src/render3/r3_ast';
import {parseR3 as parse} from './view/util';

describe('RecursiveVisitor', () => {
  it('should not mutate IfBlockBranch children when visiting', () => {
    // Template with an @if block that has an alias.
    // The alias is key because `visitIfBlockBranch` previously pushed the alias
    // to the children array, causing mutation if the array wasn't cloned.
    const template = '@if (val; as alias) { <div></div> }';
    const result = parse(template);

    // Structure:
    // result.nodes[0] is the IfBlock
    // IfBlock.branches[0] is the IfBlockBranch
    const ifBlock = result.nodes[0] as t.IfBlock;
    expect(ifBlock instanceof t.IfBlock).toBe(true);

    const branch = ifBlock.branches[0];
    expect(branch instanceof t.IfBlockBranch).toBe(true);

    // Verify initial state
    // Children should contain only the Element (<div></div>)
    expect(branch.children.length).toBe(1);
    expect(branch.children[0] instanceof t.Element).toBe(true);
    const element = branch.children[0] as t.Element;
    expect(element.name).toBe('div');

    // Alias should exist
    expect(branch.expressionAlias).not.toBeNull();
    const alias = branch.expressionAlias!;

    const visitor = new t.RecursiveVisitor();

    // Visit the branch
    visitor.visitIfBlockBranch(branch);

    // Verify post-visit state
    // The children array should STILL only contain the Element.
    // It should NOT contain the alias variable.
    expect(branch.children.length).toBe(1);
    expect(branch.children[0]).toBe(element);
    expect(branch.children).not.toContain(alias);
  });
});
