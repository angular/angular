/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Location} from '@angular/common';
import {EnvironmentInjector} from '@angular/core';
import {inject, TestBed} from '@angular/core/testing';
import {RouterModule} from '@angular/router';
import {of} from 'rxjs';

import {ChildActivationStart} from '../src/events';
import {Routes} from '../src/models';
import {NavigationTransition} from '../src/navigation_transition';
import {checkGuards as checkGuardsOperator} from '../src/operators/check_guards';
import {resolveData as resolveDataOperator} from '../src/operators/resolve_data';
import {Router} from '../src/router';
import {ChildrenOutletContexts} from '../src/router_outlet_context';
import {createEmptyStateSnapshot, RouterStateSnapshot} from '../src/router_state';
import {DefaultUrlSerializer, UrlTree} from '../src/url_tree';
import {getAllRouteGuards} from '../src/utils/preactivation';
import {TreeNode} from '../src/utils/tree';

import {createActivatedRouteSnapshot, Logger, provideTokenLogger} from './helpers';

describe('Router', () => {
  describe('resetConfig', () => {
    class TestComponent {}

    beforeEach(() => {
      TestBed.configureTestingModule({imports: [RouterModule.forRoot([])]});
    });

    it('should copy config to avoid mutations of user-provided objects', () => {
      const r: Router = TestBed.inject(Router);
      const configs: Routes = [{
        path: 'a',
        component: TestComponent,
        children: [{path: 'b', component: TestComponent}, {path: 'c', component: TestComponent}]
      }];
      const children = configs[0].children!;

      r.resetConfig(configs);

      const rConfigs = r.config;
      const rChildren = rConfigs[0].children!;

      // routes array and shallow copy
      expect(configs).not.toBe(rConfigs);
      expect(configs[0]).not.toBe(rConfigs[0]);
      expect(configs[0].path).toBe(rConfigs[0].path);
      expect(configs[0].component).toBe(rConfigs[0].component);

      // children should be new array and routes shallow copied
      expect(children).not.toBe(rChildren);
      expect(children[0]).not.toBe(rChildren[0]);
      expect(children[0].path).toBe(rChildren[0].path);
      expect(children[1]).not.toBe(rChildren[1]);
      expect(children[1].path).toBe(rChildren[1].path);
    });
  });

  describe('resetRootComponentType', () => {
    class NewRootComponent {}

    beforeEach(() => {
      TestBed.configureTestingModule({imports: [RouterModule.forRoot([])]});
    });

    it('should not change root route when updating the root component', () => {
      const r: Router = TestBed.inject(Router);
      const root = r.routerState.root;

      (r as any).resetRootComponentType(NewRootComponent);

      expect(r.routerState.root).toBe(root);
    });
  });

  describe('setUpLocationChangeListener', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({imports: [RouterModule.forRoot([])]});
    });

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

  describe('PreActivation', () => {
    const serializer = new DefaultUrlSerializer();
    let empty: RouterStateSnapshot;
    let logger: Logger;
    let events: any[];

    const CA_CHILD = 'canActivate_child';
    const CA_CHILD_FALSE = 'canActivate_child_false';
    const CA_CHILD_REDIRECT = 'canActivate_child_redirect';
    const CAC_CHILD = 'canActivateChild_child';
    const CAC_CHILD_FALSE = 'canActivateChild_child_false';
    const CAC_CHILD_REDIRECT = 'canActivateChild_child_redirect';
    const CA_GRANDCHILD = 'canActivate_grandchild';
    const CA_GRANDCHILD_FALSE = 'canActivate_grandchild_false';
    const CA_GRANDCHILD_REDIRECT = 'canActivate_grandchild_redirect';
    const CDA_CHILD = 'canDeactivate_child';
    const CDA_CHILD_FALSE = 'canDeactivate_child_false';
    const CDA_CHILD_REDIRECT = 'canDeactivate_child_redirect';
    const CDA_GRANDCHILD = 'canDeactivate_grandchild';
    const CDA_GRANDCHILD_FALSE = 'canDeactivate_grandchild_false';
    const CDA_GRANDCHILD_REDIRECT = 'canDeactivate_grandchild_redirect';

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [RouterModule],
        providers: [
          Logger, provideTokenLogger(CA_CHILD), provideTokenLogger(CA_CHILD_FALSE, false),
          provideTokenLogger(CA_CHILD_REDIRECT, serializer.parse('/canActivate_child_redirect')),
          provideTokenLogger(CAC_CHILD), provideTokenLogger(CAC_CHILD_FALSE, false),
          provideTokenLogger(
              CAC_CHILD_REDIRECT, serializer.parse('/canActivateChild_child_redirect')),
          provideTokenLogger(CA_GRANDCHILD), provideTokenLogger(CA_GRANDCHILD_FALSE, false),
          provideTokenLogger(
              CA_GRANDCHILD_REDIRECT, serializer.parse('/canActivate_grandchild_redirect')),
          provideTokenLogger(CDA_CHILD), provideTokenLogger(CDA_CHILD_FALSE, false),
          provideTokenLogger(CDA_CHILD_REDIRECT, serializer.parse('/canDeactivate_child_redirect')),
          provideTokenLogger(CDA_GRANDCHILD), provideTokenLogger(CDA_GRANDCHILD_FALSE, false),
          provideTokenLogger(
              CDA_GRANDCHILD_REDIRECT, serializer.parse('/canDeactivate_grandchild_redirect'))
        ]
      });
    });

    beforeEach(inject([Logger], (_logger: Logger) => {
      empty = createEmptyStateSnapshot(serializer.parse('/'), null!);
      logger = _logger;
      events = [];
    }));

    describe('ChildActivation', () => {
      it('should run', () => {
        /**
         * R  -->  R (ChildActivationStart)
         *          \
         *           child
         */
        let result = false;
        const childSnapshot =
            createActivatedRouteSnapshot({component: 'child', routeConfig: {path: 'child'}});
        const futureState = new (RouterStateSnapshot as any)(
            'url', new TreeNode(empty.root, [new TreeNode(childSnapshot, [])]));
        // Since we only test the guards, we don't need to provide a full navigation
        // transition object with all properties set.
        const testTransition = {
          guards: getAllRouteGuards(futureState, empty, new ChildrenOutletContexts())
        } as NavigationTransition;

        of(testTransition)
            .pipe(checkGuardsOperator(
                TestBed.inject(EnvironmentInjector),
                (evt) => {
                  events.push(evt);
                }))
            .subscribe((x) => result = !!x.guardsResult, (e) => {
              throw e;
            });

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
        const childSnapshot =
            createActivatedRouteSnapshot({component: 'child', routeConfig: {path: 'child'}});
        const grandchildSnapshot = createActivatedRouteSnapshot(
            {component: 'grandchild', routeConfig: {path: 'grandchild'}});
        const greatGrandchildSnapshot = createActivatedRouteSnapshot(
            {component: 'great-grandchild', routeConfig: {path: 'great-grandchild'}});
        const futureState = new (RouterStateSnapshot as any)(
            'url',
            new TreeNode(
                empty.root, [new TreeNode(childSnapshot, [
                  new TreeNode(grandchildSnapshot, [new TreeNode(greatGrandchildSnapshot, [])])
                ])]));
        // Since we only test the guards, we don't need to provide a full navigation
        // transition object with all properties set.
        const testTransition = {
          guards: getAllRouteGuards(futureState, empty, new ChildrenOutletContexts())
        } as NavigationTransition;

        of(testTransition)
            .pipe(checkGuardsOperator(
                TestBed.inject(EnvironmentInjector),
                (evt) => {
                  events.push(evt);
                }))
            .subscribe((x) => result = !!x.guardsResult, (e) => {
              throw e;
            });

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
        const childSnapshot =
            createActivatedRouteSnapshot({component: 'child', routeConfig: {path: 'child'}});
        const grandchildSnapshot = createActivatedRouteSnapshot(
            {component: 'grandchild', routeConfig: {path: 'grandchild'}});
        const currentState = new (RouterStateSnapshot as any)(
            'url', new TreeNode(empty.root, [new TreeNode(childSnapshot, [])]));
        const futureState = new (RouterStateSnapshot as any)(
            'url',
            new TreeNode(
                empty.root, [new TreeNode(childSnapshot, [new TreeNode(grandchildSnapshot, [])])]));
        // Since we only test the guards, we don't need to provide a full navigation
        // transition object with all properties set.
        const testTransition = {
          guards: getAllRouteGuards(futureState, currentState, new ChildrenOutletContexts())
        } as NavigationTransition;

        of(testTransition)
            .pipe(checkGuardsOperator(
                TestBed.inject(EnvironmentInjector),
                (evt) => {
                  events.push(evt);
                }))
            .subscribe((x) => result = !!x.guardsResult, (e) => {
              throw e;
            });

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
        const childSnapshot =
            createActivatedRouteSnapshot({component: 'child', routeConfig: {path: 'child'}});
        const grandchildSnapshot = createActivatedRouteSnapshot(
            {component: 'grandchild', routeConfig: {path: 'grandchild'}});
        const greatGrandchildSnapshot = createActivatedRouteSnapshot(
            {component: 'greatgrandchild', routeConfig: {path: 'greatgrandchild'}});
        const greatGreatGrandchildSnapshot = createActivatedRouteSnapshot(
            {component: 'great-greatgrandchild', routeConfig: {path: 'great-greatgrandchild'}});
        const currentState = new (RouterStateSnapshot as any)(
            'url',
            new TreeNode(
                empty.root, [new TreeNode(childSnapshot, [new TreeNode(grandchildSnapshot, [])])]));
        const futureState = new (RouterStateSnapshot as any)(
            'url',
            new TreeNode(
                empty.root,
                [new TreeNode(
                    childSnapshot, [new TreeNode(grandchildSnapshot, [
                      new TreeNode(
                          greatGrandchildSnapshot, [new TreeNode(greatGreatGrandchildSnapshot, [])])
                    ])])]));
        // Since we only test the guards, we don't need to provide a full navigation
        // transition object with all properties set.
        const testTransition = {
          guards: getAllRouteGuards(futureState, currentState, new ChildrenOutletContexts())
        } as NavigationTransition;

        of(testTransition)
            .pipe(checkGuardsOperator(
                TestBed.inject(EnvironmentInjector),
                (evt) => {
                  events.push(evt);
                }))
            .subscribe((x) => result = !!x.guardsResult, (e) => {
              throw e;
            });

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

        const childSnapshot = createActivatedRouteSnapshot({
          component: 'child',
          routeConfig: {

            canActivate: [CA_CHILD],
            canActivateChild: [CAC_CHILD]
          }
        });
        const grandchildSnapshot = createActivatedRouteSnapshot(
            {component: 'grandchild', routeConfig: {canActivate: [CA_GRANDCHILD]}});

        const futureState = new (RouterStateSnapshot as any)(
            'url',
            new TreeNode(
                empty.root, [new TreeNode(childSnapshot, [new TreeNode(grandchildSnapshot, [])])]));

        checkGuards(futureState, empty, TestBed.inject(EnvironmentInjector), (result) => {
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

        const childSnapshot = createActivatedRouteSnapshot({
          component: 'child',
          routeConfig: {canActivate: [CA_CHILD_FALSE], canActivateChild: [CAC_CHILD]}
        });
        const grandchildSnapshot = createActivatedRouteSnapshot(
            {component: 'grandchild', routeConfig: {canActivate: [CA_GRANDCHILD]}});

        const futureState = new (RouterStateSnapshot as any)(
            'url',
            new TreeNode(
                empty.root, [new TreeNode(childSnapshot, [new TreeNode(grandchildSnapshot, [])])]));

        checkGuards(futureState, empty, TestBed.inject(EnvironmentInjector), (result) => {
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

        const childSnapshot = createActivatedRouteSnapshot({
          component: 'child',
          routeConfig: {canActivate: [CA_CHILD], canActivateChild: [CAC_CHILD_FALSE]}
        });
        const grandchildSnapshot = createActivatedRouteSnapshot(
            {component: 'grandchild', routeConfig: {canActivate: [CA_GRANDCHILD]}});

        const futureState = new (RouterStateSnapshot as any)(
            'url',
            new TreeNode(
                empty.root, [new TreeNode(childSnapshot, [new TreeNode(grandchildSnapshot, [])])]));

        checkGuards(futureState, empty, TestBed.inject(EnvironmentInjector), (result) => {
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

        const prevSnapshot = createActivatedRouteSnapshot(
            {component: 'prev', routeConfig: {canDeactivate: [CDA_CHILD]}});

        const childSnapshot = createActivatedRouteSnapshot({
          component: 'child',
          routeConfig: {canActivate: [CA_CHILD], canActivateChild: [CAC_CHILD]}
        });

        const grandchildSnapshot = createActivatedRouteSnapshot(
            {component: 'grandchild', routeConfig: {canActivate: [CA_GRANDCHILD]}});

        const currentState = new (RouterStateSnapshot as any)(
            'prev', new TreeNode(empty.root, [new TreeNode(prevSnapshot, [])]));

        const futureState = new (RouterStateSnapshot as any)(
            'url',
            new TreeNode(
                empty.root, [new TreeNode(childSnapshot, [new TreeNode(grandchildSnapshot, [])])]));

        checkGuards(futureState, currentState, TestBed.inject(EnvironmentInjector), (result) => {
          expect(logger.logs).toEqual([CDA_CHILD, CA_CHILD, CAC_CHILD, CA_GRANDCHILD]);
        });
      });

      it('should not run activate if deactivate fails guards', () => {
        /**
         *      R  -->     R
         *     /            \
         *    prev (CDA: x)  child (CA)
         *                    \
         *                     grandchild (CA)
         */

        const prevSnapshot = createActivatedRouteSnapshot(
            {component: 'prev', routeConfig: {canDeactivate: [CDA_CHILD_FALSE]}});
        const childSnapshot = createActivatedRouteSnapshot({
          component: 'child',
          routeConfig: {canActivate: [CA_CHILD], canActivateChild: [CAC_CHILD]}
        });
        const grandchildSnapshot = createActivatedRouteSnapshot(
            {component: 'grandchild', routeConfig: {canActivate: [CA_GRANDCHILD]}});

        const currentState = new (RouterStateSnapshot as any)(
            'prev', new TreeNode(empty.root, [new TreeNode(prevSnapshot, [])]));
        const futureState = new (RouterStateSnapshot as any)(
            'url',
            new TreeNode(
                empty.root, [new TreeNode(childSnapshot, [new TreeNode(grandchildSnapshot, [])])]));

        checkGuards(futureState, currentState, TestBed.inject(EnvironmentInjector), (result) => {
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

        const prevChildSnapshot = createActivatedRouteSnapshot(
            {component: 'prev_child', routeConfig: {canDeactivate: [CDA_CHILD]}});
        const prevGrandchildSnapshot = createActivatedRouteSnapshot(
            {component: 'prev_grandchild', routeConfig: {canDeactivate: [CDA_GRANDCHILD]}});
        const childSnapshot = createActivatedRouteSnapshot({
          component: 'child',
          routeConfig: {canActivate: [CA_CHILD], canActivateChild: [CAC_CHILD]}
        });
        const grandchildSnapshot = createActivatedRouteSnapshot(
            {component: 'grandchild', routeConfig: {canActivate: [CA_GRANDCHILD]}});

        const currentState = new (RouterStateSnapshot as any)(
            'prev', new TreeNode(empty.root, [
              new TreeNode(prevChildSnapshot, [new TreeNode(prevGrandchildSnapshot, [])])
            ]));

        const futureState = new (RouterStateSnapshot as any)(
            'url',
            new TreeNode(
                empty.root, [new TreeNode(childSnapshot, [new TreeNode(grandchildSnapshot, [])])]));

        checkGuards(futureState, currentState, TestBed.inject(EnvironmentInjector), (result) => {
          expect(result).toBe(true);
          expect(logger.logs).toEqual([
            CDA_GRANDCHILD, CDA_CHILD, CA_CHILD, CAC_CHILD, CA_GRANDCHILD
          ]);
        });

        logger.empty();
        checkGuards(currentState, futureState, TestBed.inject(EnvironmentInjector), (result) => {
          expect(result).toBe(true);
          expect(logger.logs).toEqual([]);
        });
      });

      describe('UrlTree', () => {
        it('should allow return of UrlTree from CanActivate', () => {
          /**
           * R  -->  R
           *          \
           *           child (CA: redirect)
           */

          const childSnapshot = createActivatedRouteSnapshot({
            component: 'child',
            routeConfig: {

              canActivate: [CA_CHILD_REDIRECT]
            }
          });

          const futureState = new (RouterStateSnapshot as any)(
              'url', new TreeNode(empty.root, [new TreeNode(childSnapshot, [])]));

          checkGuards(futureState, empty, TestBed.inject(EnvironmentInjector), (result) => {
            expect(serializer.serialize(result as UrlTree)).toBe('/' + CA_CHILD_REDIRECT);
            expect(logger.logs).toEqual([CA_CHILD_REDIRECT]);
          });
        });

        it('should allow return of UrlTree from CanActivateChild', () => {
          /**
           * R  -->  R
           *          \
           *           child (CAC: redirect)
           *            \
           *             grandchild (CA)
           */

          const childSnapshot = createActivatedRouteSnapshot(
              {component: 'child', routeConfig: {canActivateChild: [CAC_CHILD_REDIRECT]}});
          const grandchildSnapshot = createActivatedRouteSnapshot(
              {component: 'grandchild', routeConfig: {canActivate: [CA_GRANDCHILD]}});

          const futureState = new (RouterStateSnapshot as any)(
              'url', new TreeNode(empty.root, [
                new TreeNode(childSnapshot, [new TreeNode(grandchildSnapshot, [])])
              ]));

          checkGuards(futureState, empty, TestBed.inject(EnvironmentInjector), (result) => {
            expect(serializer.serialize(result as UrlTree)).toBe('/' + CAC_CHILD_REDIRECT);
            expect(logger.logs).toEqual([CAC_CHILD_REDIRECT]);
          });
        });

        it('should allow return of UrlTree from a child CanActivate', () => {
          /**
           * R  -->  R
           *          \
           *           child (CAC)
           *            \
           *             grandchild (CA: redirect)
           */

          const childSnapshot = createActivatedRouteSnapshot(
              {component: 'child', routeConfig: {canActivateChild: [CAC_CHILD]}});
          const grandchildSnapshot = createActivatedRouteSnapshot(
              {component: 'grandchild', routeConfig: {canActivate: [CA_GRANDCHILD_REDIRECT]}});

          const futureState = new (RouterStateSnapshot as any)(
              'url', new TreeNode(empty.root, [
                new TreeNode(childSnapshot, [new TreeNode(grandchildSnapshot, [])])
              ]));

          checkGuards(futureState, empty, TestBed.inject(EnvironmentInjector), (result) => {
            expect(serializer.serialize(result as UrlTree)).toBe('/' + CA_GRANDCHILD_REDIRECT);
            expect(logger.logs).toEqual([CAC_CHILD, CA_GRANDCHILD_REDIRECT]);
          });
        });

        it('should allow return of UrlTree from a child CanDeactivate', () => {
          /**
           *      R  -->            R
           *     /                   \
           *    prev (CDA: redirect)  child (CA)
           *                           \
           *                            grandchild (CA)
           */

          const prevSnapshot = createActivatedRouteSnapshot(
              {component: 'prev', routeConfig: {canDeactivate: [CDA_CHILD_REDIRECT]}});
          const childSnapshot = createActivatedRouteSnapshot({
            component: 'child',
            routeConfig: {canActivate: [CA_CHILD], canActivateChild: [CAC_CHILD]}
          });
          const grandchildSnapshot = createActivatedRouteSnapshot(
              {component: 'grandchild', routeConfig: {canActivate: [CA_GRANDCHILD]}});

          const currentState = new (RouterStateSnapshot as any)(
              'prev', new TreeNode(empty.root, [new TreeNode(prevSnapshot, [])]));
          const futureState = new (RouterStateSnapshot as any)(
              'url', new TreeNode(empty.root, [
                new TreeNode(childSnapshot, [new TreeNode(grandchildSnapshot, [])])
              ]));

          checkGuards(futureState, currentState, TestBed.inject(EnvironmentInjector), (result) => {
            expect(serializer.serialize(result as UrlTree)).toBe('/' + CDA_CHILD_REDIRECT);
            expect(logger.logs).toEqual([CDA_CHILD_REDIRECT]);
          });
        });
      });
    });

    describe('resolve', () => {
      it('should resolve data', () => {
        /**
         * R  -->  R
         *          \
         *           a
         */
        const r = {data: () => 'resolver_value'};
        const n = createActivatedRouteSnapshot({component: 'a', resolve: r});
        const s = new (RouterStateSnapshot as any)(
            'url', new TreeNode(empty.root, [new TreeNode(n, [])]));

        checkResolveData(s, empty, TestBed.inject(EnvironmentInjector), () => {
          expect(s.root.firstChild!.data).toEqual({data: 'resolver_value'});
        });
      });

      it('should wait for the parent resolve to complete', () => {
        /**
         * R  -->  R
         *          \
         *           null (resolve: parentResolve)
         *            \
         *             b (resolve: childResolve)
         */
        const parentResolve = {data: () => 'resolver_value'};
        const childResolve = {};

        const parent = createActivatedRouteSnapshot({component: null!, resolve: parentResolve});
        const child = createActivatedRouteSnapshot({component: 'b', resolve: childResolve});

        const s = new (RouterStateSnapshot as any)(
            'url', new TreeNode(empty.root, [new TreeNode(parent, [new TreeNode(child, [])])]));

        checkResolveData(s, empty, TestBed.inject(EnvironmentInjector), () => {
          expect(s.root.firstChild!.firstChild!.data).toEqual({data: 'resolver_value'});
        });
      });

      it('should copy over data when creating a snapshot', () => {
        /**
         * R  -->  R         -->         R
         *          \                     \
         *           n1 (resolve: r1)      n21 (resolve: r1)
         *                                  \
         *                                   n22 (resolve: r2)
         */
        const r1 = {data: () => 'resolver1_value'};
        const r2 = {data: () => 'resolver2_value'};

        const n1 = createActivatedRouteSnapshot({component: 'a', resolve: r1});
        const s1 = new (RouterStateSnapshot as any)(
            'url', new TreeNode(empty.root, [new TreeNode(n1, [])]));
        checkResolveData(s1, empty, TestBed.inject(EnvironmentInjector), () => {});

        const n21 = createActivatedRouteSnapshot({component: 'a', resolve: r1});
        const n22 = createActivatedRouteSnapshot({component: 'b', resolve: r2});
        const s2 = new (RouterStateSnapshot as any)(
            'url', new TreeNode(empty.root, [new TreeNode(n21, [new TreeNode(n22, [])])]));
        checkResolveData(s2, s1, TestBed.inject(EnvironmentInjector), () => {
          expect(s2.root.firstChild!.data).toEqual({data: 'resolver1_value'});
          expect(s2.root.firstChild!.firstChild!.data).toEqual({data: 'resolver2_value'});
        });
      });
    });
  });
});

function checkResolveData(
    future: RouterStateSnapshot, curr: RouterStateSnapshot, injector: EnvironmentInjector,
    check: any): void {
  // Since we only test the guards and their resolve data function, we don't need to provide
  // a full navigation transition object with all properties set.
  of({guards: getAllRouteGuards(future, curr, new ChildrenOutletContexts())} as
     NavigationTransition)
      .pipe(resolveDataOperator('emptyOnly', injector))
      .subscribe(check, (e) => {
        throw e;
      });
}

function checkGuards(
    future: RouterStateSnapshot, curr: RouterStateSnapshot, injector: EnvironmentInjector,
    check: (result: boolean|UrlTree) => void): void {
  // Since we only test the guards, we don't need to provide a full navigation
  // transition object with all properties set.
  of({guards: getAllRouteGuards(future, curr, new ChildrenOutletContexts())} as
     NavigationTransition)
      .pipe(checkGuardsOperator(injector))
      .subscribe({
        next(t) {
          if (t.guardsResult === null) throw new Error('Guard result expected');
          return check(t.guardsResult);
        },
        error(e) {
          throw e;
        }
      });
}
