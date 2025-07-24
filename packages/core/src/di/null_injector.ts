/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {RuntimeErrorCode} from '../errors';
import {createRuntimeError} from '../render3/errors_di';
import {stringify} from '../util/stringify';

import type {Injector} from './injector';
import {THROW_IF_NOT_FOUND} from './injector_compatibility';

export class NullInjector implements Injector {
  get(token: any, notFoundValue: any = THROW_IF_NOT_FOUND): any {
    if (notFoundValue === THROW_IF_NOT_FOUND) {
      const message = ngDevMode ? `No provider found for \`${stringify(token)}\`.` : '';
      const error = createRuntimeError(message, RuntimeErrorCode.PROVIDER_NOT_FOUND);

      // Note: This is the name used by the primitives to identify a not found error.
      error.name = 'ɵNotFound';

      throw error;
    }
    return notFoundValue;
  }
}
