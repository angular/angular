/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ZoneType} from '../zone-impl';

import {zoneSymbol} from './utils';

export function patchToString(Zone: ZoneType): void {
  // override Function.prototype.toString to make zone.js patched function
  // look like native function
  Zone.__load_patch('toString', (global: any) => {
    // In hardened environments (Node --frozen-intrinsics, SES lockdown, or
    // any host that has frozen/sealed Function.prototype or Object.prototype),
    // overwriting these toString methods will throw. We check both up-front
    // and bail atomically so we never leave a half-applied patch: applying
    // only one of the two would make Promise objects stringify inconsistently.
    //
    // Trade-off when bailing: patched functions reveal as their wrapper source
    // via Function.prototype.toString rather than the original native source.
    // Callers that sniff toString output for "[native code]" detection may
    // see different results. This is preferred over crashing module load.
    const functionDescriptor = Object.getOwnPropertyDescriptor(Function.prototype, 'toString');
    const objectDescriptor = Object.getOwnPropertyDescriptor(Object.prototype, 'toString');
    const canPatch = (descriptor: PropertyDescriptor | undefined) =>
      !descriptor || (descriptor.writable !== false && descriptor.configurable !== false);
    if (!canPatch(functionDescriptor) || !canPatch(objectDescriptor)) {
      return;
    }

    // patch Func.prototype.toString to let them look like native
    const originalFunctionToString = Function.prototype.toString;

    const ORIGINAL_DELEGATE_SYMBOL = zoneSymbol('OriginalDelegate');
    const PROMISE_SYMBOL = zoneSymbol('Promise');
    const ERROR_SYMBOL = zoneSymbol('Error');
    const newFunctionToString = function toString(this: unknown) {
      if (typeof this === 'function') {
        const originalDelegate = (this as any)[ORIGINAL_DELEGATE_SYMBOL];
        if (originalDelegate) {
          if (typeof originalDelegate === 'function') {
            return originalFunctionToString.call(originalDelegate);
          } else {
            return Object.prototype.toString.call(originalDelegate);
          }
        }
        if (this === Promise) {
          const nativePromise = global[PROMISE_SYMBOL];
          if (nativePromise) {
            return originalFunctionToString.call(nativePromise);
          }
        }
        if (this === Error) {
          const nativeError = global[ERROR_SYMBOL];
          if (nativeError) {
            return originalFunctionToString.call(nativeError);
          }
        }
      }
      return originalFunctionToString.call(this);
    };
    (newFunctionToString as any)[ORIGINAL_DELEGATE_SYMBOL] = originalFunctionToString;
    Function.prototype.toString = newFunctionToString;

    // patch Object.prototype.toString to let them look like native
    const originalObjectToString = Object.prototype.toString;
    const PROMISE_OBJECT_TO_STRING = '[object Promise]';
    Object.prototype.toString = function () {
      if (typeof Promise === 'function' && this instanceof Promise) {
        return PROMISE_OBJECT_TO_STRING;
      }

      return originalObjectToString.call(this);
    };
  });
}
