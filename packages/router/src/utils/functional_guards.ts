/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EnvironmentInjector, inject, runInInjectionContext, Type} from '@angular/core';
import {concatMap, defaultIfEmpty, first, skipWhile} from 'rxjs/operators';
import {of} from 'rxjs';

import {CanActivateChildFn, CanActivateFn, CanDeactivateFn, CanMatchFn, ResolveFn} from '../models';
import {ActivatedRouteSnapshot, RouterStateSnapshot} from '../router_state';
import {wrapIntoObservable} from './collection';

/**
 * Maps an array of injectable classes with canMatch functions to an array of equivalent
 * `CanMatchFn` for use in a `Route` definition.
 *
 * Usage {@example router/utils/functional_guards.ts region='CanActivate'}
 *
 * @publicApi
 * @see {@link Route}
 */
export function mapToCanMatch(providers: Array<Type<{canMatch: CanMatchFn}>>): CanMatchFn[] {
  return providers.map(
    (provider) =>
      (...params) =>
        inject(provider).canMatch(...params),
  );
}

/**
 * Maps an array of injectable classes with canActivate functions to an array of equivalent
 * `CanActivateFn` for use in a `Route` definition.
 *
 * Usage {@example router/utils/functional_guards.ts region='CanActivate'}
 *
 * @publicApi
 * @see {@link Route}
 */
export function mapToCanActivate(
  providers: Array<Type<{canActivate: CanActivateFn}>>,
): CanActivateFn[] {
  return providers.map(
    (provider) =>
      (...params) =>
        inject(provider).canActivate(...params),
  );
}
/**
 * Maps an array of injectable classes with canActivateChild functions to an array of equivalent
 * `CanActivateChildFn` for use in a `Route` definition.
 *
 * Usage {@example router/utils/functional_guards.ts region='CanActivate'}
 *
 * @publicApi
 * @see {@link Route}
 */
export function mapToCanActivateChild(
  providers: Array<Type<{canActivateChild: CanActivateChildFn}>>,
): CanActivateChildFn[] {
  return providers.map(
    (provider) =>
      (...params) =>
        inject(provider).canActivateChild(...params),
  );
}
/**
 * Maps an array of injectable classes with canDeactivate functions to an array of equivalent
 * `CanDeactivateFn` for use in a `Route` definition.
 *
 * Usage {@example router/utils/functional_guards.ts region='CanActivate'}
 *
 * @publicApi
 * @see {@link Route}
 */
export function mapToCanDeactivate<T = unknown>(
  providers: Array<Type<{canDeactivate: CanDeactivateFn<T>}>>,
): CanDeactivateFn<T>[] {
  return providers.map(
    (provider) =>
      (...params) =>
        inject(provider).canDeactivate(...params),
  );
}
/**
 * Maps an injectable class with a resolve function to an equivalent `ResolveFn`
 * for use in a `Route` definition.
 *
 * Usage {@example router/utils/functional_guards.ts region='Resolve'}
 *
 * @publicApi
 * @see {@link Route}
 */
export function mapToResolve<T>(provider: Type<{resolve: ResolveFn<T>}>): ResolveFn<T> {
  return (...params) => inject(provider).resolve(...params);
}

/**
 * Creates a new functional guard that is the concatenation of the specified guards.
 * If any of the guards returns a result other than `true`, this one will be the result of the
 * combined guard and the following guards in the chain are skipped.
 *
 * @param guards An array of functional guards that should be executed in the declared order.
 * @returns The combined functional guard.
 *
 * @publicApi
 * @see {@link Route}
 */
export function runCanActivateGuardsSerially(
  guards: CanActivateFn[] | CanActivateChildFn[],
): CanActivateFn | CanActivateChildFn {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const injector = inject(EnvironmentInjector);
    return of(...guards).pipe(
      concatMap((guard) => {
        const guardResult = runInInjectionContext(injector, () => guard(route, state));
        return wrapIntoObservable(guardResult).pipe(first());
      }),
      skipWhile((v) => v === true),
      defaultIfEmpty(true),
      first(),
    );
  };
}
