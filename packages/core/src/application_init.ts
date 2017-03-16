/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Observable} from 'rxjs/Observable';
import {toPromise} from 'rxjs/operator/toPromise';
import {isObservable, isPromise} from '../src/util/lang';
import {Inject, Injectable, InjectionToken, Optional} from './di';


/** @experimental */
export type AppInitFn = () => void | Observable<any>| Promise<any>;

/**
 * A function that will be executed when an application is initialized.
 * @experimental
 */
export const APP_INITIALIZER = new InjectionToken<AppInitFn[]>('Application Initializer');

/**
 * A class that reflects the state of running {@link APP_INITIALIZER}s.
 *
 * @experimental
 */
@Injectable()
export class ApplicationInitStatus {
  private _donePromise: Promise<any>;
  private _done = false;

  constructor(@Inject(APP_INITIALIZER) @Optional() appInits: AppInitFn[]) {
    const asyncInitPromises: Promise<any>[] = [];

    if (appInits && appInits.length) {
      for (let i = 0; i < appInits.length; i++) {
        const initResult = appInits[i]();
        if (isPromise(initResult)) {
          asyncInitPromises.push(initResult);
        } else if (isObservable(initResult)) {
          asyncInitPromises.push(toPromise.call(initResult));
        }
      }
    }

    if (asyncInitPromises.length) {
      this._donePromise = Promise.all(asyncInitPromises).then(() => this._done = true);
    } else {
      this._done = true;
      this._donePromise = Promise.resolve();
    }
  }

  get done(): boolean { return this._done; }

  get donePromise(): Promise<any> { return this._donePromise; }
}
