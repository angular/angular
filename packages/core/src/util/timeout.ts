/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {global} from './global';

export function getNativeSetTimeout() {
  let nativeSetTimeout: (callback: TimerHandler, timeout?: number) => number = global['setTimeout'];
  let nativeClearTimeout: (handle: number) => void = global['clearTimeout'];
  if (typeof Zone !== 'undefined' && nativeSetTimeout && nativeClearTimeout) {
    // Use unpatched version of `setTimeout` (native delegate) if possible
    // to avoid another change detection.
    const unpatchedSetTimeout =
        (nativeSetTimeout as any)[(Zone as any).__symbol__('OriginalDelegate')];
    if (unpatchedSetTimeout) {
      nativeSetTimeout = unpatchedSetTimeout;
    }
    const unpatchedClearTimeout =
        (nativeClearTimeout as any)[(Zone as any).__symbol__('OriginalDelegate')];
    if (unpatchedClearTimeout) {
      nativeClearTimeout = unpatchedClearTimeout;
    }
  }
  return {nativeSetTimeout, nativeClearTimeout};
}
