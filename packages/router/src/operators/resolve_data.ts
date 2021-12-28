/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '@angular/core';
import {EMPTY, from, MonoTypeOperatorFunction, Observable, of} from 'rxjs';
import {concatMap, map, mergeMap, take, takeLast, tap} from 'rxjs/operators';

import {ResolveData} from '../models';
import {NavigationTransition} from '../router';
import {ActivatedRouteSnapshot, inheritedParamsDataResolve, RouterStateSnapshot} from '../router_state';
import {wrapIntoObservable} from '../utils/collection';
import {getToken} from '../utils/preactivation';

/**
 * A private symbol used to store the value of `Route.title` inside the `Route.data` if it is a
 * static string or `Route.resolve` if anything else. This allows us to reuse the existing route
 * data/resolvers to support the title feature without new instrumentation in the `Router` pipeline.
 */
export const RouteTitle = Symbol('RouteTitle');

export function resolveData(
    paramsInheritanceStrategy: 'emptyOnly'|'always',
    moduleInjector: Injector): MonoTypeOperatorFunction<NavigationTransition> {
  return mergeMap(t => {
    const {targetSnapshot, guards: {canActivateChecks}} = t;

    if (!canActivateChecks.length) {
      return of(t);
    }
    let canActivateChecksResolved = 0;
    return from(canActivateChecks)
        .pipe(
            concatMap(
                check => runResolve(
                    check.route, targetSnapshot!, paramsInheritanceStrategy, moduleInjector)),
            tap(() => canActivateChecksResolved++),
            takeLast(1),
            mergeMap(_ => canActivateChecksResolved === canActivateChecks.length ? of(t) : EMPTY),
        );
  });
}

function runResolve(
    futureARS: ActivatedRouteSnapshot, futureRSS: RouterStateSnapshot,
    paramsInheritanceStrategy: 'emptyOnly'|'always', moduleInjector: Injector) {
  const config = futureARS.routeConfig;
  const resolve = futureARS._resolve;
  const data = {...futureARS.data};
  if (config?.title !== undefined) {
    if (typeof config.title === 'string' || config.title === null) {
      data[RouteTitle] = config.title;
    } else {
      resolve[RouteTitle] = config.title;
    }
  }
  return resolveNode(resolve, futureARS, futureRSS, moduleInjector)
      .pipe(map((resolvedData: any) => {
        futureARS._resolvedData = resolvedData;
        futureARS.data = {
          ...data,
          ...inheritedParamsDataResolve(futureARS, paramsInheritanceStrategy).resolve
        };
        return null;
      }));
}

function resolveNode(
    resolve: ResolveData, futureARS: ActivatedRouteSnapshot, futureRSS: RouterStateSnapshot,
    moduleInjector: Injector): Observable<any> {
  const keys = getDataKeys(resolve);
  if (keys.length === 0) {
    return of({});
  }
  const data: {[k: string|symbol]: any} = {};
  return from(keys).pipe(
      mergeMap(
          key => getResolver(resolve[key], futureARS, futureRSS, moduleInjector)
                     .pipe(take(1), tap((value: any) => {
                             data[key] = value;
                           }))),
      takeLast(1),
      mergeMap(() => {
        // Ensure all resolvers returned values, otherwise don't emit any "next" and just complete
        // the chain which will cancel navigation
        if (getDataKeys(data).length === keys.length) {
          return of(data);
        }
        return EMPTY;
      }),
  );
}

function getDataKeys(obj: Object): Array<string|symbol> {
  return [...Object.keys(obj), ...Object.getOwnPropertySymbols(obj)];
}

function getResolver(
    injectionToken: any, futureARS: ActivatedRouteSnapshot, futureRSS: RouterStateSnapshot,
    moduleInjector: Injector): Observable<any> {
  const resolver = getToken(injectionToken, futureARS, moduleInjector);
  return resolver.resolve ? wrapIntoObservable(resolver.resolve(futureARS, futureRSS)) :
                            wrapIntoObservable(resolver(futureARS, futureRSS));
}
