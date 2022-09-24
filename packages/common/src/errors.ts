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

  // HTTP Errors
  INVALID_HTTP_RESPONSE = 2800,
  INVAILD_HTTP_HEADER = 2801,
  INVALID_HTTP_REQUEST_METHOD = 2802,
  INVALID_HTTP_PARAMS = 2803,
  UNHANDLED_HTTP_OBSERVE_TYPE = 2804,
  UNEXPECTED_HTTP_JSON_HEADER = 2805,
  MISSING_HTTP_CLIENT_JSON_MODULE = 2806,

  // Image directive errors
  UNEXPECTED_SRC_ATTR = 2950,
  UNEXPECTED_SRCSET_ATTR = 2951,
  INVALID_INPUT = 2952,
  UNEXPECTED_INPUT_CHANGE = 2953,
  REQUIRED_INPUT_MISSING = 2954,
  LCP_IMG_MISSING_PRIORITY = 2955,
  PRIORITY_IMG_MISSING_PRECONNECT_TAG = 2956,
  INVALID_PRECONNECT_CHECK_BLOCKLIST = 2957,
  UNEXPECTED_DEV_MODE_CHECK_IN_PROD_MODE = 2958,
  INVALID_LOADER_ARGUMENTS = 2959,
  OVERSIZED_IMAGE = 2960,
}
