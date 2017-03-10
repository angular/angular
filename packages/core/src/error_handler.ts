/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ERROR_ORIGINAL_ERROR, getDebugContext, getOriginalError} from './errors';


/**
 * @whatItDoes Provides a hook for centralized exception handling.
 *
 * @description
 *
 * The default implementation of `ErrorHandler` prints error messages to the `console`. To
 * intercept error handling, write a custom exception handler that replaces this default as
 * appropriate for your app.
 *
 * ### Example
 *
 * ```
 * class MyErrorHandler implements ErrorHandler {
 *   handleError(error) {
 *     // do something with the exception
 *   }
 * }
 *
 * @NgModule({
 *   providers: [{provide: ErrorHandler, useClass: MyErrorHandler}]
 * })
 * class MyModule {}
 * ```
 *
 * @stable
 */
export class ErrorHandler {
  /**
   * @internal
   */
  _console: Console = console;

  /**
   * @internal
   */
  rethrowError: boolean;

  constructor(rethrowError: boolean = false) { this.rethrowError = rethrowError; }

  handleError(error: any): void {
    this._console.error(`EXCEPTION: ${this._extractMessage(error)}`);

    if (error instanceof Error) {
      const originalError = this._findOriginalError(error);
      const originalStack = this._findOriginalStack(error);
      const context = this._findContext(error);

      if (originalError) {
        this._console.error(`ORIGINAL EXCEPTION: ${this._extractMessage(originalError)}`);
      }

      if (originalStack) {
        this._console.error('ORIGINAL STACKTRACE:');
        this._console.error(originalStack);
      }

      if (context) {
        this._console.error('ERROR CONTEXT:');
        this._console.error(context);
      }
    }

    if (this.rethrowError) throw error;
  }

  /** @internal */
  _extractMessage(error: any): string {
    return error instanceof Error ? error.message : error.toString();
  }

  /** @internal */
  _findContext(error: any): any {
    if (error) {
      return getDebugContext(error) ? getDebugContext(error) :
                                      this._findContext(getOriginalError(error));
    }

    return null;
  }

  /** @internal */
  _findOriginalError(error: Error): any {
    let e = getOriginalError(error);
    while (e && getOriginalError(e)) {
      e = getOriginalError(e);
    }

    return e;
  }

  /** @internal */
  _findOriginalStack(error: Error): string {
    let e: any = error;
    let stack: string = e.stack;
    while (e instanceof Error && getOriginalError(e)) {
      e = getOriginalError(e);
      if (e instanceof Error && e.stack) {
        stack = e.stack;
      }
    }

    return stack;
  }
}

export function wrappedError(message: string, originalError: any): Error {
  const msg =
      `${message} caused by: ${originalError instanceof Error ? originalError.message: originalError }`;
  const error = Error(msg);
  (error as any)[ERROR_ORIGINAL_ERROR] = originalError;
  return error;
}
