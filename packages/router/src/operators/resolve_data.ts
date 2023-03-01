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

import {ResolveData, Route} from '../models';
import {NavigationTransition} from '../navigation_transition';
import {ActivatedRouteSnapshot, inheritedParamsDataResolve, RouterStateSnapshot} from '../router_state';
import {RouteTitleKey} from '../shared';
import {wrapIntoObservable} from '../utils/collection';
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
    let canActivateChecksResolved = 0;
    return from(canActivateChecks)
        .pipe(
            concatMap(
                check =>
                    runResolve(check.route, targetSnapshot!, paramsInheritanceStrategy, injector)),
            tap(() => canActivateChecksResolved++),
            takeLast(1),
            mergeMap(_ => canActivateChecksResolved === canActivateChecks.length ? of(t) : EMPTY),
        );
  });
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
    futureARS.data = inheritedParamsDataResolve(futureARS, paramsInheritanceStrategy).resolve;
    if (config && hasStaticTitle(config)) {
      futureARS.data[RouteTitleKey] = config.title;
    }
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

function getDataKeys(obj: Object): Array<string|symbol> {
  return [...Object.keys(obj), ...Object.getOwnPropertySymbols(obj)];
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

function hasStaticTitle(config: Route) {
  return typeof config.title === 'string' || config.title === null;
}
