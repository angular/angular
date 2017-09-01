/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementRef, Injectable} from '@angular/core';
import {ViewportRuler} from '@angular/cdk/scrolling';
import {ConnectedPositionStrategy} from './connected-position-strategy';
import {GlobalPositionStrategy} from './global-position-strategy';
import {OverlayConnectionPosition, OriginConnectionPosition} from './connected-position';



/** Builder for overlay position strategy. */
@Injectable()
export class OverlayPositionBuilder {
  constructor(private _viewportRuler: ViewportRuler) { }

  /**
   * Creates a global position strategy.
   */
  global(): GlobalPositionStrategy {
    return new GlobalPositionStrategy();
  }

  /**
   * Creates a relative position strategy.
   * @param elementRef
   * @param originPos
   * @param overlayPos
   */
  connectedTo(
      elementRef: ElementRef,
      originPos: OriginConnectionPosition,
      overlayPos: OverlayConnectionPosition): ConnectedPositionStrategy {
    return new ConnectedPositionStrategy(originPos, overlayPos, elementRef, this._viewportRuler);
  }
}
