/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BehaviorSubject} from 'rxjs/BehaviorSubject';

import {
  ActivatedRoute, ActivatedRouteSnapshot, RouterState, RouterStateSnapshot, advanceActivatedRoute,
  equalParamsAndUrlSegments, RouteSnapshot, createActivatedRouteSnapshot, createRouterStateSnapshot
} from '../src/router_state';
import {Params} from '../src/shared';
import {UrlSegment} from '../src/url_tree';
import {TreeNode} from '../src/utils/tree';
import {Routes} from '../src/config';
import {DefaultUrlSerializer, PRIMARY_OUTLET, UrlTree} from '@angular/router';
import { createRouteSnapshot } from "./helpers";

describe('RouterState & Snapshot', () => {
  describe('RouterStateSnapshot', () => {
    let state: RouterStateSnapshot;
    let a: ActivatedRouteSnapshot;
    let b: ActivatedRouteSnapshot;
    let c: ActivatedRouteSnapshot;

    beforeEach(() => {
      a = createARS('a');
      b = createARS('b');
      c = createARS('c');

      const root = {value: a, children: [{value:b, children:[]}, {value:c, children: []}]};

      state = new RouterStateSnapshot('url', root);
    });

    it('should return first child', () => { expect(state.root.firstChild).toBe(b); });

    it('should return children', () => {
      const cc = state.root.children;
      expect(cc[0]).toBe(b);
      expect(cc[1]).toBe(c);
    });

    it('should return root', () => {
      const b = state.root.firstChild !;
      expect(b.root).toBe(state.root);
    });

    it('should return parent', () => {
      const b = state.root.firstChild !;
      expect(b.parent).toBe(state.root);
    });

    it('should return path from root', () => {
      const b = state.root.firstChild !;
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
      a = createAR('a');
      b = createAR('b');
      c = createAR('c');

      const root = {value: a, children: [{value: b, children: []}, {value: c, children: []}]};

      state = new RouterState(root, <any>null);
    });

    it('should return first child', () => { expect(state.root.firstChild).toBe(b); });

    it('should return children', () => {
      const cc = state.root.children;
      expect(cc[0]).toBe(b);
      expect(cc[1]).toBe(c);
    });

    it('should return root', () => {
      const b = state.root.firstChild !;
      expect(b.root).toBe(state.root);
    });

    it('should return parent', () => {
      const b = state.root.firstChild !;
      expect(b.parent).toBe(state.root);
    });

    it('should return path from root', () => {
      const b = state.root.firstChild !;
      const p = b.pathFromRoot;
      expect(p[0]).toBe(state.root);
      expect(p[1]).toBe(b);
    });
  });

  describe('equalParamsAndUrlSegments', () => {
    function createSnapshot(params: Params, url: UrlSegment[]): RouteSnapshot {
      return createRouteSnapshot({url, params});
    }

    function createSnapshotPairWithParent(
        params: [Params, Params], parentParams: [Params, Params],
        urls: [string, string]): [RouteSnapshot, RouteSnapshot] {
      const snapshot1 = createSnapshot(params[0], []);
      const snapshot2 = createSnapshot(params[1], []);

      throw new Error('We cannot represent parents');

      // const snapshot1Parent = createSnapshot(parentParams[0], [new UrlSegment(urls[0], {})]);
      // const snapshot2Parent = createSnapshot(parentParams[1], [new UrlSegment(urls[1], {})]);

      
      // snapshot1._routerState =
      //     new RouterStateSnapshot('', {value: snapshot1Parent, children: [{value: snapshot1, children: []}]});
      // snapshot2._routerState =
      //     new RouterStateSnapshot('', {value: snapshot2Parent, children: [{value: snapshot2, children: []}]});

      // return [snapshot1, snapshot2];
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

    it('should return false when upstream params are different', () => {
      const [snapshot1, snapshot2] =
          createSnapshotPairWithParent([{a: 1}, {a: 1}], [{b: 1}, {c: 1}], ['a', 'a']);

      expect(equalParamsAndUrlSegments(snapshot1, snapshot2)).toEqual(false);
    });

    it('should return false when upstream urls are different', () => {
      const [snapshot1, snapshot2] =
          createSnapshotPairWithParent([{a: 1}, {a: 1}], [{b: 1}, {b: 1}], ['a', 'b']);

      expect(equalParamsAndUrlSegments(snapshot1, snapshot2)).toEqual(false);
    });

    it('should return true when upstream urls and params are equal', () => {
      const [snapshot1, snapshot2] =
          createSnapshotPairWithParent([{a: 1}, {a: 1}], [{b: 1}, {b: 1}], ['a', 'a']);

      expect(equalParamsAndUrlSegments(snapshot1, snapshot2)).toEqual(true);
    });
  });

  describe('advanceActivatedRoute', () => {

    let route: ActivatedRoute;

    beforeEach(() => { route = createAR('a'); });

    function createSnapshot(params: Params, url: UrlSegment[]): ActivatedRouteSnapshot {
      const queryParams = {};
      const fragment = '';
      const data = {};
      const snapshot = new ActivatedRouteSnapshot(
          url, params, queryParams, fragment, data, <any>null, <any>null, <any>null, <any>null, -1,
          null !);
      const state = new RouterStateSnapshot('', {value: snapshot, children: []});
      snapshot._routerState = state;
      return snapshot;
    }

    it('should call change observers', () => {
      const firstPlace = createSnapshot({a: 1}, []);
      const secondPlace = createSnapshot({a: 2}, []);
      route.snapshot = firstPlace;
      route._futureSnapshot = secondPlace;

      let hasSeenDataChange = false;
      route.data.forEach((data) => { hasSeenDataChange = true; });
      advanceActivatedRoute(route);
      expect(hasSeenDataChange).toEqual(true);
    });
  });

  describe('RouteSnapshot createActivatedRouteSnapshot', () => {
    const serializer = new DefaultUrlSerializer();
    let snapshot: RouteSnapshot;
    let emptyUrlTree: UrlTree;

    beforeEach(() => {
      snapshot = {
        url: [], //UrlSegment[],
        params: {}, // Params,
        queryParams: {}, //Params,
        fragment: '',
        data: {}, // Data,
        outlet: '',
        configPath: [], // Path to config,
        urlTreeAddress: {urlSegmentGroupPath: [], urlSegmentIndex: 0}
      };
      emptyUrlTree = serializer.parse('/');
    });

    it('should set pass-through parameters from RouteSnapshot to ActivatedRouteSnapshot', () => {
      const newSnapshot = {
        params: { p: "1", q: "2" },
        queryParams: { debug: "true" },
        fragment: '/somewhere',
        data: {one: 1},
        outlet: "primary"
      };

      const converted = createActivatedRouteSnapshot(emptyUrlTree, {...snapshot, ...newSnapshot}, []);
      expect(converted.params).toEqual(newSnapshot.params);
      expect(converted.queryParams).toEqual(newSnapshot.queryParams);
      expect(converted.fragment).toEqual(newSnapshot.fragment);
      expect(converted.data).toEqual(newSnapshot.data);
      expect(converted.outlet).toEqual(newSnapshot.outlet);
    });

    it('should set url segments from RouteSnapshot to ActivatedRouteSnapshot', () => {
      const newSnapshot = {
        url: [
          { path: 'a', parameters: {p1: '1'} },
          { path: 'b', parameters: {p2: '2'} }
        ]
      };

      const converted = createActivatedRouteSnapshot(emptyUrlTree, {...snapshot, ...newSnapshot}, []);
      expect(converted.url).toEqual([
        new UrlSegment('a', {p1: '1'}),
        new UrlSegment('b', {p2: '2'})
      ]);
    });

    describe('Route Config', () => {
      let routes: Routes;
      class Cmp {}
      beforeEach(() => {
        routes = [{
          path: 'parent',
          children: [
            {path: 'child0'},
            {path: 'child1', children: [
              {path: 'grandchild1_0', component: Cmp}
            ]}
          ]
        }];
      });

      it('should set component in the ActivatedRouteSnapshot', () => {
        const newSnapshot = {
          configPath: [0, 1, 0]
        };

        const converted = createActivatedRouteSnapshot(emptyUrlTree, {...snapshot, ...newSnapshot}, routes);
        expect(converted.routeConfig !.path).toBe('grandchild1_0');
        expect(converted.routeConfig !.component).toBe(Cmp);
      });

      it('should set component and routerConfig to null when configPath is empty', () => {
        const newSnapshot = {
          configPath: []
        };

        const converted = createActivatedRouteSnapshot(emptyUrlTree, {...snapshot, ...newSnapshot}, routes);
        expect(converted.routeConfig).toBe(null);
        expect(converted.component).toBe(null);
      });

      it('should error when configPath goes out of bounds of routes', () => {
        // Test out of bounds
        expect(() => createActivatedRouteSnapshot(emptyUrlTree, {...snapshot, configPath: [1]}, routes)).toThrow();
        // Test no children when asked for
        expect(() => createActivatedRouteSnapshot(emptyUrlTree, {...snapshot, configPath: [0, 0, 0]}, routes)).toThrow();
      });
    });

    describe('Setting UrlSegmentGroup', () => {
      let urlTree: UrlTree;

      beforeEach(() => {
        urlTree = serializer.parse('/a(aux:b/c//right:e/f)');
      });

      it('should set _urlSegment and _lastPathIndex in the ActivatedRouteSnapshot (primary outlet)', () => {
        const newSnapshot = {
          urlTreeAddress: {
            urlSegmentGroupPath: [PRIMARY_OUTLET],
            urlSegmentIndex: 0
          }
        };

        const converted = createActivatedRouteSnapshot(urlTree, {...snapshot, ...newSnapshot}, []);
        expect(converted._urlSegment.segments).toEqual([new UrlSegment('a', {})]);
        expect(converted._lastPathIndex).toEqual(0);
      });

      it('should set _urlSegment and _lastPathIndex in the ActivatedRouteSnapshot (secondary outlet)', () => {
        const newSnapshot = {
          urlTreeAddress: {
            urlSegmentGroupPath: ['aux'],
            urlSegmentIndex: 1
          }
        };

        const converted = createActivatedRouteSnapshot(urlTree, {...snapshot, ...newSnapshot}, []);
        expect(converted._urlSegment.segments).toEqual([new UrlSegment('b', {}), new UrlSegment('c', {})]);
        expect(converted._lastPathIndex).toEqual(1);
      });
    });
  });

  describe('RouteSnapshot createRouterStateSnapshot', () => {
    const serializer = new DefaultUrlSerializer();
    let snapshot: RouteSnapshot;
    let urlTree: UrlTree;

    beforeEach(() => {
      snapshot = {
        url: [], //UrlSegment[],
        params: {}, // Params,
        queryParams: {}, //Params,
        fragment: '',
        data: {}, // Data,
        outlet: '',
        configPath: [], // Path to config
        urlTreeAddress: {urlSegmentGroupPath: [], urlSegmentIndex: 0}
      };
      urlTree = serializer.parse('/');
    });

    class RootCmp {}

    it('should work', () => {
      const root = {
        value: {...snapshot, url: [{path: 'parent', parameters: {}}]},
        children: [
          {
            value: {...snapshot, url: [{path: 'child', parameters: {}}]},
            children: []
          }
        ]
      };

      const rss = createRouterStateSnapshot('/parent/child', urlTree, root, RootCmp, []);
      expect(rss.url).toBe('/parent/child');
      expect(rss.root.component).toBe(RootCmp);
      expect(rss.root instanceof ActivatedRouteSnapshot).toBe(true);
      expect(rss.root.url[0].path).toBe('parent');
      expect(rss.root.firstChild!.url[0].path).toBe('child');
    });
  });
});

function createARS(cmp: string) {
  return new ActivatedRouteSnapshot(
      <any>null, <any>null, <any>null, <any>null, <any>null, <any>null, <any>cmp, <any>null,
      <any>null, -1, null !);
}

function createAR(cmp: string) {
  return new ActivatedRoute(
      new BehaviorSubject([new UrlSegment('', {})]), new BehaviorSubject({}), <any>null, <any>null,
      new BehaviorSubject({}), <any>null, <any>cmp, <any>null);
}
