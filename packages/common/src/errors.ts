/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * The list of error codes used in runtime code of the `common` package.
 * Reserved error code range: 2000-2999.
 */
export const enum RuntimeErrorCode {
  // NgSwitch errors
  PARENT_NG_SWITCH_NOT_FOUND = 2000,

  // Pipe errors
  INVALID_PIPE_ARGUMENT = 2100,

  // NgForOf errors
  NG_FOR_MISSING_DIFFER = -2200,

  // Image directive errors
  UNEXPECTED_SRC_ATTR = 2950,
  UNEXPECTED_SRCSET_ATTR = 2951,
  INVALID_INPUT = 2952,
  UNEXPECTED_INPUT_CHANGE = 2953,
  REQUIRED_INPUT_MISSING = 2954,
  LCP_IMG_MISSING_PRIORITY = 2955,
  PRIORITY_IMG_MISSING_PRECONNECT_TAG = 2956,
  UNEXPECTED_DEV_MODE_CHECK_IN_PROD_MODE = 2958,
  INVALID_LOADER_ARGUMENTS = 2959,
  OVERSIZED_IMAGE = 2960,
  TOO_MANY_PRELOADED_IMAGES = 2961,
  MISSING_BUILTIN_LOADER = 2962,
  MISSING_NECESSARY_LOADER = 2963,
}
