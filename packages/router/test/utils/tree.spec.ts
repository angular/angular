/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Tree, TreeNode} from '../../src/utils/tree';

describe('tree', () => {
  it('should return the root of the tree', () => {
    const t = new Tree<any>(new TreeNode<number>(1, [])) as any;
    expect(t.root).toEqual(1);
  });

  it('should return the parent of a node', () => {
    const t = new Tree<any>(new TreeNode<number>(1, [new TreeNode<number>(2, [])])) as any;
    expect(t.parent(1)).toEqual(null);
    expect(t.parent(2)).toEqual(1);
  });

  it('should return the parent of a node (second child)', () => {
    const t = new Tree<any>(
      new TreeNode<number>(1, [new TreeNode<number>(2, []), new TreeNode<number>(3, [])]),
    ) as any;
    expect(t.parent(1)).toEqual(null);
    expect(t.parent(3)).toEqual(1);
  });

  it('should return the children of a node', () => {
    const t = new Tree<any>(new TreeNode<number>(1, [new TreeNode<number>(2, [])])) as any;
    expect(t.children(1)).toEqual([2]);
    expect(t.children(2)).toEqual([]);
  });

  it('should return the first child of a node', () => {
    const t = new Tree<any>(new TreeNode<number>(1, [new TreeNode<number>(2, [])])) as any;
    expect(t.firstChild(1)).toEqual(2);
    expect(t.firstChild(2)).toEqual(null);
  });

  it('should return the siblings of a node', () => {
    const t = new Tree<any>(
      new TreeNode<number>(1, [new TreeNode<number>(2, []), new TreeNode<number>(3, [])]),
    ) as any;
    expect(t.siblings(2)).toEqual([3]);
    expect(t.siblings(1)).toEqual([]);
  });

  it('should return the path to the root', () => {
    const t = new Tree<any>(new TreeNode<number>(1, [new TreeNode<number>(2, [])])) as any;
    expect(t.pathFromRoot(2)).toEqual([1, 2]);
  });
});
