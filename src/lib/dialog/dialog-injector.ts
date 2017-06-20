/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '@angular/core';
import {MdDialogRef} from './dialog-ref';
import {MdDialogContainer} from './dialog-container';

/** Custom injector type specifically for instantiating components with a dialog. */
export class DialogInjector implements Injector {
  constructor(
    private _parentInjector: Injector,
    private _customTokens: WeakMap<any, any>) { }

  get(token: any, notFoundValue?: any): any {
    const value = this._customTokens.get(token);

    if (typeof value !== 'undefined') {
      return value;
    }

    return this._parentInjector.get<any>(token, notFoundValue);
  }
}
