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

  /**
   * This error code indicates that there are incompatible decorators on a type or a class field.
   */
  DECORATOR_COLLISION = 1006,

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

  /**
   * Raised when an NgModule contains an invalid reference in `declarations`.
   */
  NGMODULE_INVALID_DECLARATION = 6001,

  /**
   * Raised when an NgModule contains an invalid type in `imports`.
   */
  NGMODULE_INVALID_IMPORT = 6002,

  /**
   * Raised when an NgModule contains an invalid type in `exports`.
   */
  NGMODULE_INVALID_EXPORT = 6003,

  /**
   * Raised when an NgModule contains a type in `exports` which is neither in `declarations` nor
   * otherwise imported.
   */
  NGMODULE_INVALID_REEXPORT = 6004,

  /**
   * Raised when ngcc tries to inject a synthetic decorator over one that already exists.
   */
  NGCC_MIGRATION_DECORATOR_INJECTION_ERROR = 7001,

  /**
   * Raised when ngcc tries to decorate a base class that was imported from outside the package.
   */
  NGCC_MIGRATION_EXTERNAL_BASE_CLASS = 7002,

  /**
   * Raised when ngcc tries to migrate a class that is extended from a dynamic base class
   * expression.
   */
  NGCC_MIGRATION_DYNAMIC_BASE_CLASS = 7003,
}

export function ngErrorCode(code: ErrorCode): number {
  return parseInt('-99' + code);
}