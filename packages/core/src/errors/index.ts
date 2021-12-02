/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createRuntimeErrorClass} from './util';

/**
 * The list of error codes used in runtime code.
 * Note: the negative sign denotes the fact that a particular code has a detailed guide on
 * angular.io. Full list of available error guides can be found at https://angular.io/errors.
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

  // Compilation Errors
}

/**
 * Public-facing error code structure incudes a bit that represents a package from which the error
 * was triggered: NG<PACKAGE><CODE>. This enum contains codes for each package that use shared
 * runtime error infrastructure.
 */
export const enum PackageErrorPrefix {
  CORE = 0,
  FORMS = 1,
  COMMON = 2,
}

// Main class that should be used to throw runtime errors in the core package
// tslint:disable-next-line:no-toplevel-property-access
export const RuntimeError = createRuntimeErrorClass(PackageErrorPrefix.CORE);
