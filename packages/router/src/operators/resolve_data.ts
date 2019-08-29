/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '@angular/core';
import {MonoTypeOperatorFunction, Observable, from, of } from 'rxjs';
import {concatMap, last, map, mergeMap, reduce} from 'rxjs/operators';

import {ResolveData} from '../config';
import {NavigationTransition} from '../router';
import {ActivatedRouteSnapshot, RouterStateSnapshot, inheritedParamsDataResolve} from '../router_state';
import {wrapIntoObservable} from '../utils/collection';

import {getToken} from '../utils/preactivation';

export function resolveData(
    paramsInheritanceStrategy: 'emptyOnly' | 'always',
    moduleInjector: Injector): MonoTypeOperatorFunction<NavigationTransition> {
  return function(source: Observable<NavigationTransition>) {
    return source.pipe(mergeMap(t => {
      const {targetSnapshot, guards: {canActivateChecks}} = t;

      if (!canActivateChecks.length) {
        return of (t);
      }

      return from(canActivateChecks)
          .pipe(
              concatMap(
                  check => runResolve(
                      check.route, targetSnapshot !, paramsInheritanceStrategy, moduleInjector)),
              reduce((_: any, __: any) => _), map(_ => t));
    }));
  };
}

function runResolve(
    futureARS: ActivatedRouteSnapshot, futureRSS: RouterStateSnapshot,
    paramsInheritanceStrategy: 'emptyOnly' | 'always', moduleInjector: Injector) {
  const resolve = futureARS._resolve;
  return resolveNode(resolve, futureARS, futureRSS, moduleInjector)
      .pipe(map((resolvedData: any) => {
        futureARS._resolvedData = resolvedData;
        futureARS.data = {
            ...futureARS.data,
            ...inheritedParamsDataResolve(futureARS, paramsInheritanceStrategy).resolve};
        return null;
      }));
}

function resolveNode(
    resolve: ResolveData, futureARS: ActivatedRouteSnapshot, futureRSS: RouterStateSnapshot,
    moduleInjector: Injector): Observable<any> {
  const keys = Object.keys(resolve);
  if (keys.length === 0) {
    return of ({});
  }
  if (keys.length === 1) {
    const key = keys[0];
    return getResolver(resolve[key], futureARS, futureRSS, moduleInjector)
        .pipe(map((value: any) => { return {[key]: value}; }));
  }
  const data: {[k: string]: any} = {};
  const runningResolvers$ = from(keys).pipe(mergeMap((key: string) => {
    return getResolver(resolve[key], futureARS, futureRSS, moduleInjector)
        .pipe(map((value: any) => {
          data[key] = value;
          return value;
        }));
  }));
  return runningResolvers$.pipe(last(), map(() => data));
}

function getResolver(
    injectionToken: any, futureARS: ActivatedRouteSnapshot, futureRSS: RouterStateSnapshot,
    moduleInjector: Injector): Observable<any> {
  const resolver = getToken(injectionToken, futureARS, moduleInjector);
  return resolver.resolve ? wrapIntoObservable(resolver.resolve(futureARS, futureRSS)) :
                            wrapIntoObservable(resolver(futureARS, futureRSS));
}