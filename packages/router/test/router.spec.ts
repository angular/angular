/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Location} from '@angular/common';
import {TestBed, inject} from '@angular/core/testing';

import {ResolveData} from '../src/config';
import {PreActivation} from '../src/pre_activation';
import {Router} from '../src/router';
import {ChildrenOutletContexts} from '../src/router_outlet_context';
import {ActivatedRouteSnapshot, RouterStateSnapshot, createEmptyStateSnapshot} from '../src/router_state';
import {DefaultUrlSerializer} from '../src/url_tree';
import {TreeNode} from '../src/utils/tree';
import {RouterTestingModule} from '../testing/src/router_testing_module';

import {Logger, createActivatedRouteSnapshot, provideTokenLogger} from './helpers';

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

  describe('PreActivation', () => {
    const serializer = new DefaultUrlSerializer();
    const inj = {get: (token: any) => () => `${token}_value`};
    let empty: RouterStateSnapshot;
    let logger: Logger;

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
      empty = createEmptyStateSnapshot(serializer.parse('/'), null !);
      logger = _logger;
    }));

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

        const futureState = new RouterStateSnapshot(
            'url',
            new TreeNode(
                empty.root, [new TreeNode(childSnapshot, [new TreeNode(grandchildSnapshot, [])])]));

        checkGuards(futureState, empty, TestBed, (result) => {
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

        const futureState = new RouterStateSnapshot(
            'url',
            new TreeNode(
                empty.root, [new TreeNode(childSnapshot, [new TreeNode(grandchildSnapshot, [])])]));

        checkGuards(futureState, empty, TestBed, (result) => {
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

        const futureState = new RouterStateSnapshot(
            'url',
            new TreeNode(
                empty.root, [new TreeNode(childSnapshot, [new TreeNode(grandchildSnapshot, [])])]));

        checkGuards(futureState, empty, TestBed, (result) => {
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

        const currentState = new RouterStateSnapshot(
            'prev', new TreeNode(empty.root, [new TreeNode(prevSnapshot, [])]));

        const futureState = new RouterStateSnapshot(
            'url',
            new TreeNode(
                empty.root, [new TreeNode(childSnapshot, [new TreeNode(grandchildSnapshot, [])])]));

        checkGuards(futureState, currentState, TestBed, (result) => {
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

        const prevSnapshot = createActivatedRouteSnapshot(
            {component: 'prev', routeConfig: {canDeactivate: [CDA_CHILD_FALSE]}});
        const childSnapshot = createActivatedRouteSnapshot({
          component: 'child',
          routeConfig: {canActivate: [CA_CHILD], canActivateChild: [CAC_CHILD]}
        });
        const grandchildSnapshot = createActivatedRouteSnapshot(
            {component: 'grandchild', routeConfig: {canActivate: [CA_GRANDCHILD]}});

        const currentState = new RouterStateSnapshot(
            'prev', new TreeNode(empty.root, [new TreeNode(prevSnapshot, [])]));
        const futureState = new RouterStateSnapshot(
            'url',
            new TreeNode(
                empty.root, [new TreeNode(childSnapshot, [new TreeNode(grandchildSnapshot, [])])]));

        checkGuards(futureState, currentState, TestBed, (result) => {
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

        const currentState = new RouterStateSnapshot(
            'prev', new TreeNode(empty.root, [
              new TreeNode(prevChildSnapshot, [new TreeNode(prevGrandchildSnapshot, [])])
            ]));

        const futureState = new RouterStateSnapshot(
            'url',
            new TreeNode(
                empty.root, [new TreeNode(childSnapshot, [new TreeNode(grandchildSnapshot, [])])]));

        checkGuards(futureState, currentState, TestBed, (result) => {
          expect(result).toBe(true);
          expect(logger.logs).toEqual([
            CDA_GRANDCHILD, CDA_CHILD, CA_CHILD, CAC_CHILD, CA_GRANDCHILD
          ]);
        });

        logger.empty();
        checkGuards(currentState, futureState, TestBed, (result) => {
          expect(result).toBe(true);
          expect(logger.logs).toEqual([]);
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
        const r = {data: 'resolver'};
        const n = createActivatedRouteSnapshot({component: 'a', resolve: r});
        const s = new RouterStateSnapshot('url', new TreeNode(empty.root, [new TreeNode(n, [])]));

        checkResolveData(s, empty, inj, () => {
          expect(s.root.firstChild !.data).toEqual({data: 'resolver_value'});
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
        const parentResolve = {data: 'resolver'};
        const childResolve = {};

        const parent = createActivatedRouteSnapshot({component: null !, resolve: parentResolve});
        const child = createActivatedRouteSnapshot({component: 'b', resolve: childResolve});

        const s = new RouterStateSnapshot(
            'url', new TreeNode(empty.root, [new TreeNode(parent, [new TreeNode(child, [])])]));

        const inj = {get: (token: any) => () => Promise.resolve(`${token}_value`)};

        checkResolveData(s, empty, inj, () => {
          expect(s.root.firstChild !.firstChild !.data).toEqual({data: 'resolver_value'});
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
        const r1 = {data: 'resolver1'};
        const r2 = {data: 'resolver2'};

        const n1 = createActivatedRouteSnapshot({component: 'a', resolve: r1});
        const s1 = new RouterStateSnapshot('url', new TreeNode(empty.root, [new TreeNode(n1, [])]));
        checkResolveData(s1, empty, inj, () => {});

        const n21 = createActivatedRouteSnapshot({component: 'a', resolve: r1});
        const n22 = createActivatedRouteSnapshot({component: 'b', resolve: r2});
        const s2 = new RouterStateSnapshot(
            'url', new TreeNode(empty.root, [new TreeNode(n21, [new TreeNode(n22, [])])]));
        checkResolveData(s2, s1, inj, () => {
          expect(s2.root.firstChild !.data).toEqual({data: 'resolver1_value'});
          expect(s2.root.firstChild !.firstChild !.data).toEqual({data: 'resolver2_value'});
        });
      });
    });
  });
});

function checkResolveData(
    future: RouterStateSnapshot, curr: RouterStateSnapshot, injector: any, check: any): void {
  const p = new PreActivation(future, curr, injector);
  p.initalize(new ChildrenOutletContexts());
  p.resolveData().subscribe(check, (e) => { throw e; });
}

function checkGuards(
    future: RouterStateSnapshot, curr: RouterStateSnapshot, injector: any,
    check: (result: boolean) => void): void {
  const p = new PreActivation(future, curr, injector);
  p.initalize(new ChildrenOutletContexts());
  p.checkGuards().subscribe(check, (e) => { throw e; });
}
