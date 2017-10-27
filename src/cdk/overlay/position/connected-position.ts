/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Horizontal dimension of a connection point on the perimeter of the origin or overlay element. */
import {Optional} from '@angular/core';
export type HorizontalConnectionPos = 'start' | 'center' | 'end';

/** Vertical dimension of a connection point on the perimeter of the origin or overlay element. */
export type VerticalConnectionPos = 'top' | 'center' | 'bottom';


/** A connection point on the origin element. */
export interface OriginConnectionPosition {
  originX: HorizontalConnectionPos;
  originY: VerticalConnectionPos;
}

/** A connection point on the overlay element. */
export interface OverlayConnectionPosition {
  overlayX: HorizontalConnectionPos;
  overlayY: VerticalConnectionPos;
}

/** The points of the origin element and the overlay element to connect. */
export class ConnectionPositionPair {
  /** X-axis attachment point for connected overlay origin. Can be 'start', 'end', or 'center'. */
  originX: HorizontalConnectionPos;
  /** Y-axis attachment point for connected overlay origin. Can be 'top', 'bottom', or 'center'. */
  originY: VerticalConnectionPos;
  /** X-axis attachment point for connected overlay. Can be 'start', 'end', or 'center'. */
  overlayX: HorizontalConnectionPos;
  /** Y-axis attachment point for connected overlay. Can be 'top', 'bottom', or 'center'. */
  overlayY: VerticalConnectionPos;

  constructor(
    origin: OriginConnectionPosition,
    overlay: OverlayConnectionPosition,
    public offsetX?: number,
    public offsetY?: number) {

    this.originX = origin.originX;
    this.originY = origin.originY;
    this.overlayX = overlay.overlayX;
    this.overlayY = overlay.overlayY;
  }
}

/**
 * Set of properties regarding the position of the origin and overlay relative to the viewport
 * with respect to the containing Scrollable elements.
 *
 * The overlay and origin are clipped if any part of their bounding client rectangle exceeds the
 * bounds of any one of the strategy's Scrollable's bounding client rectangle.
 *
 * The overlay and origin are outside view if there is no overlap between their bounding client
 * rectangle and any one of the strategy's Scrollable's bounding client rectangle.
 *
 *       -----------                    -----------
 *       | outside |                    | clipped |
 *       |  view   |              --------------------------
 *       |         |              |     |         |        |
 *       ----------               |     -----------        |
 *  --------------------------    |                        |
 *  |                        |    |      Scrollable        |
 *  |                        |    |                        |
 *  |                        |     --------------------------
 *  |      Scrollable        |
 *  |                        |
 *  --------------------------
 *
 *  @docs-private
 */
export class ScrollingVisibility {
  isOriginClipped: boolean;
  isOriginOutsideView: boolean;
  isOverlayClipped: boolean;
  isOverlayOutsideView: boolean;
}

/** The change event emitted by the strategy when a fallback position is used. */
export class ConnectedOverlayPositionChange {
  constructor(
      /** The position used as a result of this change. */
      public connectionPair: ConnectionPositionPair,
      /** @docs-private */
      @Optional() public scrollableViewProperties: ScrollingVisibility) {}
}
