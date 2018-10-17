/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Direction} from '@angular/cdk/bidi';
import {CdkScrollable, ViewportRuler} from '@angular/cdk/scrolling';
import {ElementRef} from '@angular/core';
import {Observable} from 'rxjs';
import {
  ConnectedOverlayPositionChange,
  ConnectionPositionPair,
  OriginConnectionPosition,
  OverlayConnectionPosition,
} from './connected-position';
import {FlexibleConnectedPositionStrategy} from './flexible-connected-position-strategy';
import {PositionStrategy} from './position-strategy';
import {Platform} from '@angular/cdk/platform';
import {OverlayReference} from '../overlay-reference';

/**
 * A strategy for positioning overlays. Using this strategy, an overlay is given an
 * implicit position relative to some origin element. The relative position is defined in terms of
 * a point on the origin element that is connected to a point on the overlay element. For example,
 * a basic dropdown is connecting the bottom-left corner of the origin to the top-left corner
 * of the overlay.
 * @deprecated Use `FlexibleConnectedPositionStrategy` instead.
 * @breaking-change 8.0.0
 */
export class ConnectedPositionStrategy implements PositionStrategy {
  /**
   * Reference to the underlying position strategy to which all the API calls are proxied.
   * @docs-private
   */
  _positionStrategy: FlexibleConnectedPositionStrategy;

  /** The overlay to which this strategy is attached. */
  private _overlayRef: OverlayReference;

  private _direction: Direction | null;

  /** Whether the we're dealing with an RTL context */
  get _isRtl() {
    return this._overlayRef.getDirection() === 'rtl';
  }

  /** Ordered list of preferred positions, from most to least desirable. */
  _preferredPositions: ConnectionPositionPair[] = [];

  /** Emits an event when the connection point changes. */
  get onPositionChange(): Observable<ConnectedOverlayPositionChange> {
    return this._positionStrategy.positionChanges;
  }

  constructor(
      originPos: OriginConnectionPosition,
      overlayPos: OverlayConnectionPosition,
      connectedTo: ElementRef<HTMLElement>,
      viewportRuler: ViewportRuler,
      document: Document,
      // @breaking-change 8.0.0 `platform` parameter to be made required.
      platform?: Platform) {

    // Since the `ConnectedPositionStrategy` is deprecated and we don't want to maintain
    // the extra logic, we create an instance of the positioning strategy that has some
    // defaults that make it behave as the old position strategy and to which we'll
    // proxy all of the API calls.
    this._positionStrategy =
      new FlexibleConnectedPositionStrategy(connectedTo, viewportRuler, document, platform)
        .withFlexibleDimensions(false)
        .withPush(false)
        .withViewportMargin(0);

    this.withFallbackPosition(originPos, overlayPos);
  }

  /** Ordered list of preferred positions, from most to least desirable. */
  get positions(): ConnectionPositionPair[] {
    return this._preferredPositions;
  }

  /** Attach this position strategy to an overlay. */
  attach(overlayRef: OverlayReference): void {
    this._overlayRef = overlayRef;
    this._positionStrategy.attach(overlayRef);

    if (this._direction) {
      overlayRef.setDirection(this._direction);
      this._direction = null;
    }
  }

  /** Disposes all resources used by the position strategy. */
  dispose() {
    this._positionStrategy.dispose();
  }

  /** @docs-private */
  detach() {
    this._positionStrategy.detach();
  }

  /**
   * Updates the position of the overlay element, using whichever preferred position relative
   * to the origin fits on-screen.
   * @docs-private
   */
  apply(): void {
    this._positionStrategy.apply();
  }

  /**
   * Re-positions the overlay element with the trigger in its last calculated position,
   * even if a position higher in the "preferred positions" list would now fit. This
   * allows one to re-align the panel without changing the orientation of the panel.
   */
  recalculateLastPosition(): void {
    this._positionStrategy.reapplyLastPosition();
  }

  /**
   * Sets the list of Scrollable containers that host the origin element so that
   * on reposition we can evaluate if it or the overlay has been clipped or outside view. Every
   * Scrollable must be an ancestor element of the strategy's origin element.
   */
  withScrollableContainers(scrollables: CdkScrollable[]) {
    this._positionStrategy.withScrollableContainers(scrollables);
  }

  /**
   * Adds a new preferred fallback position.
   * @param originPos
   * @param overlayPos
   */
  withFallbackPosition(
      originPos: OriginConnectionPosition,
      overlayPos: OverlayConnectionPosition,
      offsetX?: number,
      offsetY?: number): this {

    const position = new ConnectionPositionPair(originPos, overlayPos, offsetX, offsetY);
    this._preferredPositions.push(position);
    this._positionStrategy.withPositions(this._preferredPositions);
    return this;
  }

  /**
   * Sets the layout direction so the overlay's position can be adjusted to match.
   * @param dir New layout direction.
   */
  withDirection(dir: 'ltr' | 'rtl'): this {
    // Since the direction might be declared before the strategy is attached,
    // we save the value in a temporary property and we'll transfer it to the
    // overlay ref on attachment.
    if (this._overlayRef) {
      this._overlayRef.setDirection(dir);
    } else {
      this._direction = dir;
    }

    return this;
  }

  /**
   * Sets an offset for the overlay's connection point on the x-axis
   * @param offset New offset in the X axis.
   */
  withOffsetX(offset: number): this {
    this._positionStrategy.withDefaultOffsetX(offset);
    return this;
  }

  /**
   * Sets an offset for the overlay's connection point on the y-axis
   * @param  offset New offset in the Y axis.
   */
  withOffsetY(offset: number): this {
    this._positionStrategy.withDefaultOffsetY(offset);
    return this;
  }

  /**
   * Sets whether the overlay's position should be locked in after it is positioned
   * initially. When an overlay is locked in, it won't attempt to reposition itself
   * when the position is re-applied (e.g. when the user scrolls away).
   * @param isLocked Whether the overlay should locked in.
   */
  withLockedPosition(isLocked: boolean): this {
    this._positionStrategy.withLockedPosition(isLocked);
    return this;
  }

  /**
   * Overwrites the current set of positions with an array of new ones.
   * @param positions Position pairs to be set on the strategy.
   */
  withPositions(positions: ConnectionPositionPair[]): this {
    this._preferredPositions = positions.slice();
    this._positionStrategy.withPositions(this._preferredPositions);
    return this;
  }

  /**
   * Sets the origin element, relative to which to position the overlay.
   * @param origin Reference to the new origin element.
   */
  setOrigin(origin: ElementRef): this {
    this._positionStrategy.setOrigin(origin);
    return this;
  }
}
