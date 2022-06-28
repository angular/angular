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

  FORM_CONTROL_NAME_MISSING_PARENT = 1050,
  FORM_CONTROL_NAME_INSIDE_MODEL_GROUP = 1051,
  FORM_GROUP_MISSING_INSTANCE = 1052,
  FORM_GROUP_NAME_MISSING_PARENT = 1053,
  FORM_ARRAY_NAME_MISSING_PARENT = 1054,

  // Validators errors
  WRONG_VALIDATOR_RETURN_TYPE = -1101,

  // Template-driven Forms errors (11xx)
}
