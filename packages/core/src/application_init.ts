/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isPromise} from '../src/util/lang';

import {Inject, Injectable, InjectionToken, Optional} from './di';


/**
 * A function that will be executed when an application is initialized.
 * @experimental
 */
export const APP_INITIALIZER = new InjectionToken<Array<() => void>>('Application Initializer');

/**
 * A class that reflects the state of running {@link APP_INITIALIZER}s.
 *
 * @experimental
 */
@Injectable()
export class ApplicationInitStatus {
  private resolve: Function;
  private reject: Function;
  private initialized = false;
  private _donePromise: Promise<any>;
  private _done = false;

  constructor(@Inject(APP_INITIALIZER) @Optional() private appInits: (() => any)[]) {
    this._donePromise = new Promise((res, rej) => {
      this.resolve = res;
      this.reject = rej;
    });
  }

  /** @internal */
  runInitializers() {
    if (this.initialized) {
      return;
    }

    const asyncInitPromises: Promise<any>[] = [];

    const complete =
        () => {
          this._done = true;
          this.resolve();
        }

    if (this.appInits) {
      for (let i = 0; i < this.appInits.length; i++) {
        const initResult = this.appInits[i]();
        if (isPromise(initResult)) {
          asyncInitPromises.push(initResult);
        }
      }
    }

    Promise.all(asyncInitPromises).then(() => { complete(); }).catch(e => { this.reject(e); });

    if (asyncInitPromises.length === 0) {
      complete();
    }
    this.initialized = true;
  }

  get done(): boolean { return this._done; }

  get donePromise(): Promise<any> { return this._donePromise; }
}
