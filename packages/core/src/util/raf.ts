/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {global} from './global';

export function getNativeRequestAnimationFrame() {
  // Note: the `getNativeRequestAnimationFrame` is used in the `NgZone` class, but we cannot use the
  // `inject` function. The `NgZone` instance may be created manually, and thus the injection
  // context will be unavailable. This might be enough to check whether `requestAnimationFrame` is
  // available because otherwise, we'll fall back to `setTimeout`.
  const isBrowser = typeof global['requestAnimationFrame'] === 'function';

  // Note: `requestAnimationFrame` is unavailable when the code runs in the Node.js environment. We
  // use `setTimeout` because no changes are required other than checking if the current platform is
  // the browser. `setTimeout` is a well-established API that is available in both environments.
  // `requestAnimationFrame` is used in the browser to coalesce event tasks since event tasks are
  // usually executed within the same rendering frame (but this is more implementation details of
  // browsers).
  let nativeRequestAnimationFrame: (callback: FrameRequestCallback) => number =
      global[isBrowser ? 'requestAnimationFrame' : 'setTimeout'];

  let nativeCancelAnimationFrame: (handle: number) => void =
      global[isBrowser ? 'cancelAnimationFrame' : 'clearTimeout'];

  if (typeof Zone !== 'undefined' && nativeRequestAnimationFrame! && nativeCancelAnimationFrame!) {
    // Note: zone.js sets original implementations on patched APIs behind the
    // `__zone_symbol__OriginalDelegate` key (see `attachOriginToPatched`). Given the following
    // example: `window.requestAnimationFrame.__zone_symbol__OriginalDelegate`; this would return an
    // unpatched implementation of the `requestAnimationFrame`, which isn't intercepted by the
    // Angular zone. We use the unpatched implementation to avoid another change detection when
    // coalescing tasks.
    const unpatchedRequestAnimationFrame =
        (nativeRequestAnimationFrame as any)[(Zone as any).__symbol__('OriginalDelegate')];
    if (unpatchedRequestAnimationFrame) {
      nativeRequestAnimationFrame = unpatchedRequestAnimationFrame;
    }
    const unpatchedCancelAnimationFrame =
        (nativeCancelAnimationFrame as any)[(Zone as any).__symbol__('OriginalDelegate')];
    if (unpatchedCancelAnimationFrame) {
      nativeCancelAnimationFrame = unpatchedCancelAnimationFrame;
    }
  }
  return {nativeRequestAnimationFrame, nativeCancelAnimationFrame};
}
