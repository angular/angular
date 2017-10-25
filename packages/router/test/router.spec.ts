/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Location} from '@angular/common';
import {TestBed, inject} from '@angular/core/testing';

import {ResolveData, Route} from '../src/config';
import {ChildActivationStart} from '../src/events';
import {PreActivation} from '../src/pre_activation';
import {Router} from '../src/router';
import {ChildrenOutletContexts} from '../src/router_outlet_context';
import {ActivatedRouteSnapshot, RouterStateSnapshot, createEmptyStateSnapshot, RouteSnapshot, createEmptyRouteSnapshotTree, createRouterStateSnapshot} from '../src/router_state';
import {DefaultUrlSerializer} from '../src/url_tree';
import {TreeNode} from '../src/utils/tree';
import {RouterTestingModule} from '../testing/src/router_testing_module';

import {Logger, createActivatedRouteSnapshot, provideTokenLogger, createRouteSnapshot} from './helpers';
import { Type } from "core";

describe('Router', () => {
  describe('resetRootComponentType', () => {
    class NewRootComponent {}

    beforeEach(() => { TestBed.configureTestingModule({imports: [RouterTestingModule]}); });

    it('should not change root route when updating the root component', () => {
      const r: Router = TestBed.get(Router);
      const root = r.routerState.root;

      r.resetRootComponentType(NewRootComponent);

      expect(r.routerState.root).toBe(root);
    });
  });

  describe('setUpLocationChangeListener', () => {
    beforeEach(() => { TestBed.configureTestingModule({imports: [RouterTestingModule]}); });

    it('should be idempotent', inject([Router, Location], (r: Router, location: Location) => {
         r.setUpLocationChangeListener();
         const a = (<any>r).locationSubscription;
         r.setUpLocationChangeListener();
         const b = (<any>r).locationSubscription;

         expect(a).toBe(b);

         r.dispose();
         r.setUpLocationChangeListener();
         const c = (<any>r).locationSubscription;

         expect(c).not.toBe(b);
       }));
  });

  fdescribe('PreActivation', () => {
    const serializer = new DefaultUrlSerializer();
    const inj = {get: (token: any) => () => `${token}_value`};
    let empty: TreeNode<RouteSnapshot>;
    let logger: Logger;
    let events: any[];

    const CA_CHILD = 'canActivate_child';
    const CA_CHILD_FALSE = 'canActivate_child_false';
    const CAC_CHILD = 'canActivateChild_child';
    const CAC_CHILD_FALSE = 'canActivateChild_child_false';
    const CA_GRANDCHILD = 'canActivate_grandchild';
    const CA_GRANDCHILD_FALSE = 'canActivate_grandchild_false';
    const CDA_CHILD = 'canDeactivate_child';
    const CDA_CHILD_FALSE = 'canDeactivate_child_false';
    const CDA_GRANDCHILD = 'canDeactivate_grandchild';
    const CDA_GRANDCHILD_FALSE = 'canDeactivate_grandchild_false';

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          Logger, provideTokenLogger(CA_CHILD), provideTokenLogger(CA_CHILD_FALSE, false),
          provideTokenLogger(CAC_CHILD), provideTokenLogger(CAC_CHILD_FALSE, false),
          provideTokenLogger(CA_GRANDCHILD), provideTokenLogger(CA_GRANDCHILD_FALSE, false),
          provideTokenLogger(CDA_CHILD), provideTokenLogger(CDA_CHILD_FALSE, false),
          provideTokenLogger(CDA_GRANDCHILD), provideTokenLogger(CDA_GRANDCHILD_FALSE, false)
        ]
      });

    });

    beforeEach(inject([Logger], (_logger: Logger) => {
      empty = createEmptyRouteSnapshotTree();
      logger = _logger;
      events = [];
    }));

    describe('ChildActivation', () => {
      fit('should run', () => {
        /**
         * R  -->  R (ChildActivationStart)
         *          \
         *           child
         */
        let result = false;
        const childSnapshot = createRouteSnapshot({configPath: [0]});
        const futureState = {value: empty.value, children: [{value: childSnapshot, children: []}]};
        const p = createPreactivation(futureState, empty, [{path: 'child'}], TestBed, {forwardEvent: (evt) => { events.push(evt); }});
        p.initialize(new ChildrenOutletContexts());
        p.checkGuards().subscribe((x) => result = x, (e) => { throw e; });
        expect(result).toBe(true);
        expect(events.length).toEqual(2);
        expect(events[0].snapshot).toBe(events[0].snapshot.root);
        expect(events[1].snapshot.routeConfig.path).toBe('child');
      });

      it('should run from top to bottom', () => {
        /**
         * R  -->  R (ChildActivationStart)
         *          \
         *           child (ChildActivationStart)
         *            \
         *             grandchild (ChildActivationStart)
         *              \
         *               great grandchild
         */
        let result = false;
        const childSnapshot = createRouteSnapshot({fragment: 'child'});
        const grandchildSnapshot = createRouteSnapshot({fragment: 'grandchild'});
        const greatGrandchildSnapshot = createRouteSnapshot({fragment: 'great-grandchild'});

        const futureState = {value: empty.value, children: [{value: childSnapshot, children: [
                  {value: grandchildSnapshot, children: [{value: greatGrandchildSnapshot, children: []}]}]}]};



        const p = createPreactivation(futureState, empty, [], TestBed, {forwardEvent: (evt) => { events.push(evt); }});
        p.initialize(new ChildrenOutletContexts());
        p.checkGuards().subscribe((x) => result = x, (e) => { throw e; });

        expect(result).toBe(true);
        expect(events.length).toEqual(6);
        expect(events[0].snapshot).toBe(events[0].snapshot.root);
        expect(events[2].snapshot.routeConfig.path).toBe('child');
        expect(events[4].snapshot.routeConfig.path).toBe('grandchild');
        expect(events[5].snapshot.routeConfig.path).toBe('great-grandchild');
      });

      it('should not run for unchanged routes', () => {
        /**
         *         R  -->  R
         *        / \
         *   child   child (ChildActivationStart)
         *            \
         *             grandchild
         */
        let result = false;
        const childSnapshot = createRouteSnapshot({fragment: 'child'});
        const grandchildSnapshot = createRouteSnapshot({fragment: 'grandchild'});
        const currentState = {value: empty.value, children:[{value: childSnapshot, children: []}]};
        const futureState = {
          value: empty.value,
          children: [
            {
              value: childSnapshot,
              children: [
                {value: grandchildSnapshot, children: []}
              ]
            }
          ]};

        const p = createPreactivation(futureState, currentState, [], TestBed, {forwardEvent: (evt) => { events.push(evt); }});
        p.initialize(new ChildrenOutletContexts());
        p.checkGuards().subscribe((x) => result = x, (e) => { throw e; });

        expect(result).toBe(true);
        expect(events.length).toEqual(2);
        expect(events[0].snapshot).not.toBe(events[0].snapshot.root);
        expect(events[0].snapshot.routeConfig.path).toBe('child');
      });

      it('should skip multiple unchanged routes but fire for all changed routes', () => {
        /**
         *         R  -->  R
         *            / \
         *       child   child
         *          /     \
         * grandchild      grandchild (ChildActivationStart)
         *                  \
         *                   greatgrandchild (ChildActivationStart)
         *                    \
         *                     great-greatgrandchild
         */
        let result = false;

        const childSnapshot = createRouteSnapshot({fragment: 'child'});
        const grandchildSnapshot = createRouteSnapshot({fragment: 'grandchild'});
        const greatGrandchildSnapshot = createRouteSnapshot({fragment: 'greatgrandchild'});
        const greatGreatGrandchildSnapshot = createRouteSnapshot({fragment: 'great-greatgrandchild'});


        const currentRoot = {value:
                empty.value, children: [{value: childSnapshot, children: [{value: grandchildSnapshot, children: []}]}]};

        const futureRoot = {
            value: empty.value,
            children:
              [
                {
                  value: childSnapshot,
                  children: [
                    {
                      value: grandchildSnapshot,
                      children:
                        [
                          {
                            value: greatGrandchildSnapshot,
                            children: [{
                              value: greatGreatGrandchildSnapshot, children: []
                            }]
                          }]
                    }]
                }
              ]
            };
      const p = createPreactivation(futureRoot, currentRoot, [], TestBed, {forwardEvent: (evt) => { events.push(evt); }});
        p.initialize(new ChildrenOutletContexts());
        p.checkGuards().subscribe((x) => result = x, (e) => { throw e; });

        expect(result).toBe(true);
        expect(events.length).toEqual(4);
        expect(events[0] instanceof ChildActivationStart).toBe(true);
        expect(events[0].snapshot).not.toBe(events[0].snapshot.root);
        expect(events[0].snapshot.routeConfig.path).toBe('grandchild');
        expect(events[2].snapshot.routeConfig.path).toBe('greatgrandchild');
      });
    });

    describe('guards', () => {
      it('should run CanActivate checks', () => {
        /**
         * R  -->  R
         *          \
         *           child (CA, CAC)
         *            \
         *             grandchild (CA)
         */

        const childSnapshot = createRouteSnapshot({fragment: 'child', configPath: [0]});
        const grandchildSnapshot = createRouteSnapshot({fragment: 'grandchild', configPath: [0, 0]});
        const routes = [
          {
            canActivate: [CA_CHILD],
            canActivateChild: [CAC_CHILD],
            children: [
              {canActivate: [CA_GRANDCHILD]}
            ]
          }
        ]

        const futureState = {
          value: empty.value,
          children: [{value: childSnapshot, children: [{value: grandchildSnapshot, children: []}]}]};

        checkGuards(futureState, empty, routes, TestBed, (result) => {
          expect(result).toBe(true);
          expect(logger.logs).toEqual([CA_CHILD, CAC_CHILD, CA_GRANDCHILD]);
        });
      });

      it('should not run grandchild guards if child fails', () => {
        /**
         * R  -->  R
         *          \
         *           child (CA: x, CAC)
         *            \
         *             grandchild (CA)
         */

        const childSnapshot = createRouteSnapshot({fragment: 'child', configPath: [0]});
        const grandchildSnapshot = createRouteSnapshot({fragment: 'grandchild', configPath: [0, 0]});
        const routes = [{
          canActivate: [CA_CHILD_FALSE],
          canActivateChild: [CAC_CHILD],
          children: [
            {canActivate: [CA_GRANDCHILD]}
          ]
        }];

        const futureState = {value: empty.value, children: [{value: childSnapshot, children: [{value: grandchildSnapshot, children: []}]}]};

        checkGuards(futureState, empty, routes, TestBed, (result) => {
          expect(result).toBe(false);
          expect(logger.logs).toEqual([CA_CHILD_FALSE]);
        });
      });

      it('should not run grandchild guards if child canActivateChild fails', () => {
        /**
         * R  -->  R
         *          \
         *           child (CA, CAC: x)
         *            \
         *             grandchild (CA)
         */

        const childSnapshot = createRouteSnapshot({fragment: 'child', configPath: [0]});
        const grandchildSnapshot = createRouteSnapshot({fragment: 'grandchild', configPath: [0, 0]});
        const routes = [{
          canActivate: [CA_CHILD],
          canActivateChild: [CAC_CHILD_FALSE],
          children: [
            {canActivate: [CA_GRANDCHILD]}
          ]
        }];
        const futureState = {value:
                empty.value, children: [{value: childSnapshot, children: [{value: grandchildSnapshot, children: []}]}]};

        checkGuards(futureState, empty, routes, TestBed, (result) => {
          expect(result).toBe(false);
          expect(logger.logs).toEqual([CA_CHILD, CAC_CHILD_FALSE]);
        });
      });

      it('should run deactivate guards before activate guards', () => {
        /**
         *      R  -->  R
         *     /         \
         *    prev (CDA)  child (CA)
         *                 \
         *                  grandchild (CA)
         */

        const prevSnapshot = createRouteSnapshot({fragment: 'prev', configPath: [0]});
        const childSnapshot = createRouteSnapshot({fragment: 'child', configPath: [1]});
        const grandchildSnapshot = createRouteSnapshot({fragment: 'grandchild', configPath: [1, 0]});

        const routes = [{
          canDeactivate: [CDA_CHILD],
          children: []
        },
        {
          canActivate: [CA_CHILD],
          canActivateChild: [CAC_CHILD],
          children: [{
            canActivate: [CA_GRANDCHILD]
          }]
        }];

        const currentState = {value: empty.value, children: [{value: prevSnapshot, children: []}]};

        const futureState = {value: empty.value, children: [{value: childSnapshot, children: [{value: grandchildSnapshot, children: []}]}]};

        checkGuards(futureState, currentState, routes, TestBed, (result) => {
          expect(logger.logs).toEqual([CDA_CHILD, CA_CHILD, CAC_CHILD, CA_GRANDCHILD]);
        });
      });

      it('should not run activate if deactivate fails guards', () => {
        /**
         *      R  -->  R
         *     /         \
         *    prev (CDA)  child (CA)
         *                 \
         *                  grandchild (CA)
         */

        const prevSnapshot = createRouteSnapshot({fragment: 'prev', configPath: [0]});
        const childSnapshot = createRouteSnapshot({fragment: 'child', configPath: [1]});
        const grandchildSnapshot = createRouteSnapshot({fragment: 'grandchild', configPath: [1, 0]});
        const routes = [{
          canDeactivate: [CDA_CHILD_FALSE],
          children: []
        },
        {
          canActivate: [CA_CHILD],
          canActivateChild: [CAC_CHILD],
          children: [{
            canActivate: [CA_GRANDCHILD]
          }]
        }];
        const currentState = {value: empty.value, children: [{value: prevSnapshot, children: []}]};

        const futureState = {value: empty.value, children: [{value: childSnapshot, children: [{value:grandchildSnapshot, children: []}]}]};

        checkGuards(futureState, currentState, routes, TestBed, (result) => {
          expect(result).toBe(false);
          expect(logger.logs).toEqual([CDA_CHILD_FALSE]);
        });
      });
      it('should deactivate from bottom up, then activate top down', () => {
        /**
         *      R     -->      R
         *     /                \
         *    prevChild (CDA)    child (CA)
         *   /                    \
         *  prevGrandchild(CDA)    grandchild (CA)
         */

        const prevChildSnapshot = createRouteSnapshot({fragment: 'prev_child', configPath: [0]});
        const prevGrandchildSnapshot = createRouteSnapshot({fragment: 'prev_grandchild', configPath: [0, 0]});
        const childSnapshot = createRouteSnapshot({fragment: 'child', configPath: [1]});
        const grandchildSnapshot = createRouteSnapshot({fragment: 'grandchild', configPath: [1, 0]});
        const routes = [{
          canDeactivate: [CDA_CHILD],
          children: [{
            canDeactivate: [CDA_GRANDCHILD],
            children: []
          }]
        }, 
        {
          canActivate: [CA_CHILD],
          canActivateChild: [CAC_CHILD],
          children: [{
            canActivate: [CA_GRANDCHILD]
          }]
        }];
        
        const currentState = {value: empty.value, children: [
              {value: prevChildSnapshot, children: [{value: prevGrandchildSnapshot, children: []}]}]};

        const futureState = {value: empty.value, children: [{value: childSnapshot, children: [{value:grandchildSnapshot, children: []}]}]};

        checkGuards(futureState, currentState, routes, TestBed, (result) => {
          expect(result).toBe(true);
          expect(logger.logs).toEqual([
            CDA_GRANDCHILD, CDA_CHILD, CA_CHILD, CAC_CHILD, CA_GRANDCHILD
          ]);
        });

        logger.empty();
        checkGuards(currentState, futureState, routes, TestBed, (result) => {
          expect(result).toBe(true);
          expect(logger.logs).toEqual([]);
        });
      });
    });

    xdescribe('resolve', () => {

    //   it('should resolve data', () => {
    //     /**
    //      * R  -->  R
    //      *          \
    //      *           a
    //      */
    //     const r = {data: 'resolver'};
    //     const n = createActivatedRouteSnapshot({component: 'a', resolve: r});
    //     const s = new RouterStateSnapshot('url', {value: empty.root, children: [{value: n, children: []}]});

    //     checkResolveData(s, empty, inj, () => {
    //       expect(s.root.firstChild !.data).toEqual({data: 'resolver_value'});
    //     });
    //   });

    //   it('should wait for the parent resolve to complete', () => {
    //     /**
    //      * R  -->  R
    //      *          \
    //      *           null (resolve: parentResolve)
    //      *            \
    //      *             b (resolve: childResolve)
    //      */
    //     const parentResolve = {data: 'resolver'};
    //     const childResolve = {};

    //     const parent = createActivatedRouteSnapshot({component: null !, resolve: parentResolve});
    //     const child = createActivatedRouteSnapshot({component: 'b', resolve: childResolve});

    //     const s = new RouterStateSnapshot(
    //         'url', {value: empty.root, children: [{value: parent, children: [{value: child, children: []}]}]});

    //     const inj = {get: (token: any) => () => Promise.resolve(`${token}_value`)};

    //     checkResolveData(s, empty, inj, () => {
    //       expect(s.root.firstChild !.firstChild !.data).toEqual({data: 'resolver_value'});
    //     });
    //   });

    //   it('should copy over data when creating a snapshot', () => {
    //     /**
    //      * R  -->  R         -->         R
    //      *          \                     \
    //      *           n1 (resolve: r1)      n21 (resolve: r1)
    //      *                                  \
    //      *                                   n22 (resolve: r2)
    //      */
    //     const r1 = {data: 'resolver1'};
    //     const r2 = {data: 'resolver2'};

    //     const n1 = createActivatedRouteSnapshot({component: 'a', resolve: r1});
    //     const s1 = new RouterStateSnapshot('url', {value: empty.root, children: [{value: n1, children: []}]});
    //     checkResolveData(s1, empty, inj, () => {});

    //     const n21 = createActivatedRouteSnapshot({component: 'a', resolve: r1});
    //     const n22 = createActivatedRouteSnapshot({component: 'b', resolve: r2});
    //     const s2 = new RouterStateSnapshot(
    //         'url', {value: empty.root, children: [{value:n21, children: [{value:n22, children:[]}]}]});
    //     checkResolveData(s2, s1, inj, () => {
    //       expect(s2.root.firstChild !.data).toEqual({data: 'resolver1_value'});
    //       expect(s2.root.firstChild !.firstChild !.data).toEqual({data: 'resolver2_value'});
    //     });
    //   });
    });
  });
});

// function checkResolveData(
//     future: RouterStateSnapshot, curr: RouterStateSnapshot, injector: any, check: any): void {
//   const p = new PreActivation(future, curr, injector);
//   p.initialize(new ChildrenOutletContexts());
//   p.resolveData().subscribe(check, (e) => { throw e; });
// }

function checkGuards(
    future: TreeNode<RouteSnapshot>, curr: TreeNode<RouteSnapshot>, routes: Route[], injector: any,
    check: (result: boolean) => void): void {
  const p = createPreactivation(future, curr, routes, injector);
  p.initialize(new ChildrenOutletContexts());
  p.checkGuards().subscribe(check, (e) => { throw e; });
}

function createPreactivation(future: TreeNode<RouteSnapshot>, curr: TreeNode<RouteSnapshot>, routes: Route[], injector: any,
  options: {url?: string, component?: Type<any>|null, forwardEvent?: (evt: any) => void} = {}) {
  options = {...{url: '/', component: null}, ...options};
  const serializer = new DefaultUrlSerializer();
  const urlTree = serializer.parse(options.url!);
  const currLegacy = createRouterStateSnapshot(options.url!, urlTree, curr, options.component!, routes);
  const futureLegacy = createRouterStateSnapshot(options.url!, urlTree, future, options.component!, routes);
  return new PreActivation(future, curr, {curr: currLegacy, future: futureLegacy}, routes, injector, options.forwardEvent);
};