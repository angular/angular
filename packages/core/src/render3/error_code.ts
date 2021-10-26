/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Base URL for the error details page.
// Keep this value in sync with a similar const in
// `packages/compiler-cli/src/ngtsc/diagnostics/src/error_code.ts`.
const ERROR_DETAILS_PAGE_BASE_URL = 'https://angular.io/errors';

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
  TEMPLATE_STRUCTURE_ERROR = '305'

  // Styling Errors

  // Declarations Errors

  // i18n Errors

  // Compilation Errors
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
