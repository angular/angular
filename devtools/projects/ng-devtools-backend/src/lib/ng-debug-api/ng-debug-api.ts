/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {ɵExternalGlobalUtils, ɵInternalGlobalUtils} from '@angular/core';
import type {ɵGlobalUtils as RouterGlobalUtils} from '@angular/router';

/**
 * Full set of all `ng` global utilities.
 *
 * There is no single canonical definition of the `ng` global because it comes from multiple
 * locations, so this aggregates all of them together and wraps it in a `Partial` because it
 * is generally not safe to assume that any particular function is implemented without first
 * verifying it via runtime feature detection.
 */
export type NgGlobal = Partial<ɵExternalGlobalUtils & ɵInternalGlobalUtils & RouterGlobalUtils>;

/**
 * Returns a handle to window.ng APIs (global angular debugging).
 */
export const ngDebugClient = () => (window as any).ng as NgGlobal;

/**
 * Checks whether a given debug API is supported within window.ng
 */
export function ngDebugApiIsSupported(api: keyof NgGlobal): boolean {
  const ng = ngDebugClient();
  return typeof ng[api] === 'function';
}

/**
 * Checks whether Dependency Injection debug API is supported within window.ng
 */
export function ngDebugDependencyInjectionApiIsSupported(): boolean {
  if (!ngDebugApiIsSupported('getInjector')) {
    return false;
  }
  if (!ngDebugApiIsSupported('ɵgetInjectorResolutionPath')) {
    return false;
  }
  if (!ngDebugApiIsSupported('ɵgetDependenciesFromInjectable')) {
    return false;
  }
  if (!ngDebugApiIsSupported('ɵgetInjectorProviders')) {
    return false;
  }
  if (!ngDebugApiIsSupported('ɵgetInjectorMetadata')) {
    return false;
  }

  return true;
}
