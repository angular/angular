/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getErrorLogger, getOriginalError} from './util/errors';

/**
 * Provides a hook for centralized exception handling.
 *
 * The default implementation of `ErrorHandler` prints error messages to the `console`. To
 * intercept error handling, write a custom exception handler that replaces this default as
 * appropriate for your app.
 *
 * @usageNotes
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
 * @publicApi
 */
export class ErrorHandler {
  /**
   * @internal
   */
  _console: Console = console;

  handleError(error: any): void {
    const originalError = this._findOriginalError(error);
    // Note: Browser consoles show the place from where console.error was called.
    // We can use this to give users additional information about the error.
    const errorLogger = getErrorLogger(error);

    errorLogger(this._console, `ERROR`, error);
    if (originalError) {
      errorLogger(this._console, `ORIGINAL ERROR`, originalError);
    }
  }

  /** @internal */
  _findOriginalError(error: any): Error|null {
    let e = error && getOriginalError(error);
    while (e && getOriginalError(e)) {
      e = getOriginalError(e);
    }

    return e || null;
  }
}
