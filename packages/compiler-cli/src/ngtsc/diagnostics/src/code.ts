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
}
