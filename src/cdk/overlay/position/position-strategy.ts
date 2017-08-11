/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Strategy for setting the position on an overlay. */
export interface PositionStrategy {

  /** Updates the position of the overlay element. */
  apply(element: Element): void;

  /** Cleans up any DOM modifications made by the position strategy, if necessary. */
  dispose(): void;
}
