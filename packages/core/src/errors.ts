/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ERROR_DETAILS_PAGE_BASE_URL} from './error_details_base_url';

/**
 * The list of error codes used in runtime code of the `core` package.
 * Reserved error code range: 100-999.
 *
 * Note: the minus sign denotes the fact that a particular code has a detailed guide on
 * angular.io. This extra annotation is needed to avoid introducing a separate set to store
 * error codes which have guides, which might leak into runtime code.
 *
 * Full list of available error guides can be found at https://angular.dev/errors.
 *
 * Error code ranges per package:
 *  - core (this package): 100-999
 *  - forms: 1000-1999
 *  - common: 2000-2999
 *  - animations: 3000-3999
 *  - router: 4000-4999
 *  - platform-browser: 5000-5500
 */
export const enum RuntimeErrorCode {
  // Change Detection Errors
  EXPRESSION_CHANGED_AFTER_CHECKED = -100,
  RECURSIVE_APPLICATION_REF_TICK = 101,
  INFINITE_CHANGE_DETECTION = 103,

  // Dependency Injection Errors
  CYCLIC_DI_DEPENDENCY = -200,
  PROVIDER_NOT_FOUND = -201,
  INVALID_FACTORY_DEPENDENCY = 202,
  MISSING_INJECTION_CONTEXT = -203,
  INVALID_INJECTION_TOKEN = 204,
  INJECTOR_ALREADY_DESTROYED = 205,
  PROVIDER_IN_WRONG_CONTEXT = 207,
  MISSING_INJECTION_TOKEN = 208,
  INVALID_MULTI_PROVIDER = -209,
  MISSING_DOCUMENT = 210,

  // Template Errors
  MULTIPLE_COMPONENTS_MATCH = -300,
  EXPORT_NOT_FOUND = -301,
  PIPE_NOT_FOUND = -302,
  UNKNOWN_BINDING = 303,
  UNKNOWN_ELEMENT = 304,
  TEMPLATE_STRUCTURE_ERROR = 305,
  INVALID_EVENT_BINDING = 306,
  HOST_DIRECTIVE_UNRESOLVABLE = 307,
  HOST_DIRECTIVE_NOT_STANDALONE = 308,
  DUPLICATE_DIRECTIVE = 309,
  HOST_DIRECTIVE_COMPONENT = 310,
  HOST_DIRECTIVE_UNDEFINED_BINDING = 311,
  HOST_DIRECTIVE_CONFLICTING_ALIAS = 312,
  MULTIPLE_MATCHING_PIPES = 313,
  UNINITIALIZED_LET_ACCESS = 314,
  NO_BINDING_TARGET = 315,
  INVALID_BINDING_TARGET = 316,
  INVALID_SET_INPUT_CALL = 317,

  // Bootstrap Errors
  MULTIPLE_PLATFORMS = 400,
  PLATFORM_NOT_FOUND = 401,
  MISSING_REQUIRED_INJECTABLE_IN_BOOTSTRAP = 402,
  BOOTSTRAP_COMPONENTS_NOT_FOUND = -403,
  PLATFORM_ALREADY_DESTROYED = 404,
  ASYNC_INITIALIZERS_STILL_RUNNING = 405,
  APPLICATION_REF_ALREADY_DESTROYED = 406,
  RENDERER_NOT_FOUND = 407,
  PROVIDED_BOTH_ZONE_AND_ZONELESS = 408,

  // Hydration Errors
  HYDRATION_NODE_MISMATCH = -500,
  HYDRATION_MISSING_SIBLINGS = -501,
  HYDRATION_MISSING_NODE = -502,
  UNSUPPORTED_PROJECTION_DOM_NODES = -503,
  INVALID_SKIP_HYDRATION_HOST = -504,
  MISSING_HYDRATION_ANNOTATIONS = -505,
  HYDRATION_STABLE_TIMEDOUT = -506,
  MISSING_SSR_CONTENT_INTEGRITY_MARKER = -507,
  MISCONFIGURED_INCREMENTAL_HYDRATION = 508,

  // Signal Errors
  SIGNAL_WRITE_FROM_ILLEGAL_CONTEXT = 600,
  REQUIRE_SYNC_WITHOUT_SYNC_EMIT = 601,
  ASSERTION_NOT_INSIDE_REACTIVE_CONTEXT = -602,

  // Animation Errors
  ANIMATE_INVALID_VALUE = 650,
  // Declarations Errors

  // i18n Errors
  INVALID_I18N_STRUCTURE = 700,
  MISSING_LOCALE_DATA = 701,

  // Defer errors (750-799 range)
  DEFER_LOADING_FAILED = -750,
  DEFER_IN_HMR_MODE = -751,

  // standalone errors
  IMPORT_PROVIDERS_FROM_STANDALONE = 800,

  // JIT Compilation Errors
  // Other
  INVALID_DIFFER_INPUT = 900,
  NO_SUPPORTING_DIFFER_FACTORY = 901,
  VIEW_ALREADY_ATTACHED = 902,
  INVALID_INHERITANCE = 903,
  UNSAFE_VALUE_IN_RESOURCE_URL = 904,
  UNSAFE_VALUE_IN_SCRIPT = 905,
  MISSING_GENERATED_DEF = 906,
  TYPE_IS_NOT_STANDALONE = 907,
  MISSING_ZONEJS = 908,
  UNEXPECTED_ZONE_STATE = 909,
  UNSAFE_IFRAME_ATTRS = -910,
  VIEW_ALREADY_DESTROYED = 911,
  COMPONENT_ID_COLLISION = -912,
  IMAGE_PERFORMANCE_WARNING = -913,
  UNEXPECTED_ZONEJS_PRESENT_IN_ZONELESS_MODE = 914,
  MISSING_NG_MODULE_DEFINITION = 915,
  MISSING_DIRECTIVE_DEFINITION = 916,
  NO_COMPONENT_FACTORY_FOUND = 917,
  EXTERNAL_RESOURCE_LOADING_FAILED = 918,

  // Signal integration errors
  REQUIRED_INPUT_NO_VALUE = -950,
  REQUIRED_QUERY_NO_VALUE = -951,
  REQUIRED_MODEL_NO_VALUE = 952,

  // Output()
  OUTPUT_REF_DESTROYED = 953,

  // Repeater errors
  LOOP_TRACK_DUPLICATE_KEYS = -955,
  LOOP_TRACK_RECREATE = -956,

  // Runtime dependency tracker errors
  RUNTIME_DEPS_INVALID_IMPORTED_TYPE = 980,
  RUNTIME_DEPS_ORPHAN_COMPONENT = 981,
  RUNTIME_DEPS_INVALID_SELECTOR = 982,

  // resource() API errors
  MUST_PROVIDE_STREAM_OPTION = 990,
  RESOURCE_COMPLETED_BEFORE_PRODUCING_VALUE = 991,

  // Upper bounds for core runtime errors is 999
}

/**
 * Class that represents a runtime error.
 * Formats and outputs the error message in a consistent way.
 *
 * Example:
 * ```ts
 *  throw new RuntimeError(
 *    RuntimeErrorCode.INJECTOR_ALREADY_DESTROYED,
 *    ngDevMode && 'Injector has already been destroyed.');
 * ```
 *
 * Note: the `message` argument contains a descriptive error message as a string in development
 * mode (when the `ngDevMode` is defined). In production mode (after tree-shaking pass), the
 * `message` argument becomes `false`, thus we account for it in the typings and the runtime
 * logic.
 */
export class RuntimeError<T extends number = RuntimeErrorCode> extends Error {
  constructor(
    public code: T,
    message: null | false | string,
  ) {
    super(formatRuntimeError<T>(code, message));
  }
}

export function formatRuntimeErrorCode<T extends number = RuntimeErrorCode>(code: T): string {
  // Error code might be a negative number, which is a special marker that instructs the logic to
  // generate a link to the error details page on angular.io.
  // We also prepend `0` to non-compile-time errors.
  return `NG0${Math.abs(code)}`;
}

/**
 * Called to format a runtime error.
 * See additional info on the `message` argument type in the `RuntimeError` class description.
 */
export function formatRuntimeError<T extends number = RuntimeErrorCode>(
  code: T,
  message: null | false | string,
): string {
  const fullCode = formatRuntimeErrorCode(code);

  let errorMessage = `${fullCode}${message ? ': ' + message : ''}`;

  if (ngDevMode && code < 0) {
    const addPeriodSeparator = !errorMessage.match(/[.,;!?\n]$/);
    const separator = addPeriodSeparator ? '.' : '';
    errorMessage = `${errorMessage}${separator} Find more at ${ERROR_DETAILS_PAGE_BASE_URL}/${fullCode}`;
  }
  return errorMessage;
}
