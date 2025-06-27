/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * The list of error codes used in runtime code of the `common/http` package.
 * Reserved error code range: 2800-2899.
 */
export const enum RuntimeErrorCode {
  MISSING_JSONP_MODULE = -2800,
  NOT_USING_FETCH_BACKEND_IN_SSR = 2801,
  HEADERS_ALTERED_BY_TRANSFER_CACHE = 2802,
  HTTP_ORIGIN_MAP_USED_IN_CLIENT = 2803,
  HTTP_ORIGIN_MAP_CONTAINS_PATH = 2804,
  CANNOT_SPECIFY_BOTH_FROM_STRING_AND_FROM_OBJECT = 2805,
  RESPONSE_IS_NOT_AN_ARRAY_BUFFER = 2806,
  RESPONSE_IS_NOT_A_BLOB = 2807,
  RESPONSE_IS_NOT_A_STRING = 2808,
  UNHANDLED_OBSERVE_TYPE = 2809,
  JSONP_WRONG_METHOD = 2810,
  JSONP_WRONG_RESPONSE_TYPE = 2811,
  JSONP_HEADERS_NOT_SUPPORTED = 2812,
  KEEPALIVE_NOT_SUPPORTED_WITH_XHR = 2813,
  CACHE_NOT_SUPPORTED_WITH_XHR = 2814,
  PRIORITY_NOT_SUPPORTED_WITH_XHR = 2815,
}
