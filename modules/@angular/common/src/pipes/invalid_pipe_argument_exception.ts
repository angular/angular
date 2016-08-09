/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BaseException, Type} from '@angular/core';
import {stringify} from '../facade/lang';

export class InvalidPipeArgumentException extends BaseException {
  constructor(type: Type<any>, value: Object) {
    super(`Invalid argument '${value}' for pipe '${stringify(type)}'`);
  }
}
