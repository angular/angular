/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EnvironmentInjector, ProviderToken} from '@angular/core';
import {EMPTY, from, MonoTypeOperatorFunction, Observable, of, throwError} from 'rxjs';
import {catchError, concatMap, first, map, mapTo, mergeMap, takeLast, tap} from 'rxjs/operators';

import {ResolveData} from '../models';
import {NavigationTransition} from '../navigation_transition';
import {ActivatedRouteSnapshot, getInherited, hasStaticTitle, RouterStateSnapshot} from '../router_state';
import {RouteTitleKey} from '../shared';
import {getDataKeys, wrapIntoObservable} from '../utils/collection';
import {getClosestRouteInjector} from '../utils/config';
import {getTokenOrFunctionIdentity} from '../utils/preactivation';
import {isEmptyError} from '../utils/type_guards';

export function resolveData(
    paramsInheritanceStrategy: 'emptyOnly'|'always',
    injector: EnvironmentInjector): MonoTypeOperatorFunction<NavigationTransition> {
  return mergeMap(t => {
    const {targetSnapshot, guards: {canActivateChecks}} = t;

    if (!canActivateChecks.length) {
      return of(t);
    }
    const routesWithResolversToRun = canActivateChecks.map(check => check.route);
    const routesWithResolversSet = new Set(routesWithResolversToRun);
    const routesNeedingDataUpdates =
        // List all ActivatedRoutes in an array, starting from the parent of the first route to run
        // resolvers. We go from the parent because the first route might have siblings that also
        // run resolvers.
        flattenRouteTree(routesWithResolversToRun[0].parent!)
            // Remove the parent from the list -- we do not need to recompute its inherited data
            // because no resolvers at or above it run.
            .slice(1);
    let routesProcessed = 0;
    return from(routesNeedingDataUpdates)
        .pipe(
            concatMap(route => {
              if (routesWithResolversSet.has(route)) {
                return runResolve(route, targetSnapshot!, paramsInheritanceStrategy, injector);
              } else {
                route.data = getInherited(route, route.parent, paramsInheritanceStrategy).resolve;
                return of(void 0);
              }
            }),
            tap(() => routesProcessed++),
            takeLast(1),
            mergeMap(_ => routesProcessed === routesNeedingDataUpdates.length ? of(t) : EMPTY),
        );
  });
}

/**
 *  Returns the `ActivatedRouteSnapshot` tree as an array, using DFS to traverse the route tree.
 */
function flattenRouteTree(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot[] {
  const descendants = route.children.map(child => flattenRouteTree(child)).flat();
  return [route, ...descendants];
}

function runResolve(
    futureARS: ActivatedRouteSnapshot, futureRSS: RouterStateSnapshot,
    paramsInheritanceStrategy: 'emptyOnly'|'always', injector: EnvironmentInjector) {
  const config = futureARS.routeConfig;
  const resolve = futureARS._resolve;
  if (config?.title !== undefined && !hasStaticTitle(config)) {
    resolve[RouteTitleKey] = config.title;
  }
  return resolveNode(resolve, futureARS, futureRSS, injector).pipe(map((resolvedData: any) => {
    futureARS._resolvedData = resolvedData;
    futureARS.data = getInherited(futureARS, futureARS.parent, paramsInheritanceStrategy).resolve;
    return null;
  }));
}

function resolveNode(
    resolve: ResolveData, futureARS: ActivatedRouteSnapshot, futureRSS: RouterStateSnapshot,
    injector: EnvironmentInjector): Observable<any> {
  const keys = getDataKeys(resolve);
  if (keys.length === 0) {
    return of({});
  }
  const data: {[k: string|symbol]: any} = {};
  return from(keys).pipe(
      mergeMap(
          key => getResolver(resolve[key], futureARS, futureRSS, injector)
                     .pipe(first(), tap((value: any) => {
                             data[key] = value;
                           }))),
      takeLast(1),
      mapTo(data),
      catchError((e: unknown) => isEmptyError(e as Error) ? EMPTY : throwError(e)),
  );
}

function getResolver(
    injectionToken: ProviderToken<any>|Function, futureARS: ActivatedRouteSnapshot,
    futureRSS: RouterStateSnapshot, injector: EnvironmentInjector): Observable<any> {
  const closestInjector = getClosestRouteInjector(futureARS) ?? injector;
  const resolver = getTokenOrFunctionIdentity(injectionToken, closestInjector);
  const resolverValue = resolver.resolve ?
      resolver.resolve(futureARS, futureRSS) :
      closestInjector.runInContext(() => resolver(futureARS, futureRSS));
  return wrapIntoObservable(resolverValue);
}
