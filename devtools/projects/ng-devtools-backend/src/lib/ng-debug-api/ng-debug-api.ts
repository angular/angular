/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import type {ɵGlobalDevModeUtils as GlobalDevModeUtils} from '@angular/core';

/**
 * Returns a handle to window.ng APIs (global angular debugging).
 *
 * @returns window.ng
 */
export const ngDebugClient = () => (window as any as GlobalDevModeUtils).ng;

/**
 * Checks whether a given debug API is supported within window.ng
 *
 * @returns boolean
 */
export function ngDebugApiIsSupported(api: keyof GlobalDevModeUtils['ng']): boolean {
  const ng = ngDebugClient();
  return typeof ng[api] === 'function';
}

/**
 * Checks whether Dependency Injection debug API is supported within window.ng
 *
 * @returns boolean
 */
export function ngDebugDependencyInjectionApiIsSupported(): boolean {
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

/**
 * Checks whether SignalGraph debug API is supported within window.ng
 *
 * @returns boolean
 */
export function ngDebugSignalGraphApiIsSupported(): boolean {
  return ngDebugApiIsSupported('getSignalGraphForComponent');
}
