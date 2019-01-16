/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ViewportRuler} from '@angular/cdk/scrolling';
import {DOCUMENT} from '@angular/common';
import {ElementRef, Inject, Injectable, Optional} from '@angular/core';
import {OriginConnectionPosition, OverlayConnectionPosition} from './connected-position';
import {ConnectedPositionStrategy} from './connected-position-strategy';
import {
  FlexibleConnectedPositionStrategy,
  FlexibleConnectedPositionStrategyOrigin,
} from './flexible-connected-position-strategy';
import {GlobalPositionStrategy} from './global-position-strategy';
import {Platform} from '@angular/cdk/platform';
import {OverlayContainer} from '../overlay-container';


/** Builder for overlay position strategy. */
@Injectable({providedIn: 'root'})
export class OverlayPositionBuilder {
  constructor(
    private _viewportRuler: ViewportRuler,
    @Inject(DOCUMENT) private _document: any,
    // @breaking-change 8.0.0 `_platform` and `_overlayContainer` parameters to be made required.
    @Optional() private _platform?: Platform,
    @Optional() private _overlayContainer?: OverlayContainer) { }

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
   * @deprecated Use `flexibleConnectedTo` instead.
   * @breaking-change 8.0.0
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
   * @param origin Origin relative to which to position the overlay.
   */
  flexibleConnectedTo(origin: FlexibleConnectedPositionStrategyOrigin):
    FlexibleConnectedPositionStrategy {
    return new FlexibleConnectedPositionStrategy(origin, this._viewportRuler, this._document,
        this._platform, this._overlayContainer);
  }

}
