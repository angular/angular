/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ActivatedRoute, ActivatedRouteSnapshot, RouterState, RouterStateSnapshot} from '../src/router_state';
import {TreeNode} from '../src/utils/tree';

describe('RouterState & Snapshot', () => {
  describe('RouterStateSnapshot', () => {
    let state: RouterStateSnapshot;
    let a: ActivatedRouteSnapshot;
    let b: ActivatedRouteSnapshot;
    let c: ActivatedRouteSnapshot;

    beforeEach(() => {
      a = createActivatedRouteSnapshot('a');
      b = createActivatedRouteSnapshot('b');
      c = createActivatedRouteSnapshot('c');

      const root = new TreeNode(a, [new TreeNode(b, []), new TreeNode(c, [])]);

      state = new RouterStateSnapshot('url', root);
    });

    it('should return first child', () => { expect(state.root.firstChild).toBe(b); });

    it('should return children', () => {
      const cc = state.root.children;
      expect(cc[0]).toBe(b);
      expect(cc[1]).toBe(c);
    });

    it('should return root', () => {
      const b = state.root.firstChild;
      expect(b.root).toBe(state.root);
    });

    it('should return parent', () => {
      const b = state.root.firstChild;
      expect(b.parent).toBe(state.root);
    });

    it('should return path from root', () => {
      const b = state.root.firstChild;
      const p = b.pathFromRoot;
      expect(p[0]).toBe(state.root);
      expect(p[1]).toBe(b);
    });
  });

  describe('RouterState', () => {
    let state: RouterState;
    let a: ActivatedRoute;
    let b: ActivatedRoute;
    let c: ActivatedRoute;

    beforeEach(() => {
      a = createActivatedRoute('a');
      b = createActivatedRoute('b');
      c = createActivatedRoute('c');

      const root = new TreeNode(a, [new TreeNode(b, []), new TreeNode(c, [])]);

      state = new RouterState(root, <any>null);
    });

    it('should return first child', () => { expect(state.root.firstChild).toBe(b); });

    it('should return children', () => {
      const cc = state.root.children;
      expect(cc[0]).toBe(b);
      expect(cc[1]).toBe(c);
    });

    it('should return root', () => {
      const b = state.root.firstChild;
      expect(b.root).toBe(state.root);
    });

    it('should return parent', () => {
      const b = state.root.firstChild;
      expect(b.parent).toBe(state.root);
    });

    it('should return path from root', () => {
      const b = state.root.firstChild;
      const p = b.pathFromRoot;
      expect(p[0]).toBe(state.root);
      expect(p[1]).toBe(b);
    });
  });
});

function createActivatedRouteSnapshot(cmp: string) {
  return new ActivatedRouteSnapshot(
      <any>null, <any>null, <any>null, <any>null, <any>null, <any>null, <any>cmp, <any>null,
      <any>null, -1, null);
}

function createActivatedRoute(cmp: string) {
  return new ActivatedRoute(
      <any>null, <any>null, <any>null, <any>null, <any>null, <any>null, <any>cmp, <any>null);
}
