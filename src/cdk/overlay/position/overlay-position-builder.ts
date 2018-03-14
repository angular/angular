/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementRef, Injectable, Inject} from '@angular/core';
import {ViewportRuler} from '@angular/cdk/scrolling';
import {ConnectedPositionStrategy} from './connected-position-strategy';
import {GlobalPositionStrategy} from './global-position-strategy';
import {OverlayConnectionPosition, OriginConnectionPosition} from './connected-position';
import {FlexibleConnectedPositionStrategy} from './flexible-connected-position-strategy';
import {DOCUMENT} from '@angular/common';


/** Builder for overlay position strategy. */
@Injectable()
export class OverlayPositionBuilder {
  constructor(
    private _viewportRuler: ViewportRuler,
    @Inject(DOCUMENT) private _document: any) { }

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

    return new ConnectedPositionStrategy(originPos, overlayPos, elementRef, this._viewportRuler,
        this._document);
  }

  /**
   * Creates a flexible position strategy.
   * @param elementRef
   */
  flexibleConnectedTo(elementRef: ElementRef): FlexibleConnectedPositionStrategy {
    return new FlexibleConnectedPositionStrategy(elementRef, this._viewportRuler, this._document);
  }

}
