/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {runInInjectionContext} from '@angular/core';
import {concat, defer, from, of, pipe} from 'rxjs';
import {concatMap, first, map, mergeMap, tap} from 'rxjs/operators';
import {ActivationStart, ChildActivationStart} from '../events';
import {redirectingNavigationError} from '../navigation_canceling_error';
import {wrapIntoObservable} from '../utils/collection';
import {getClosestRouteInjector} from '../utils/config';
import {getCanActivateChild, getTokenOrFunctionIdentity} from '../utils/preactivation';
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
export function checkGuards(injector, forwardEvent) {
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
      targetSnapshot,
      currentSnapshot,
      injector,
    ).pipe(
      mergeMap((canDeactivate) => {
        return canDeactivate && isBoolean(canDeactivate)
          ? runCanActivateChecks(targetSnapshot, canActivateChecks, injector, forwardEvent)
          : of(canDeactivate);
      }),
      map((guardsResult) => ({...t, guardsResult})),
    );
  });
}
function runCanDeactivateChecks(checks, futureRSS, currRSS, injector) {
  return from(checks).pipe(
    mergeMap((check) =>
      runCanDeactivate(check.component, check.route, currRSS, futureRSS, injector),
    ),
    first((result) => {
      return result !== true;
    }, true),
  );
}
function runCanActivateChecks(futureSnapshot, checks, injector, forwardEvent) {
  return from(checks).pipe(
    concatMap((check) => {
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
function fireActivationStart(snapshot, forwardEvent) {
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
function fireChildActivationStart(snapshot, forwardEvent) {
  if (snapshot !== null && forwardEvent) {
    forwardEvent(new ChildActivationStart(snapshot));
  }
  return of(true);
}
function runCanActivate(futureRSS, futureARS, injector) {
  const canActivate = futureARS.routeConfig ? futureARS.routeConfig.canActivate : null;
  if (!canActivate || canActivate.length === 0) return of(true);
  const canActivateObservables = canActivate.map((canActivate) => {
    return defer(() => {
      const closestInjector = getClosestRouteInjector(futureARS) ?? injector;
      const guard = getTokenOrFunctionIdentity(canActivate, closestInjector);
      const guardVal = isCanActivate(guard)
        ? guard.canActivate(futureARS, futureRSS)
        : runInInjectionContext(closestInjector, () => guard(futureARS, futureRSS));
      return wrapIntoObservable(guardVal).pipe(first());
    });
  });
  return of(canActivateObservables).pipe(prioritizedGuardValue());
}
function runCanActivateChild(futureRSS, path, injector) {
  const futureARS = path[path.length - 1];
  const canActivateChildGuards = path
    .slice(0, path.length - 1)
    .reverse()
    .map((p) => getCanActivateChild(p))
    .filter((_) => _ !== null);
  const canActivateChildGuardsMapped = canActivateChildGuards.map((d) => {
    return defer(() => {
      const guardsMapped = d.guards.map((canActivateChild) => {
        const closestInjector = getClosestRouteInjector(d.node) ?? injector;
        const guard = getTokenOrFunctionIdentity(canActivateChild, closestInjector);
        const guardVal = isCanActivateChild(guard)
          ? guard.canActivateChild(futureARS, futureRSS)
          : runInInjectionContext(closestInjector, () => guard(futureARS, futureRSS));
        return wrapIntoObservable(guardVal).pipe(first());
      });
      return of(guardsMapped).pipe(prioritizedGuardValue());
    });
  });
  return of(canActivateChildGuardsMapped).pipe(prioritizedGuardValue());
}
function runCanDeactivate(component, currARS, currRSS, futureRSS, injector) {
  const canDeactivate = currARS && currARS.routeConfig ? currARS.routeConfig.canDeactivate : null;
  if (!canDeactivate || canDeactivate.length === 0) return of(true);
  const canDeactivateObservables = canDeactivate.map((c) => {
    const closestInjector = getClosestRouteInjector(currARS) ?? injector;
    const guard = getTokenOrFunctionIdentity(c, closestInjector);
    const guardVal = isCanDeactivate(guard)
      ? guard.canDeactivate(component, currARS, currRSS, futureRSS)
      : runInInjectionContext(closestInjector, () => guard(component, currARS, currRSS, futureRSS));
    return wrapIntoObservable(guardVal).pipe(first());
  });
  return of(canDeactivateObservables).pipe(prioritizedGuardValue());
}
export function runCanLoadGuards(injector, route, segments, urlSerializer, abortSignal) {
  const canLoad = route.canLoad;
  if (canLoad === undefined || canLoad.length === 0) {
    return of(true);
  }
  const canLoadObservables = canLoad.map((injectionToken) => {
    const guard = getTokenOrFunctionIdentity(injectionToken, injector);
    const guardVal = isCanLoad(guard)
      ? guard.canLoad(route, segments)
      : runInInjectionContext(injector, () => guard(route, segments));
    const obs$ = wrapIntoObservable(guardVal);
    return abortSignal ? obs$.pipe(takeUntilAbort(abortSignal)) : obs$;
  });
  return of(canLoadObservables).pipe(prioritizedGuardValue(), redirectIfUrlTree(urlSerializer));
}
function redirectIfUrlTree(urlSerializer) {
  return pipe(
    tap((result) => {
      if (typeof result === 'boolean') return;
      throw redirectingNavigationError(urlSerializer, result);
    }),
    map((result) => result === true),
  );
}
export function runCanMatchGuards(injector, route, segments, urlSerializer, abortSignal) {
  const canMatch = route.canMatch;
  if (!canMatch || canMatch.length === 0) return of(true);
  const canMatchObservables = canMatch.map((injectionToken) => {
    const guard = getTokenOrFunctionIdentity(injectionToken, injector);
    const guardVal = isCanMatch(guard)
      ? guard.canMatch(route, segments)
      : runInInjectionContext(injector, () => guard(route, segments));
    let obs$ = wrapIntoObservable(guardVal);
    return abortSignal ? obs$.pipe(takeUntilAbort(abortSignal)) : obs$;
  });
  return of(canMatchObservables).pipe(prioritizedGuardValue(), redirectIfUrlTree(urlSerializer));
}
//# sourceMappingURL=check_guards.js.map
