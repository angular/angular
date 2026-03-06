/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

const specialProviders = new Set<any>();

/**
 * Patched a class with a special element ID and registers it as a special provider.
 *
 * @param clazz The class to patch
 * @param prov The factory function OR the special element ID
 */
export function patchSpecialProvider<T>(clazz: T, prov: any): T {
  (clazz as any).__NG_ELEMENT_ID__ = prov;
  if (typeof ngDevMode !== 'undefined' && ngDevMode) {
    specialProviders.add(clazz);
  }
  return clazz;
}

/**
 * Gets all special providers that have been registered.
 */
export function getAllSpecialProviders(): ReadonlySet<any> {
  return specialProviders;
}
