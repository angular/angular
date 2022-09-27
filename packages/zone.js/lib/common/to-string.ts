/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {patchMethod, zoneSymbol} from './utils';

// override Function.prototype.toString to make zone.js patched function
// look like native function
Zone.__load_patch('toString', (global: any) => {
  // patch Func.prototype.toString to let them look like native
  const ORIGINAL_DELEGATE_SYMBOL = zoneSymbol('OriginalDelegate');
  const PROMISE_SYMBOL = zoneSymbol('Promise');
  const ERROR_SYMBOL = zoneSymbol('Error');
  patchMethod(Function.prototype, 'toString', (delegate) => (self: any, args: any[]) => {
    if (typeof self === 'function') {
      const originalDelegate = self[ORIGINAL_DELEGATE_SYMBOL];
      if (originalDelegate) {
        if (typeof originalDelegate === 'function') {
          return delegate.call(originalDelegate);
        } else {
          return Object.prototype.toString.call(originalDelegate);
        }
      }
      if (this === Promise) {
        const nativePromise = global[PROMISE_SYMBOL];
        if (nativePromise) {
          return delegate.call(nativePromise);
        }
      }
      if (this === Error) {
        const nativeError = global[ERROR_SYMBOL];
        if (nativeError) {
          return delegate.call(nativeError);
        }
      }
    }
    return delegate.call(self);
  });

  // patch Object.prototype.toString to let them look like native
  const PROMISE_OBJECT_TO_STRING = '[object Promise]';
  patchMethod(Object.prototype, 'toString', (delegate) => (self: any, args: any[]) => {
    if (typeof Promise === 'function' && self instanceof Promise) {
      return PROMISE_OBJECT_TO_STRING;
    }

    return delegate.call(self);
  });
});
