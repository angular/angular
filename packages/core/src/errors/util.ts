/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ERROR_DETAILS_PAGE_BASE_URL} from './error_details_base_url';
import {PackageErrorPrefix, RuntimeErrorCode} from './index';

// Helper methods and types
export interface RuntimeError<T> {
  code: T;
}

export interface RuntimeErrorCtor<T> {
  new(code: T, message: string): RuntimeError<T>;
}

export function createRuntimeErrorClass<T = RuntimeErrorCode>(packagePrefix: PackageErrorPrefix):
    RuntimeErrorCtor<T> {
  class RuntimeErrorImpl<T = RuntimeErrorCode> extends Error {
    constructor(public code: T, message: string) {
      super(formatRuntimeError<T>(code, message, packagePrefix));
    }
  }
  return RuntimeErrorImpl as unknown as RuntimeErrorCtor<T>;
}

/** Called to format a runtime error */
export function formatRuntimeError<T = RuntimeErrorCode>(
    code: T, message: string, packagePrefix: PackageErrorPrefix = PackageErrorPrefix.CORE): string {
  const codeAsNumber = code as unknown as number;
  // Error code might be a negative number, which is a special marker that instructs the logic to
  // generate a link to the error details page on angular.io.
  const fullCode = `NG${packagePrefix}${Math.abs(codeAsNumber)}`;
  let errorMessage = `${fullCode}${message ? ': ' + message : ''}`;

  if (ngDevMode && codeAsNumber < 0) {
    errorMessage = `${errorMessage}. Find more at ${ERROR_DETAILS_PAGE_BASE_URL}/${fullCode}`;
  }
  return errorMessage;
}
