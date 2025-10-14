/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {inject} from '@angular/core';
/**
 * Maps an array of injectable classes with canMatch functions to an array of equivalent
 * `CanMatchFn` for use in a `Route` definition.
 *
 * Usage {@example router/utils/functional_guards.ts region='CanActivate'}
 *
 * @publicApi
 * @see {@link Route}
 */
export function mapToCanMatch(providers) {
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
export function mapToCanActivate(providers) {
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
export function mapToCanActivateChild(providers) {
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
export function mapToCanDeactivate(providers) {
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
export function mapToResolve(provider) {
  return (...params) => inject(provider).resolve(...params);
}
//# sourceMappingURL=functional_guards.js.map
