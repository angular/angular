/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Value returned if the key-value pair couldn't be found in the context
 * hierarchy.
 */
export const NOT_FOUND = Symbol('NotFound');
/**
 * Error thrown when the key-value pair couldn't be found in the context
 * hierarchy. Context can be attached below.
 */
export class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ɵNotFound';
  }
}
/**
 * Type guard for checking if an unknown value is a NotFound.
 */
export function isNotFound(e) {
  return e === NOT_FOUND || e?.name === 'ɵNotFound';
}
//# sourceMappingURL=not_found.js.map
