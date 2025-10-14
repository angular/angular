/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {createRuntimeError} from '../render3/errors_di';
import {stringify} from '../util/stringify';
import {THROW_IF_NOT_FOUND} from './injector_compatibility';
export class NullInjector {
  get(token, notFoundValue = THROW_IF_NOT_FOUND) {
    if (notFoundValue === THROW_IF_NOT_FOUND) {
      const message = ngDevMode ? `No provider found for \`${stringify(token)}\`.` : '';
      const error = createRuntimeError(message, -201 /* RuntimeErrorCode.PROVIDER_NOT_FOUND */);
      // Note: This is the name used by the primitives to identify a not found error.
      error.name = 'ɵNotFound';
      throw error;
    }
    return notFoundValue;
  }
}
//# sourceMappingURL=null_injector.js.map
