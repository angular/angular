/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * The list of error codes used in runtime code of the `forms` package.
 * Reserved error code range: 1000-1999.
 */
export const enum RuntimeErrorCode {
  // Reactive Forms errors (10xx)

  // Basic structure validation errors
  NO_CONTROLS = 1000,
  MISSING_CONTROL = 1001,
  MISSING_CONTROL_VALUE = 1002,

  // Validators errors
  WRONG_VALIDATOR_RETURN_TYPE = -1101,

  // Template-driven Forms errors (11xx)
}
