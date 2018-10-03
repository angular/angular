/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '@angular/core';
import {MonoTypeOperatorFunction, Observable, from, of } from 'rxjs';
import {concatMap, every, first, map, mergeMap} from 'rxjs/operators';

import {ActivationStart, ChildActivationStart, Event} from '../events';
import {NavigationTransition} from '../router';
import {ActivatedRouteSnapshot, RouterStateSnapshot} from '../router_state';
import {andObservables, wrapIntoObservable} from '../utils/collection';
import {CanActivate, CanDeactivate, getCanActivateChild, getToken} from '../utils/preactivation';

export function checkGuards(moduleInjector: Injector, forwardEvent?: (evt: Event) => void):
    MonoTypeOperatorFunction<NavigationTransition> {
  return function(source: Observable<NavigationTransition>) {

    return source.pipe(mergeMap(t => {
      const {targetSnapshot, currentSnapshot, guards: {canActivateChecks, canDeactivateChecks}} = t;
      if (canDeactivateChecks.length === 0 && canActivateChecks.length === 0) {
        return of ({...t, guardsResult: true});
      }

      return runCanDeactivateChecks(
                 canDeactivateChecks, targetSnapshot !, currentSnapshot, moduleInjector)
          .pipe(
              mergeMap((canDeactivate: boolean) => {
                return canDeactivate ?
                    runCanActivateChecks(
                        targetSnapshot !, canActivateChecks, moduleInjector, forwardEvent) :
                    of (false);
              }),
              map(guardsResult => ({...t, guardsResult})));
    }));
  };
}

function runCanDeactivateChecks(
    checks: CanDeactivate[], futureRSS: RouterStateSnapshot, currRSS: RouterStateSnapshot,
    moduleInjector: Injector): Observable<boolean> {
  return from(checks).pipe(
      mergeMap(
          (check: CanDeactivate) =>
              runCanDeactivate(check.component, check.route, currRSS, futureRSS, moduleInjector)),
      every((result: boolean) => result === true));
}

function runCanActivateChecks(
    futureSnapshot: RouterStateSnapshot, checks: CanActivate[], moduleInjector: Injector,
    forwardEvent?: (evt: Event) => void): Observable<boolean> {
  return from(checks).pipe(
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
                                     .map(p => getCanActivateChild(p))
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
