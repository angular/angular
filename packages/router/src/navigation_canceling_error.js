/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {NavigationCancellationCode} from './events';
import {isUrlTree} from './url_tree';
export const NAVIGATION_CANCELING_ERROR = 'ngNavigationCancelingError';
export function redirectingNavigationError(urlSerializer, redirect) {
  const {redirectTo, navigationBehaviorOptions} = isUrlTree(redirect)
    ? {redirectTo: redirect, navigationBehaviorOptions: undefined}
    : redirect;
  const error = navigationCancelingError(
    ngDevMode && `Redirecting to "${urlSerializer.serialize(redirectTo)}"`,
    NavigationCancellationCode.Redirect,
  );
  error.url = redirectTo;
  error.navigationBehaviorOptions = navigationBehaviorOptions;
  return error;
}
export function navigationCancelingError(message, code) {
  const error = new Error(`NavigationCancelingError: ${message || ''}`);
  error[NAVIGATION_CANCELING_ERROR] = true;
  error.cancellationCode = code;
  return error;
}
export function isRedirectingNavigationCancelingError(error) {
  return isNavigationCancelingError(error) && isUrlTree(error.url);
}
export function isNavigationCancelingError(error) {
  return !!error && error[NAVIGATION_CANCELING_ERROR];
}
//# sourceMappingURL=navigation_canceling_error.js.map
