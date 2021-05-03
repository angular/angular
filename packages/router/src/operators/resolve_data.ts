/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '@angular/core';
import {EMPTY, from, MonoTypeOperatorFunction, Observable, of} from 'rxjs';
import {concatMap, map, mergeMap, takeLast, tap} from 'rxjs/operators';

import {ResolveData} from '../config';
import {NavigationTransition} from '../router';
import {ActivatedRouteSnapshot, inheritedParamsDataResolve, RouterStateSnapshot} from '../router_state';
import {wrapIntoObservable} from '../utils/collection';
import {getToken} from '../utils/preactivation';

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
  const resolve = futureARS._resolve;
  return resolveNode(resolve, futureARS, futureRSS, moduleInjector)
      .pipe(map((resolvedData: any) => {
        futureARS._resolvedData = resolvedData;
        futureARS.data = {
          ...futureARS.data,
          ...inheritedParamsDataResolve(futureARS, paramsInheritanceStrategy).resolve
        };
        return null;
      }));
}

function resolveNode(
    resolve: ResolveData, futureARS: ActivatedRouteSnapshot, futureRSS: RouterStateSnapshot,
    moduleInjector: Injector): Observable<any> {
  const keys = Object.keys(resolve);
  if (keys.length === 0) {
    return of({});
  }
  const data: {[k: string]: any} = {};
  return from(keys).pipe(
      mergeMap(
          (key: string) => getResolver(resolve[key], futureARS, futureRSS, moduleInjector)
                               .pipe(tap((value: any) => {
                                 data[key] = value;
                               }))),
      takeLast(1),
      mergeMap(() => {
        // Ensure all resolvers returned values, otherwise don't emit any "next" and just complete
        // the chain which will cancel navigation
        if (Object.keys(data).length === keys.length) {
          return of(data);
        }
        return EMPTY;
      }),
  );
}

function getResolver(
    injectionToken: any, futureARS: ActivatedRouteSnapshot, futureRSS: RouterStateSnapshot,
    moduleInjector: Injector): Observable<any> {
  const resolver = getToken(injectionToken, futureARS, moduleInjector);
  return resolver.resolve ? wrapIntoObservable(resolver.resolve(futureARS, futureRSS)) :
                            wrapIntoObservable(resolver(futureARS, futureRSS));
}
