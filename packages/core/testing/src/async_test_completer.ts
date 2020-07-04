/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Injectable completer that allows signaling completion of an asynchronous test. Used internally.
 */
export class AsyncTestCompleter {
  // TODO(issue/24571): remove '!'.
  private _resolve!: (result: any) => void;
  // TODO(issue/24571): remove '!'.
  private _reject!: (err: any) => void;
  private _promise: Promise<any> = new Promise((res, rej) => {
    this._resolve = res;
    this._reject = rej;
  });
  done(value?: any) {
    this._resolve(value);
  }

  fail(error?: any, stackTrace?: string) {
    this._reject(error);
  }

  get promise(): Promise<any> {
    return this._promise;
  }
}
