/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import 'rxjs/add/observable/of';
import 'rxjs/add/operator/toPromise';

import {Observable} from 'rxjs/Observable';

import {ActivatedRoute, ActivatedRouteSnapshot, RouterState, RouterStateSnapshot, equalParamsAndUrlSegments} from '../src/router_state';
import {Params} from '../src/shared';
import {UrlSegment} from '../src/url_tree';
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

  describe('RouterState with Params', () => {
    let state: RouterState;
    let a: ActivatedRoute;
    let b: ActivatedRoute;
    let c: ActivatedRoute;

    beforeEach(() => {
      a = createActivatedRouteWithParams('a', {
        'param1': 'a',
        'param2': 'b',
      });
      b = createActivatedRouteWithParams('b', {
        'param3': 'c',
        'param4': 'd',
      });
      c = createActivatedRouteWithParams('c', {
        'param5': 'e',
        'param6': 'f',
      });

      const root = new TreeNode(a, [new TreeNode(b, [new TreeNode(c, [])])]);

      state = new RouterState(root, <any>null);
    });

    it('should return params from root', () => {
      return c.paramsFromRoot.toPromise().then((params) => {
        expect(params['param1']).toBe('a');
        expect(params['param2']).toBe('b');
        expect(params['param3']).toBe('c');
        expect(params['param4']).toBe('d');
        expect(params['param5']).toBe('e');
        expect(params['param6']).toBe('f');
      });
    });
  });

  describe('equalParamsAndUrlSegments', () => {
    function createSnapshot(params: Params, url: UrlSegment[]): ActivatedRouteSnapshot {
      return new ActivatedRouteSnapshot(
          url, params, <any>null, <any>null, <any>null, <any>null, <any>null, <any>null, <any>null,
          -1, null);
    }

    it('should return false when params are different', () => {
      expect(equalParamsAndUrlSegments(createSnapshot({a: 1}, []), createSnapshot({a: 2}, [])))
          .toEqual(false);
    });

    it('should return false when urls are different', () => {
      expect(equalParamsAndUrlSegments(
                 createSnapshot({a: 1}, [new UrlSegment('a', {})]),
                 createSnapshot({a: 1}, [new UrlSegment('b', {})])))
          .toEqual(false);
    });

    it('should return true othewise', () => {
      expect(equalParamsAndUrlSegments(
                 createSnapshot({a: 1}, [new UrlSegment('a', {})]),
                 createSnapshot({a: 1}, [new UrlSegment('a', {})])))
          .toEqual(true);
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

function createActivatedRouteWithParams(cmp: string, params: Params) {
  return new ActivatedRoute(
      <any>null, Observable.of(params), <any>null, <any>null, <any>null, <any>null, <any>cmp,
      <any>null);
}
