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
export const NOT_FOUND: unique symbol = Symbol('NotFound');

/**
 * Error thrown when the key-value pair couldn't be found in the context
 * hierarchy. Context can be attached below.
 */
export class NotFoundError extends Error {
  override readonly name: string = 'ɵNotFound';
  constructor(message: string) {
    super(message);
  }
}

/**
 * Type guard for checking if an unknown value is a NotFound.
 */
export function isNotFound(e: unknown): e is NotFound {
  if (e === NOT_FOUND) return true;

  if (e instanceof Error) {
    return e.name === 'ɵNotFound';
  }

  return false;
}

/**
 * Type union of NotFound and NotFoundError.
 */
export type NotFound = typeof NOT_FOUND | NotFoundError;
