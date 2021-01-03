/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {global} from './global';

export function getNativeRequestAnimationFrame() {
  let nativeRequestAnimationFrame: (callback: FrameRequestCallback) => number =
      global['requestAnimationFrame'];
  let nativeCancelAnimationFrame: (handle: number) => void = global['cancelAnimationFrame'];
  if (typeof Zone !== 'undefined' && nativeRequestAnimationFrame && nativeCancelAnimationFrame) {
    // use unpatched version of requestAnimationFrame(native delegate) if possible
    // to avoid another Change detection
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
