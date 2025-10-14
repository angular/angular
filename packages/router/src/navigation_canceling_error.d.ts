/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { NavigationCancellationCode } from './events';
import { NavigationBehaviorOptions, RedirectCommand } from './models';
import { UrlSerializer, UrlTree } from './url_tree';
export declare const NAVIGATION_CANCELING_ERROR = "ngNavigationCancelingError";
export type NavigationCancelingError = Error & {
    [NAVIGATION_CANCELING_ERROR]: true;
    cancellationCode: NavigationCancellationCode;
};
export type RedirectingNavigationCancelingError = NavigationCancelingError & {
    url: UrlTree;
    navigationBehaviorOptions?: NavigationBehaviorOptions;
    cancellationCode: NavigationCancellationCode.Redirect;
};
export declare function redirectingNavigationError(urlSerializer: UrlSerializer, redirect: UrlTree | RedirectCommand): RedirectingNavigationCancelingError;
export declare function navigationCancelingError(message: string | null | false, code: NavigationCancellationCode): NavigationCancelingError;
export declare function isRedirectingNavigationCancelingError(error: unknown | RedirectingNavigationCancelingError): error is RedirectingNavigationCancelingError;
export declare function isNavigationCancelingError(error: unknown): error is NavigationCancelingError;
