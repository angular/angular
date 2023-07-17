/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {stringify} from '../util/stringify';
import {Injector} from './injector';
import {THROW_IF_NOT_FOUND} from './injector_compatibility';

export class NullInjector implements Injector {
  get(token: any, notFoundValue: any = THROW_IF_NOT_FOUND): any {
    if (notFoundValue === THROW_IF_NOT_FOUND) {
      const error = new Error(`NullInjectorError: No provider for ${stringify(token)}!`);
      error.name = 'NullInjectorError';
      throw error;
    }
    return notFoundValue;
  }
}
