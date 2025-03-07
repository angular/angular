/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {ɵFrameworkAgnosticGlobalUtils as GlobalUtils} from '@angular/core';

/**
 * Returns a handle to window.ng APIs (global angular debugging).
 *
 * @returns window.ng
 */
export const ngDebugClient = () => (window as any).ng as Partial<GlobalUtils>;

/**
 * Type guard that checks whether a given debug API is supported within window.ng
 *
 * @returns whether the ng object includes the given debug API
 */
export function ngDebugApiIsSupported<T extends Partial<GlobalUtils>, K extends keyof T>(
  ng: T,
  api: K,
): ng is T & Record<K, NonNullable<T[K]>> {
  return typeof ng[api] === 'function';
}

/**
 * Checks whether Dependency Injection debug API is supported within window.ng
 *
 * @returns boolean
 */
export function ngDebugDependencyInjectionApiIsSupported(): boolean {
  const ng = ngDebugClient();
  if (!ngDebugApiIsSupported(ng, 'getInjector')) {
    return false;
  }
  if (!ngDebugApiIsSupported(ng, 'ɵgetInjectorResolutionPath')) {
    return false;
  }
  if (!ngDebugApiIsSupported(ng, 'ɵgetDependenciesFromInjectable')) {
    return false;
  }
  if (!ngDebugApiIsSupported(ng, 'ɵgetInjectorProviders')) {
    return false;
  }
  if (!ngDebugApiIsSupported(ng, 'ɵgetInjectorMetadata')) {
    return false;
  }

  return true;
}
