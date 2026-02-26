/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

const specialProviders = new Set<any>();

/**
 * Registers a class as a special provider.
 *
 * @param clazz The class to register
 */
export function registerSpecialProvider<T>(clazz: T): void {
  if (typeof ngDevMode !== 'undefined' && ngDevMode) {
    specialProviders.add(clazz);
  }
}

/**
 * Gets all special providers that have been registered.
 */
export function getAllSpecialProviders(): ReadonlySet<any> {
  return specialProviders;
}
