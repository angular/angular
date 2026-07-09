/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * The list of error codes used in runtime code of the `platform-server` package.
 * Reserved error code range: 5700-5800.
 */
export const enum RuntimeErrorCode {
  GET_COOKIE_NOT_IMPLEMENTED = 5700,
  INVALID_URL = 5701,
  PROTOCOL_RELATIVE_URL_NOT_ALLOWED = 5702,
  SUSPICIOUS_URL_CHANGE_ORIGIN = -5703,
  DISABLED_DOM_EMULATION_IN_NON_BROWSER = 5704,
  XHR_NOT_LOADED = 5705,
  HOST_NOT_ALLOWED = 5706,
}
