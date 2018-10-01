/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '@angular/core';
import {Observable, MonoTypeOperatorFunction, from, of } from 'rxjs';
import {concatMap, every, first, map, mergeMap} from 'rxjs/operators';

import {LoadedRouterConfig, RunGuardsAndResolvers} from '../config';
import {ActivationStart, ChildActivationStart, Event} from '../events';
import {ChildrenOutletContexts, OutletContext} from '../router_outlet_context';
import {ActivatedRouteSnapshot, RouterStateSnapshot, equalParamsAndUrlSegments} from '../router_state';
import {andObservables, forEach, shallowEqual, wrapIntoObservable} from '../utils/collection';
import {TreeNode, nodeChildrenAsMap} from '../utils/tree';
import { NavigationTransition } from '../router';

export function checkGuards(
    rootContexts: ChildrenOutletContexts,
    moduleInjector: Injector,
    forwardEvent?: (evt: Event) => void): MonoTypeOperatorFunction<NavigationTransition> {
  return function(source: Observable<NavigationTransition>) {

    return source.pipe(mergeMap(t => {
      const {targetSnapshot, currentSnapshot} = t;
      const checks = getAllRouteGuards(targetSnapshot !, currentSnapshot, rootContexts);
      if (checks.canDeactivateChecks.length === 0 && checks.canActivateChecks.length === 0) {
        return of ({...t, guardsResult: true});
      }

      return runCanDeactivateChecks(checks, targetSnapshot !, currentSnapshot, moduleInjector)
          .pipe(
            mergeMap((canDeactivate: boolean) => {
              return canDeactivate ? 
              runCanActivateChecks(targetSnapshot !, checks, moduleInjector, forwardEvent) :
              of (false);
            }),
          map(guardsResult => ({...t, guardsResult})));
    }));
  };
}

function runCanDeactivateChecks(
    checks: Checks, futureRSS: RouterStateSnapshot, currRSS: RouterStateSnapshot,
    moduleInjector: Injector): Observable<boolean> {
  return from(checks.canDeactivateChecks)
      .pipe(
          mergeMap(
              (check: CanDeactivate) => runCanDeactivate(
                  check.component, check.route, currRSS, futureRSS, moduleInjector)),
          every((result: boolean) => result === true));
}

function runCanActivateChecks(
    futureSnapshot: RouterStateSnapshot, checks: Checks, moduleInjector: Injector,
    forwardEvent?: (evt: Event) => void): Observable<boolean> {
  return from(checks.canActivateChecks)
      .pipe(
          concatMap((check: CanActivate) => andObservables(from([
                      fireChildActivationStart(check.route.parent, forwardEvent),
                      fireActivationStart(check.route, forwardEvent),
                      runCanActivateChild(futureSnapshot, check.path, moduleInjector),
                      runCanActivate(futureSnapshot, check.route, moduleInjector)
                    ]))),
          every((result: boolean) => result === true));
}

/**
   * This should fire off `ActivationStart` events for each route being activated at this
   * level.
   * In other words, if you're activating `a` and `b` below, `path` will contain the
   * `ActivatedRouteSnapshot`s for both and we will fire `ActivationStart` for both. Always
   * return
   * `true` so checks continue to run.
   */
function fireActivationStart(
    snapshot: ActivatedRouteSnapshot | null,
    forwardEvent?: (evt: Event) => void): Observable<boolean> {
  if (snapshot !== null && forwardEvent) {
    forwardEvent(new ActivationStart(snapshot));
  }
  return of (true);
}

/**
   * This should fire off `ChildActivationStart` events for each route being activated at this
   * level.
   * In other words, if you're activating `a` and `b` below, `path` will contain the
   * `ActivatedRouteSnapshot`s for both and we will fire `ChildActivationStart` for both. Always
   * return
   * `true` so checks continue to run.
   */
function fireChildActivationStart(
    snapshot: ActivatedRouteSnapshot | null,
    forwardEvent?: (evt: Event) => void): Observable<boolean> {
  if (snapshot !== null && forwardEvent) {
    forwardEvent(new ChildActivationStart(snapshot));
  }
  return of (true);
}

function runCanActivate(
    futureRSS: RouterStateSnapshot, futureARS: ActivatedRouteSnapshot,
    moduleInjector: Injector): Observable<boolean> {
  const canActivate = futureARS.routeConfig ? futureARS.routeConfig.canActivate : null;
  if (!canActivate || canActivate.length === 0) return of (true);
  const obs = from(canActivate).pipe(map((c: any) => {
    const guard = getToken(c, futureARS, moduleInjector);
    let observable: Observable<boolean>;
    if (guard.canActivate) {
      observable = wrapIntoObservable(guard.canActivate(futureARS, futureRSS));
    } else {
      observable = wrapIntoObservable(guard(futureARS, futureRSS));
    }
    return observable.pipe(first());
  }));
  return andObservables(obs);
}

function runCanActivateChild(
    futureRSS: RouterStateSnapshot, path: ActivatedRouteSnapshot[],
    moduleInjector: Injector): Observable<boolean> {
  const futureARS = path[path.length - 1];

  const canActivateChildGuards = path.slice(0, path.length - 1)
                                     .reverse()
                                     .map(p => extractCanActivateChild(p))
                                     .filter(_ => _ !== null);

  return andObservables(from(canActivateChildGuards).pipe(map((d: any) => {
    const obs = from(d.guards).pipe(map((c: any) => {
      const guard = getToken(c, d.node, moduleInjector);
      let observable: Observable<boolean>;
      if (guard.canActivateChild) {
        observable = wrapIntoObservable(guard.canActivateChild(futureARS, futureRSS));
      } else {
        observable = wrapIntoObservable(guard(futureARS, futureRSS));
      }
      return observable.pipe(first());
    }));
    return andObservables(obs);
  })));
}

function extractCanActivateChild(p: ActivatedRouteSnapshot):
    {node: ActivatedRouteSnapshot, guards: any[]}|null {
  const canActivateChild = p.routeConfig ? p.routeConfig.canActivateChild : null;
  if (!canActivateChild || canActivateChild.length === 0) return null;
  return {node: p, guards: canActivateChild};
}

export function getToken(
    token: any, snapshot: ActivatedRouteSnapshot, moduleInjector: Injector): any {
  const config = closestLoadedConfig(snapshot);
  const injector = config ? config.module.injector : moduleInjector;
  return injector.get(token);
}

function closestLoadedConfig(snapshot: ActivatedRouteSnapshot): LoadedRouterConfig|null {
  if (!snapshot) return null;

  for (let s = snapshot.parent; s; s = s.parent) {
    const route = s.routeConfig;
    if (route && route._loadedConfig) return route._loadedConfig;
  }

  return null;
}

function runCanDeactivate(
    component: Object | null, currARS: ActivatedRouteSnapshot, currRSS: RouterStateSnapshot,
    futureRSS: RouterStateSnapshot, moduleInjector: Injector): Observable<boolean> {
  const canDeactivate = currARS && currARS.routeConfig ? currARS.routeConfig.canDeactivate : null;
  if (!canDeactivate || canDeactivate.length === 0) return of (true);
  const canDeactivate$ = from(canDeactivate).pipe(mergeMap((c: any) => {
    const guard = getToken(c, currARS, moduleInjector);
    let observable: Observable<boolean>;
    if (guard.canDeactivate) {
      observable = wrapIntoObservable(guard.canDeactivate(component, currARS, currRSS, futureRSS));
    } else {
      observable = wrapIntoObservable(guard(component, currARS, currRSS, futureRSS));
    }
    return observable.pipe(first());
  }));
  return canDeactivate$.pipe(every((result: any) => result === true));
}

class CanActivate {
  readonly route: ActivatedRouteSnapshot;
  constructor(public path: ActivatedRouteSnapshot[]) {
    this.route = this.path[this.path.length - 1];
  }
}

class CanDeactivate {
  constructor(public component: Object|null, public route: ActivatedRouteSnapshot) {}
}

export function getAllRouteGuards(
    future: RouterStateSnapshot, curr: RouterStateSnapshot,
    parentContexts: ChildrenOutletContexts) {
  const futureRoot = future._root;
  const currRoot = curr ? curr._root : null;

  return getChildRouteGuards(futureRoot, currRoot, parentContexts, [futureRoot.value]);
}

declare type Checks = {
  canDeactivateChecks: CanDeactivate[],
  canActivateChecks: CanActivate[],
};

function getChildRouteGuards(
    futureNode: TreeNode<ActivatedRouteSnapshot>, currNode: TreeNode<ActivatedRouteSnapshot>| null,
    contexts: ChildrenOutletContexts | null, futurePath: ActivatedRouteSnapshot[],
    checks: Checks = {
      canDeactivateChecks: [],
      canActivateChecks: []
    }): Checks {
  const prevChildren = nodeChildrenAsMap(currNode);

  // Process the children of the future route
  futureNode.children.forEach(c => {
    getRouteGuards(c, prevChildren[c.value.outlet], contexts, futurePath.concat([c.value]), checks);
    delete prevChildren[c.value.outlet];
  });

  // Process any children left from the current route (not active for the future route)
  forEach(
      prevChildren, (v: TreeNode<ActivatedRouteSnapshot>, k: string) =>
                        deactivateRouteAndItsChildren(v, contexts !.getContext(k), checks));

  return checks;
}

function getRouteGuards(
    futureNode: TreeNode<ActivatedRouteSnapshot>, currNode: TreeNode<ActivatedRouteSnapshot>,
    parentContexts: ChildrenOutletContexts | null, futurePath: ActivatedRouteSnapshot[],
    checks: Checks = {
      canDeactivateChecks: [],
      canActivateChecks: []
    }): Checks {
  const future = futureNode.value;
  const curr = currNode ? currNode.value : null;
  const context = parentContexts ? parentContexts.getContext(futureNode.value.outlet) : null;

  // reusing the node
  if (curr && future.routeConfig === curr.routeConfig) {
    const shouldRun =
        shouldRunGuardsAndResolvers(curr, future, future.routeConfig !.runGuardsAndResolvers);
    if (shouldRun) {
      checks.canActivateChecks.push(new CanActivate(futurePath));
    } else {
      // we need to set the data
      future.data = curr.data;
      future._resolvedData = curr._resolvedData;
    }

    // If we have a component, we need to go through an outlet.
    if (future.component) {
      getChildRouteGuards(
          futureNode, currNode, context ? context.children : null, futurePath, checks);

      // if we have a componentless route, we recurse but keep the same outlet map.
    } else {
      getChildRouteGuards(futureNode, currNode, parentContexts, futurePath, checks);
    }

    if (shouldRun) {
      const outlet = context !.outlet !;
      checks.canDeactivateChecks.push(new CanDeactivate(outlet.component, curr));
    }
  } else {
    if (curr) {
      deactivateRouteAndItsChildren(currNode, context, checks);
    }

    checks.canActivateChecks.push(new CanActivate(futurePath));
    // If we have a component, we need to go through an outlet.
    if (future.component) {
      getChildRouteGuards(futureNode, null, context ? context.children : null, futurePath, checks);

      // if we have a componentless route, we recurse but keep the same outlet map.
    } else {
      getChildRouteGuards(futureNode, null, parentContexts, futurePath, checks);
    }
  }

  return checks;
}

function shouldRunGuardsAndResolvers(
    curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot,
    mode: RunGuardsAndResolvers | undefined): boolean {
  switch (mode) {
    case 'always':
      return true;

    case 'paramsOrQueryParamsChange':
      return !equalParamsAndUrlSegments(curr, future) ||
          !shallowEqual(curr.queryParams, future.queryParams);

    case 'paramsChange':
    default:
      return !equalParamsAndUrlSegments(curr, future);
  }
}

function deactivateRouteAndItsChildren(
    route: TreeNode<ActivatedRouteSnapshot>, context: OutletContext | null, checks: Checks): void {
  const children = nodeChildrenAsMap(route);
  const r = route.value;

  forEach(children, (node: TreeNode<ActivatedRouteSnapshot>, childName: string) => {
    if (!r.component) {
      deactivateRouteAndItsChildren(node, context, checks);
    } else if (context) {
      deactivateRouteAndItsChildren(node, context.children.getContext(childName), checks);
    } else {
      deactivateRouteAndItsChildren(node, null, checks);
    }
  });

  if (!r.component) {
    checks.canDeactivateChecks.push(new CanDeactivate(null, r));
  } else if (context && context.outlet && context.outlet.isActivated) {
    checks.canDeactivateChecks.push(new CanDeactivate(context.outlet.component, r));
  } else {
    checks.canDeactivateChecks.push(new CanDeactivate(null, r));
  }
}

// function checkGuards2(future: RouterStateSnapshot, curr: RouterStateSnapshot):
// Observable<boolean> {
//   if (!this.isDeactivating() && !this.isActivating()) {
//     return of (true);
//   }
//   const canDeactivate$ = this.runCanDeactivateChecks();
//   return canDeactivate$.pipe(mergeMap(
//       (canDeactivate: boolean) => canDeactivate ? this.runCanActivateChecks() : of (false)));
// }