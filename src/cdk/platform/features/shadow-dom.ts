/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

let shadowDomIsSupported: boolean;

/** Checks whether the user's browser support Shadow DOM. */
export function _supportsShadowDom(): boolean {
  if (shadowDomIsSupported == null) {
    const head = typeof document !== 'undefined' ? document.head : null;
    shadowDomIsSupported = !!(head && ((head as any).createShadowRoot || head.attachShadow));
  }

  return shadowDomIsSupported;
}
