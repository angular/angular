/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * An unrecoverable error during linking.
 */
export class FatalLinkerError extends Error {
  readonly type = 'FatalLinkerError';

  /**
   * Create a new FatalLinkerError.
   *
   * @param node The AST node where the error occurred.
   * @param message A description of the error.
   */
  constructor(public node: unknown, message: string) {
    super(message);
  }
}

/**
 * Whether the given object `e` is a FatalLinkerError.
 */
export function isFatalLinkerError(e: any): e is FatalLinkerError {
  return e && e.type === 'FatalLinkerError';
}
