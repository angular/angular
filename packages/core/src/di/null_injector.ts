/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NotFoundError} from '@angular/core/primitives/di';
import {stringify} from '../util/stringify';
import type {Injector} from './injector';
import {THROW_IF_NOT_FOUND} from './injector_compatibility';

export class NullInjector implements Injector {
  get(token: any, notFoundValue: any = THROW_IF_NOT_FOUND): any {
    if (notFoundValue === THROW_IF_NOT_FOUND) {
      const error = new NotFoundError(`NullInjectorError: No provider for ${stringify(token)}!`);
      throw error;
    }
    return notFoundValue;
  }
}
