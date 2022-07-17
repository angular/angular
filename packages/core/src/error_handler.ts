/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getOriginalError} from './util/errors';

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

    this._console.error('ERROR', error);
    if (originalError) {
      this._console.error('ORIGINAL ERROR', originalError);
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
