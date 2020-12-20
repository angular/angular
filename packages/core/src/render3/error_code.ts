/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

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

/** Called to format a runtime error */
export function formatRuntimeError(code: RuntimeErrorCode, message: string): string {
  const fullCode = code ? `NG0${code}: ` : '';
  return `${fullCode}${message}`;
}
