/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ERROR_DETAILS_PAGE_BASE_URL} from './error_details_base_url';

export const enum RuntimeErrorCode {
  // Internal Errors

  // Change Detection Errors
  EXPRESSION_CHANGED_AFTER_CHECKED = '100',

  // Dependency Injection Errors
  CYCLIC_DI_DEPENDENCY = '200',
  PROVIDER_NOT_FOUND = '201',

  // Template Errors
  MULTIPLE_COMPONENTS_MATCH = '300',
  EXPORT_NOT_FOUND = '301',
  PIPE_NOT_FOUND = '302',
  UNKNOWN_BINDING = '303',
  UNKNOWN_ELEMENT = '304',
  TEMPLATE_STRUCTURE_ERROR = '305',

  // Styling Errors

  // Declarations Errors

  // i18n Errors

  // Compilation Errors

  // Other
  UNSAFE_IFRAME_ATTRS = '910',

  // Image directive errors
  UNEXPECTED_SRC_ATTR = 2950,
  UNEXPECTED_SRCSET_ATTR = 2951,
  INVALID_INPUT = 2952,
  UNEXPECTED_INPUT_CHANGE = 2953,
  REQUIRED_INPUT_MISSING = 2954,
  LCP_IMG_MISSING_PRIORITY = 2955,
  PRIORITY_IMG_MISSING_PRECONNECT_TAG = 2956,
  UNEXPECTED_DEV_MODE_CHECK_IN_PROD_MODE = 2958,
  INVALID_LOADER_ARGUMENTS = 2959,
  OVERSIZED_IMAGE = 2960,
  TOO_MANY_PRELOADED_IMAGES = 2961,
  MISSING_BUILTIN_LOADER = 2962,
  MISSING_NECESSARY_LOADER = 2963,
}

export class RuntimeError extends Error {
  constructor(public code: RuntimeErrorCode, message: string) {
    super(formatRuntimeError(code, message));
  }
}

// Contains a set of error messages that have details guides at angular.io.
// Full list of available error guides can be found at https://angular.io/errors
/* tslint:disable:no-toplevel-property-access */
export const RUNTIME_ERRORS_WITH_GUIDES = new Set([
  RuntimeErrorCode.EXPRESSION_CHANGED_AFTER_CHECKED,
  RuntimeErrorCode.CYCLIC_DI_DEPENDENCY,
  RuntimeErrorCode.PROVIDER_NOT_FOUND,
  RuntimeErrorCode.MULTIPLE_COMPONENTS_MATCH,
  RuntimeErrorCode.EXPORT_NOT_FOUND,
  RuntimeErrorCode.PIPE_NOT_FOUND,
  RuntimeErrorCode.UNSAFE_IFRAME_ATTRS,
]);
/* tslint:enable:no-toplevel-property-access */

/** Called to format a runtime error */
export function formatRuntimeError(code: RuntimeErrorCode, message: string): string {
  const fullCode = code ? `NG0${code}: ` : '';

  let errorMessage = `${fullCode}${message}`;

  // Some runtime errors are still thrown without `ngDevMode` (for example
  // `throwProviderNotFoundError`), so we add `ngDevMode` check here to avoid pulling
  // `RUNTIME_ERRORS_WITH_GUIDES` symbol into prod bundles.
  // TODO: revisit all instances where `RuntimeError` is thrown and see if `ngDevMode` can be added
  // there instead to tree-shake more devmode-only code (and eventually remove `ngDevMode` check
  // from this code).
  if (ngDevMode && RUNTIME_ERRORS_WITH_GUIDES.has(code)) {
    errorMessage = `${errorMessage}. Find more at ${ERROR_DETAILS_PAGE_BASE_URL}/NG0${code}`;
  }
  return errorMessage;
}
