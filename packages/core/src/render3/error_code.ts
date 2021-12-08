/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
 * Full list of available error guides can be found at https://angular.io/errors.
 */
export const enum RuntimeErrorCode {
  // Change Detection Errors
  EXPRESSION_CHANGED_AFTER_CHECKED = -100,
  RECURSIVE_APPLICATION_REF_TICK = 101,

  // Dependency Injection Errors
  CYCLIC_DI_DEPENDENCY = -200,
  PROVIDER_NOT_FOUND = -201,

  // Template Errors
  MULTIPLE_COMPONENTS_MATCH = -300,
  EXPORT_NOT_FOUND = -301,
  PIPE_NOT_FOUND = -302,
  UNKNOWN_BINDING = 303,
  UNKNOWN_ELEMENT = 304,
  TEMPLATE_STRUCTURE_ERROR = 305,

  // Bootstrap Errors
  MULTIPLE_PLATFORMS = 400,
  PLATFORM_NOT_FOUND = 401,
  ERROR_HANDLER_NOT_FOUND = 402,
  BOOTSTRAP_COMPONENTS_NOT_FOUND = 403,
  ALREADY_DESTROYED_PLATFORM = 404,
  ASYNC_INITIALIZERS_STILL_RUNNING = 405,

  // Styling Errors

  // Declarations Errors

  // i18n Errors

  // JIT Compilation Errors
}

export class RuntimeError<T = RuntimeErrorCode> extends Error {
  constructor(public code: T, message: string) {
    super(formatRuntimeError<T>(code, message));
  }
}

/** Called to format a runtime error */
export function formatRuntimeError<T = RuntimeErrorCode>(code: T, message: string): string {
  const codeAsNumber = code as unknown as number;
  // Error code might be a negative number, which is a special marker that instructs the logic to
  // generate a link to the error details page on angular.io.
  const fullCode = `NG0${Math.abs(codeAsNumber)}`;

  let errorMessage = `${fullCode}${message ? ': ' + message : ''}`;

  if (ngDevMode && codeAsNumber < 0) {
    errorMessage = `${errorMessage}. Find more at ${ERROR_DETAILS_PAGE_BASE_URL}/${fullCode}`;
  }
  return errorMessage;
}
