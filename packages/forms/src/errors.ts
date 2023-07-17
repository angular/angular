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

  // Structure validation errors (10xx)
  NO_CONTROLS = 1000,
  MISSING_CONTROL = 1001,
  MISSING_CONTROL_VALUE = 1002,

  // Reactive Forms errors (1050-1099)
  FORM_CONTROL_NAME_MISSING_PARENT = 1050,
  FORM_CONTROL_NAME_INSIDE_MODEL_GROUP = 1051,
  FORM_GROUP_MISSING_INSTANCE = 1052,
  FORM_GROUP_NAME_MISSING_PARENT = 1053,
  FORM_ARRAY_NAME_MISSING_PARENT = 1054,

  // Validators errors (11xx)
  WRONG_VALIDATOR_RETURN_TYPE = -1101,

  // Value Accessor Errors (12xx)
  NG_VALUE_ACCESSOR_NOT_PROVIDED = 1200,
  COMPAREWITH_NOT_A_FN = 1201,
  NAME_AND_FORM_CONTROL_NAME_MUST_MATCH = 1202,
  NG_MISSING_VALUE_ACCESSOR = -1203,

  // Template-driven Forms errors (1350-1399)
  NGMODEL_IN_FORM_GROUP = 1350,
  NGMODEL_IN_FORM_GROUP_NAME = 1351,
  NGMODEL_WITHOUT_NAME = 1352,
  NGMODELGROUP_IN_FORM_GROUP = 1353,

}
