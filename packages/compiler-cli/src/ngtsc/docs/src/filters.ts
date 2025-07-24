/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/** Gets whether a symbol's name indicates it is an Angular-private API. */
export function isAngularPrivateName(name: string) {
  const firstChar = name[0] ?? '';
  return firstChar === 'ɵ' || firstChar === '_';
}
