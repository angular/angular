/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export const appIsAngularInDevMode = () => {
  return appIsAngular() && appHasGlobalNgDebugObject();
};
export const appIsAngularIvy = () => {
  const rootElement = window.document.querySelector('[ng-version]');
  return typeof rootElement?.__ngContext__ !== 'undefined';
};
export const appIsAngular = () => {
  return !!getAngularVersion();
};
export const appIsSupportedAngularVersion = () => {
  const version = getAngularVersion();
  if (!version) {
    return false;
  }
  const major = parseInt(version.toString().split('.')[0], 10);
  return appIsAngular() && (major >= 12 || major === 0);
};
/**
 * We check if the global `window.ng` is an object and if this object
 * has the `getComponent` or `probe` methods attached to it.
 *
 * `ng.probe` is a view engine method, but to ensure that we correctly
 * detect development mode we need to consider older rendering engines.
 *
 * In some g3 apps processed with Closure, `ng` is a function,
 * which means that `typeof ng !== 'undefined'` is not a sufficient check.
 *
 * @returns if the app has global ng debug object
 */
const appHasGlobalNgDebugObject = () => {
  return (
    typeof ng === 'object' &&
    (typeof ng.getComponent === 'function' || typeof ng.probe === 'function')
  );
};
export const getAngularVersion = () => {
  const el = document.querySelector('[ng-version]');
  if (!el) {
    return null;
  }
  return el.getAttribute('ng-version');
};
export function isHydrationEnabled() {
  return Array.from(document.querySelectorAll('[ng-version]')).some(
    (rootNode) => rootNode?.__ngDebugHydrationInfo__,
  );
}
//# sourceMappingURL=angular-check.js.map
