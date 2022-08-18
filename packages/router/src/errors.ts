/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * The list of error codes used in runtime code of the `router` package.
 * Reserved error code range: 4000-4999.
 */
export const enum RuntimeErrorCode {
  NAMED_OUTLET_REDIRECT = 4000,
  MISSING_REDIRECT = 4001,
  NO_MATCH = 4002,
  ROOT_SEGMENT_MATRIX_PARAMS = 4003,
  MISPLACED_OUTLETS_COMMAND = 4004,
  INVALID_DOUBLE_DOTS = 4005,
  TWO_SEGMENTS_WITH_SAME_OUTLET = 4006,
  FOR_ROOT_CALLED_TWICE = 4007,
  NULLISH_COMMAND = 4008,
  EMPTY_PATH_WITH_PARAMS = 4009,
  UNPARSABLE_URL = 4010,
  UNEXPECTED_VALUE_IN_URL = 4011,
  OUTLET_NOT_ACTIVATED = 4012,
  OUTLET_ALREADY_ACTIVATED = 4013,
  INVALID_ROUTE_CONFIG = 4014,
  INVALID_ROOT_URL_SEGMENT = 4015,
}
