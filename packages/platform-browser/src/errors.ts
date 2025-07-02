/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * The list of error codes used in runtime code of the `platform-browser` package.
 * Reserved error code range: 5000-5500.
 */
export const enum RuntimeErrorCode {
  // Hydration Errors
  UNSUPPORTED_ZONEJS_INSTANCE = -5000,
  HYDRATION_CONFLICTING_FEATURES = 5001,

  // misc errors (5100-5200 range)
  BROWSER_MODULE_ALREADY_LOADED = 5100,
  NO_PLUGIN_FOR_EVENT = 5101,
  UNSUPPORTED_EVENT_TARGET = 5102,
  TESTABILITY_NOT_FOUND = 5103,
  ROOT_NODE_NOT_FOUND = -5104,
  UNEXPECTED_SYNTHETIC_PROPERTY = 5105,

  // Sanitization-related errors (5200-5300 range)
  SANITIZATION_UNSAFE_SCRIPT = 5200,
  SANITIZATION_UNSAFE_RESOURCE_URL = 5201,
  SANITIZATION_UNEXPECTED_CTX = 5202,

  // Animations related errors (5300-5400 range)
  ANIMATION_RENDERER_ASYNC_LOADING_FAILURE = 5300,
}
