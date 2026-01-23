/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NavigationCancellationCode} from './events';
import {NavigationBehaviorOptions, RedirectCommand} from './models';
import {isUrlTree, UrlSerializer, UrlTree} from './url_tree';

export const NAVIGATION_CANCELING_ERROR = 'ngNavigationCancelingError';

export type NavigationCancelingError = Error & {
  [NAVIGATION_CANCELING_ERROR]: true;
  cancellationCode: NavigationCancellationCode;
};
export type RedirectingNavigationCancelingError = NavigationCancelingError & {
  url: UrlTree;
  navigationBehaviorOptions?: NavigationBehaviorOptions;
  cancellationCode: NavigationCancellationCode.Redirect;
};

export function redirectingNavigationError(
  urlSerializer: UrlSerializer,
  redirect: UrlTree | RedirectCommand,
): RedirectingNavigationCancelingError {
  const {redirectTo, navigationBehaviorOptions} = isUrlTree(redirect)
    ? {redirectTo: redirect, navigationBehaviorOptions: undefined}
    : redirect;
  const error = navigationCancelingError(
    ngDevMode && `Redirecting to "${urlSerializer.serialize(redirectTo)}"`,
    NavigationCancellationCode.Redirect,
  ) as RedirectingNavigationCancelingError;
  error.url = redirectTo;
  error.navigationBehaviorOptions = navigationBehaviorOptions;
  return error;
}

export function navigationCancelingError(
  message: string | null | false,
  code: NavigationCancellationCode,
) {
  const error = new Error(`NavigationCancelingError: ${message || ''}`) as NavigationCancelingError;
  error[NAVIGATION_CANCELING_ERROR] = true;
  error.cancellationCode = code;
  return error;
}

export function isRedirectingNavigationCancelingError(
  error: unknown | RedirectingNavigationCancelingError,
): error is RedirectingNavigationCancelingError {
  return (
    isNavigationCancelingError(error) &&
    isUrlTree((error as RedirectingNavigationCancelingError).url)
  );
}

export function isNavigationCancelingError(error: unknown): error is NavigationCancelingError {
  return !!error && (error as NavigationCancelingError)[NAVIGATION_CANCELING_ERROR];
}
