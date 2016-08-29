/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '@angular/core';

import {BaseError} from '../facade/errors';
import {stringify} from '../facade/lang';

export class InvalidPipeArgumentError extends BaseError {
  constructor(type: Type<any>, value: Object) {
    super(`Invalid argument '${value}' for pipe '${stringify(type)}'`);
  }
}
