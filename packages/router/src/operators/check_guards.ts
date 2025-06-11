/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EnvironmentInjector, ProviderToken, runInInjectionContext} from '@angular/core';
import {
  concat,
  defer,
  from,
  MonoTypeOperatorFunction,
  Observable,
  of,
  OperatorFunction,
  pipe,
} from 'rxjs';
import {concatMap, first, map, mergeMap, tap} from 'rxjs/operators';

import {ActivationStart, ChildActivationStart, Event} from '../events';
import {
  CanActivateChildFn,
  CanActivateFn,
  CanDeactivateFn,
  GuardResult,
  CanLoadFn,
  CanMatchFn,
  Route,
} from '../models';
import {redirectingNavigationError} from '../navigation_canceling_error';
import type {NavigationTransition} from '../navigation_transition';
import type {ActivatedRouteSnapshot, RouterStateSnapshot} from '../router_state';
import {UrlSegment, UrlSerializer} from '../url_tree';
import {wrapIntoObservable} from '../utils/collection';
import {getClosestRouteInjector} from '../utils/config';
import {
  CanActivate,
  CanDeactivate,
  getCanActivateChild,
  getTokenOrFunctionIdentity,
} from '../utils/preactivation';
import {
  isBoolean,
  isCanActivate,
  isCanActivateChild,
  isCanDeactivate,
  isCanLoad,
  isCanMatch,
} from '../utils/type_guards';

import {prioritizedGuardValue} from './prioritized_guard_value';
import {takeUntilAbort} from '../utils/abort_signal_to_observable';

export function checkGuards(
  injector: EnvironmentInjector,
  forwardEvent?: (evt: Event) => void,
): MonoTypeOperatorFunction<NavigationTransition> {
  return mergeMap((t) => {
    const {
      targetSnapshot,
      currentSnapshot,
      guards: {canActivateChecks, canDeactivateChecks},
    } = t;
    if (canDeactivateChecks.length === 0 && canActivateChecks.length === 0) {
      return of({...t, guardsResult: true});
    }

    return runCanDeactivateChecks(
      canDeactivateChecks,
      targetSnapshot!,
      currentSnapshot,
      injector,
    ).pipe(
      mergeMap((canDeactivate) => {
        return canDeactivate && isBoolean(canDeactivate)
          ? runCanActivateChecks(targetSnapshot!, canActivateChecks, injector, forwardEvent)
          : of(canDeactivate);
      }),
      map((guardsResult) => ({...t, guardsResult})),
    );
  });
}

function runCanDeactivateChecks(
  checks: CanDeactivate[],
  futureRSS: RouterStateSnapshot,
  currRSS: RouterStateSnapshot,
  injector: EnvironmentInjector,
) {
  return from(checks).pipe(
    mergeMap((check) =>
      runCanDeactivate(check.component, check.route, currRSS, futureRSS, injector),
    ),
    first((result) => {
      return result !== true;
    }, true),
  );
}

function runCanActivateChecks(
  futureSnapshot: RouterStateSnapshot,
  checks: CanActivate[],
  injector: EnvironmentInjector,
  forwardEvent?: (evt: Event) => void,
) {
  return from(checks).pipe(
    concatMap((check: CanActivate) => {
      return concat(
        fireChildActivationStart(check.route.parent, forwardEvent),
        fireActivationStart(check.route, forwardEvent),
        runCanActivateChild(futureSnapshot, check.path, injector),
        runCanActivate(futureSnapshot, check.route, injector),
      );
    }),
    first((result) => {
      return result !== true;
    }, true),
  );
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
  forwardEvent?: (evt: Event) => void,
): Observable<boolean> {
  if (snapshot !== null && forwardEvent) {
    forwardEvent(new ActivationStart(snapshot));
  }
  return of(true);
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
  forwardEvent?: (evt: Event) => void,
): Observable<boolean> {
  if (snapshot !== null && forwardEvent) {
    forwardEvent(new ChildActivationStart(snapshot));
  }
  return of(true);
}

function runCanActivate(
  futureRSS: RouterStateSnapshot,
  futureARS: ActivatedRouteSnapshot,
  injector: EnvironmentInjector,
): Observable<GuardResult> {
  const canActivate = futureARS.routeConfig ? futureARS.routeConfig.canActivate : null;
  if (!canActivate || canActivate.length === 0) return of(true);

  const canActivateObservables = canActivate.map((canActivate) => {
    return defer(() => {
      const closestInjector = getClosestRouteInjector(futureARS) ?? injector;
      const guard = getTokenOrFunctionIdentity<CanActivate>(
        canActivate as ProviderToken<CanActivate>,
        closestInjector,
      );
      const guardVal = isCanActivate(guard)
        ? guard.canActivate(futureARS, futureRSS)
        : runInInjectionContext(closestInjector, () =>
            (guard as CanActivateFn)(futureARS, futureRSS),
          );
      return wrapIntoObservable(guardVal).pipe(first());
    });
  });
  return of(canActivateObservables).pipe(prioritizedGuardValue());
}

function runCanActivateChild(
  futureRSS: RouterStateSnapshot,
  path: ActivatedRouteSnapshot[],
  injector: EnvironmentInjector,
): Observable<GuardResult> {
  const futureARS = path[path.length - 1];

  const canActivateChildGuards = path
    .slice(0, path.length - 1)
    .reverse()
    .map((p) => getCanActivateChild(p))
    .filter((_) => _ !== null);

  const canActivateChildGuardsMapped = canActivateChildGuards.map((d: any) => {
    return defer(() => {
      const guardsMapped = d.guards.map(
        (canActivateChild: CanActivateChildFn | ProviderToken<unknown>) => {
          const closestInjector = getClosestRouteInjector(d.node) ?? injector;
          const guard = getTokenOrFunctionIdentity<{canActivateChild: CanActivateChildFn}>(
            canActivateChild,
            closestInjector,
          );
          const guardVal = isCanActivateChild(guard)
            ? guard.canActivateChild(futureARS, futureRSS)
            : runInInjectionContext(closestInjector, () =>
                (guard as CanActivateChildFn)(futureARS, futureRSS),
              );
          return wrapIntoObservable(guardVal).pipe(first());
        },
      );
      return of(guardsMapped).pipe(prioritizedGuardValue());
    });
  });
  return of(canActivateChildGuardsMapped).pipe(prioritizedGuardValue());
}

function runCanDeactivate(
  component: Object | null,
  currARS: ActivatedRouteSnapshot,
  currRSS: RouterStateSnapshot,
  futureRSS: RouterStateSnapshot,
  injector: EnvironmentInjector,
): Observable<GuardResult> {
  const canDeactivate = currARS && currARS.routeConfig ? currARS.routeConfig.canDeactivate : null;
  if (!canDeactivate || canDeactivate.length === 0) return of(true);
  const canDeactivateObservables = canDeactivate.map((c: any) => {
    const closestInjector = getClosestRouteInjector(currARS) ?? injector;
    const guard = getTokenOrFunctionIdentity<any>(c, closestInjector);
    const guardVal = isCanDeactivate(guard)
      ? guard.canDeactivate(component, currARS, currRSS, futureRSS)
      : runInInjectionContext(closestInjector, () =>
          (guard as CanDeactivateFn<any>)(component, currARS, currRSS, futureRSS),
        );
    return wrapIntoObservable(guardVal).pipe(first());
  });
  return of(canDeactivateObservables).pipe(prioritizedGuardValue());
}

export function runCanLoadGuards(
  injector: EnvironmentInjector,
  route: Route,
  segments: UrlSegment[],
  urlSerializer: UrlSerializer,
  abortSignal: AbortSignal,
): Observable<boolean> {
  const canLoad = route.canLoad;
  if (canLoad === undefined || canLoad.length === 0) {
    return of(true);
  }

  const canLoadObservables = canLoad.map((injectionToken: any) => {
    const guard = getTokenOrFunctionIdentity<any>(injectionToken, injector);
    const guardVal = isCanLoad(guard)
      ? guard.canLoad(route, segments)
      : runInInjectionContext(injector, () => (guard as CanLoadFn)(route, segments));
    return wrapIntoObservable(guardVal).pipe(takeUntilAbort(abortSignal));
  });

  return of(canLoadObservables).pipe(prioritizedGuardValue(), redirectIfUrlTree(urlSerializer));
}

function redirectIfUrlTree(urlSerializer: UrlSerializer): OperatorFunction<GuardResult, boolean> {
  return pipe(
    tap((result: GuardResult) => {
      if (typeof result === 'boolean') return;

      throw redirectingNavigationError(urlSerializer, result);
    }),
    map((result) => result === true),
  );
}

export function runCanMatchGuards(
  injector: EnvironmentInjector,
  route: Route,
  segments: UrlSegment[],
  urlSerializer: UrlSerializer,
  abortSignal: AbortSignal,
): Observable<GuardResult> {
  const canMatch = route.canMatch;
  if (!canMatch || canMatch.length === 0) return of(true);

  const canMatchObservables = canMatch.map((injectionToken) => {
    const guard = getTokenOrFunctionIdentity(injectionToken as ProviderToken<any>, injector);
    const guardVal = isCanMatch(guard)
      ? guard.canMatch(route, segments)
      : runInInjectionContext(injector, () => (guard as CanMatchFn)(route, segments));
    return wrapIntoObservable(guardVal).pipe(takeUntilAbort(abortSignal));
  });

  return of(canMatchObservables).pipe(prioritizedGuardValue(), redirectIfUrlTree(urlSerializer));
}
