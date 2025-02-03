/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EnvironmentInjector, ProviderToken, runInInjectionContext} from '@angular/core';
import {defer, EMPTY, from, MonoTypeOperatorFunction, Observable, of, throwError} from 'rxjs';
import {catchError, concatMap, first, map, mergeMap, takeLast, tap} from 'rxjs/operators';

import {RedirectCommand, ResolveData} from '../models';
import type {NavigationTransition} from '../navigation_transition';
import {
  ActivatedRouteSnapshot,
  getInherited,
  hasStaticTitle,
  RouterStateSnapshot,
} from '../router_state';
import {RouteTitleKey} from '../shared';
import {getDataKeys, wrapIntoObservable} from '../utils/collection';
import {getClosestRouteInjector} from '../utils/config';
import {getTokenOrFunctionIdentity} from '../utils/preactivation';
import {isEmptyError} from '../utils/type_guards';
import {redirectingNavigationError} from '../navigation_canceling_error';
import {DefaultUrlSerializer} from '../url_tree';

export function resolveData(
  paramsInheritanceStrategy: 'emptyOnly' | 'always',
  injector: EnvironmentInjector,
): MonoTypeOperatorFunction<NavigationTransition> {
  return mergeMap((t) => {
    const {
      targetSnapshot,
      guards: {canActivateChecks},
    } = t;

    if (!canActivateChecks.length) {
      return of(t);
    }
    // Iterating a Set in javascript  happens in insertion order so it is safe to use a `Set` to
    // preserve the correct order that the resolvers should run in.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set#description
    const routesWithResolversToRun = new Set(canActivateChecks.map((check) => check.route));
    const routesNeedingDataUpdates = new Set<ActivatedRouteSnapshot>();
    for (const route of routesWithResolversToRun) {
      if (routesNeedingDataUpdates.has(route)) {
        continue;
      }
      // All children under the route with a resolver to run need to recompute inherited data.
      for (const newRoute of flattenRouteTree(route)) {
        routesNeedingDataUpdates.add(newRoute);
      }
    }
    let routesProcessed = 0;
    return from(routesNeedingDataUpdates).pipe(
      concatMap((route) => {
        if (routesWithResolversToRun.has(route)) {
          return runResolve(route, targetSnapshot!, paramsInheritanceStrategy, injector);
        } else {
          route.data = getInherited(route, route.parent, paramsInheritanceStrategy).resolve;
          return of(void 0);
        }
      }),
      tap(() => routesProcessed++),
      takeLast(1),
      mergeMap((_) => (routesProcessed === routesNeedingDataUpdates.size ? of(t) : EMPTY)),
    );
  });
}

/**
 *  Returns the `ActivatedRouteSnapshot` tree as an array, using DFS to traverse the route tree.
 */
function flattenRouteTree(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot[] {
  const descendants = route.children.map((child) => flattenRouteTree(child)).flat();
  return [route, ...descendants];
}

function runResolve(
  futureARS: ActivatedRouteSnapshot,
  futureRSS: RouterStateSnapshot,
  paramsInheritanceStrategy: 'emptyOnly' | 'always',
  injector: EnvironmentInjector,
) {
  const config = futureARS.routeConfig;
  const resolve = futureARS._resolve;
  if (config?.title !== undefined && !hasStaticTitle(config)) {
    resolve[RouteTitleKey] = config.title;
  }
  return defer(() => {
    futureARS.data = getInherited(futureARS, futureARS.parent, paramsInheritanceStrategy).resolve;
    return resolveNode(resolve, futureARS, futureRSS, injector).pipe(
      map((resolvedData: any) => {
        futureARS._resolvedData = resolvedData;
        futureARS.data = {...futureARS.data, ...resolvedData};
        return null;
      }),
    );
  });
}

function resolveNode(
  resolve: ResolveData,
  futureARS: ActivatedRouteSnapshot,
  futureRSS: RouterStateSnapshot,
  injector: EnvironmentInjector,
): Observable<any> {
  const keys = getDataKeys(resolve);
  if (keys.length === 0) {
    return of({});
  }
  const data: {[k: string | symbol]: any} = {};
  return from(keys).pipe(
    mergeMap((key) =>
      getResolver(resolve[key], futureARS, futureRSS, injector).pipe(
        first(),
        tap((value: any) => {
          if (value instanceof RedirectCommand) {
            throw redirectingNavigationError(new DefaultUrlSerializer(), value);
          }
          data[key] = value;
        }),
      ),
    ),
    takeLast(1),
    map(() => data),
    catchError((e: unknown) => (isEmptyError(e as Error) ? EMPTY : throwError(e))),
  );
}

function getResolver(
  injectionToken: ProviderToken<any> | Function,
  futureARS: ActivatedRouteSnapshot,
  futureRSS: RouterStateSnapshot,
  injector: EnvironmentInjector,
): Observable<any> {
  const closestInjector = getClosestRouteInjector(futureARS) ?? injector;
  const resolver = getTokenOrFunctionIdentity(injectionToken, closestInjector);
  const resolverValue = resolver.resolve
    ? resolver.resolve(futureARS, futureRSS)
    : runInInjectionContext(closestInjector, () => resolver(futureARS, futureRSS));
  return wrapIntoObservable(resolverValue);
}
