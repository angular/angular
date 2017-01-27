/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '@angular/core';

import {stringify} from '../facade/lang';

export function invalidPipeArgumentError(type: Type<any>, value: Object) {
  return Error(`InvalidPipeArgument: '${value}' for pipe '${stringify(type)}'`);
}
