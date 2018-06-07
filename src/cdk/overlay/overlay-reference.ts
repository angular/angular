/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Portal} from '@angular/cdk/portal';
import {Direction, Directionality} from '@angular/cdk/bidi';

/**
 * Basic interface for an overlay. Used to avoid circular type references between
 * `OverlayRef`, `PositionStrategy` and `ScrollStrategy`, and `OverlayConfig`.
 * @docs-private
 */
export interface OverlayReference {
  attach: (portal: Portal<any>) => any;
  detach: () => any;
  dispose: () => void;
  overlayElement: HTMLElement;
  hostElement: HTMLElement;
  getConfig: () => any;
  hasAttached: () => boolean;
  updateSize: (config: any) => void;
  updatePosition: () => void;
  getDirection: () => Direction;
  setDirection: (dir: Direction | Directionality) => void;
}
