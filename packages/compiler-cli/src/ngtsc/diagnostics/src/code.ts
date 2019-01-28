/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export enum ErrorCode {
  DECORATOR_ARG_NOT_LITERAL = 1001,
  DECORATOR_ARITY_WRONG = 1002,
  DECORATOR_NOT_CALLED = 1003,
  DECORATOR_ON_ANONYMOUS_CLASS = 1004,
  DECORATOR_UNEXPECTED = 1005,

  VALUE_HAS_WRONG_TYPE = 1010,
  VALUE_NOT_LITERAL = 1011,

  COMPONENT_MISSING_TEMPLATE = 2001,
  PIPE_MISSING_NAME = 2002,
  PARAM_MISSING_TOKEN = 2003,

  SYMBOL_NOT_EXPORTED = 3001,
  SYMBOL_EXPORTED_UNDER_DIFFERENT_NAME = 3002,

  CONFIG_FLAT_MODULE_NO_INDEX = 4001,

  /**
   * Raised when a host expression has a parse error, such as a host listener or host binding
   * expression containing a pipe.
   */
  HOST_BINDING_PARSE_ERROR = 5001,
}

export function ngErrorCode(code: ErrorCode): number {
  return parseInt('-99' + code);
}
