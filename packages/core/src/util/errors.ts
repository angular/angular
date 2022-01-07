/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export const ERROR_ORIGINAL_ERROR = 'ngOriginalError';
export const ERROR_LOGGER = 'ngErrorLogger';


export function wrappedError(message: string, originalError: any): Error {
  const msg = `${message} caused by: ${
      originalError instanceof Error ? originalError.message : originalError}`;
  const error = Error(msg);
  (error as any)[ERROR_ORIGINAL_ERROR] = originalError;
  return error;
}

export function getOriginalError(error: Error): Error {
  return (error as any)[ERROR_ORIGINAL_ERROR];
}

export function getErrorLogger(error: unknown): (console: Console, ...values: any[]) => void {
  return error && (error as any)[ERROR_LOGGER] || defaultErrorLogger;
}

function defaultErrorLogger(console: Console, ...values: any[]) {
  (<any>console.error)(...values);
}
