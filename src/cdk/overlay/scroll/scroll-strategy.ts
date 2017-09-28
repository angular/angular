/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {OverlayRef} from '../overlay-ref';

/**
 * Describes a strategy that will be used by an overlay
 * to handle scroll events while it is open.
 */
export interface ScrollStrategy {
  enable: () => void;
  disable: () => void;
  attach: (overlayRef: OverlayRef) => void;
}

/**
 * Returns an error to be thrown when attempting to attach an already-attached scroll strategy.
 */
export function getMatScrollStrategyAlreadyAttachedError(): Error {
  return Error(`Scroll strategy has already been attached.`);
}
