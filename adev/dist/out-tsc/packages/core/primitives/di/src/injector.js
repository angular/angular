/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Current injector value used by `inject`.
 * - `undefined`: it is an error to call `inject`
 * - `null`: `inject` can be called but there is no injector (limp-mode).
 * - Injector instance: Use the injector for resolution.
 */
let _currentInjector = undefined;
export function getCurrentInjector() {
  return _currentInjector;
}
export function setCurrentInjector(injector) {
  const former = _currentInjector;
  _currentInjector = injector;
  return former;
}
export function inject(token, options) {
  const currentInjector = getCurrentInjector();
  if (!currentInjector) {
    throw new Error('Current injector is not set.');
  }
  if (!token.ɵprov) {
    throw new Error('Token is not an injectable');
  }
  return currentInjector.retrieve(token, options);
}
//# sourceMappingURL=injector.js.map
