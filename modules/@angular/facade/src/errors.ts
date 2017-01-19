/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Convenience to throw an Error with 'unimplemented' as the message.
 */
export function unimplemented(): any {
  throw new Error('unimplemented');
}

/**
 * @stable
 */
export class BaseError extends Error {
  /** @internal **/
  _nativeError: Error;

  constructor(message: string) {
    super(message);
    // Errors don't use current this, instead they create a new instance.
    // We have to do forward all of our api to the nativeInstance.
    // TODO(bradfordcsmith): Remove this hack when
    //     google/closure-compiler/issues/2102 is fixed.
    const nativeError = new Error(message) as any as Error;
    this._nativeError = nativeError;
  }

  get message() { return this._nativeError.message; }
  set message(message) { this._nativeError.message = message; }
  get name() { return this._nativeError.name; }
  get stack() { return (this._nativeError as any).stack; }
  set stack(value) { (this._nativeError as any).stack = value; }
  toString() { return this._nativeError.toString(); }
}

/**
 * @stable
 */
export class WrappedError extends BaseError {
  originalError: any;

  constructor(message: string, error: any) {
    super(`${message} caused by: ${error instanceof Error ? error.message: error }`);
    this.originalError = error;
  }

  get stack() {
    return ((this.originalError instanceof Error ? this.originalError : this._nativeError) as any)
        .stack;
  }
}
