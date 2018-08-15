/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, Type} from '@angular/core';
import {Observable, OperatorFunction, from, of } from 'rxjs';
import {concatMap, last, map, mergeMap, reduce} from 'rxjs/operators';

import {ResolveData, Route} from '../config';
import {PreActivation} from '../pre_activation';
import {recognize as recognizeFn} from '../recognize';
import {ChildrenOutletContexts} from '../router_outlet_context';
import {ActivatedRouteSnapshot, RouterState, RouterStateSnapshot, inheritedParamsDataResolve} from '../router_state';
import {UrlTree} from '../url_tree';
import {wrapIntoObservable} from '../utils/collection';

import {getAllRouteGuards, getToken} from './check_guards';

export function resolveData(
    rootContexts: ChildrenOutletContexts, currentSnapshot: RouterStateSnapshot,
    paramsInheritanceStrategy: 'emptyOnly' | 'always',
    moduleInjector: Injector): OperatorFunction<RouterStateSnapshot, any> {
  return function(source: Observable<RouterStateSnapshot>) {
    return source.pipe(mergeMap((futureSnapshot): Observable<any> => {
      const checks = getAllRouteGuards(futureSnapshot, currentSnapshot, rootContexts);

      if (!checks.canActivateChecks.length) {
        return of (null);
      }

      return from(checks.canActivateChecks)
          .pipe(
              concatMap(
                  check => runResolve(
                      check.route, futureSnapshot, paramsInheritanceStrategy, moduleInjector)),
              reduce((_: any, __: any) => _));
    }));
  };
}

function runResolve(
    futureARS: ActivatedRouteSnapshot, futureRSS: RouterStateSnapshot,
    paramsInheritanceStrategy: 'emptyOnly' | 'always', moduleInjector: Injector): Observable<any> {
  const resolve = futureARS._resolve;
  return resolveNode(resolve, futureARS, futureRSS, moduleInjector)
      .pipe(map((resolvedData: any): any => {
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