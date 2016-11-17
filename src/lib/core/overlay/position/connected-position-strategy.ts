import {PositionStrategy} from './position-strategy';
import {ElementRef} from '@angular/core';
import {ViewportRuler} from './viewport-ruler';
import {applyCssTransform} from '../../style/apply-transform';
import {
    ConnectionPositionPair,
    OriginConnectionPosition,
    OverlayConnectionPosition,
    ConnectedOverlayPositionChange
} from './connected-position';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';

/**
 * A strategy for positioning overlays. Using this strategy, an overlay is given an
 * implicit position relative some origin element. The relative position is defined in terms of
 * a point on the origin element that is connected to a point on the overlay element. For example,
 * a basic dropdown is connecting the bottom-left corner of the origin to the top-left corner
 * of the overlay.
 */
export class ConnectedPositionStrategy implements PositionStrategy {
  private _dir = 'ltr';

  /** The offset in pixels for the overlay connection point on the x-axis */
  private _offsetX: number = 0;

  /** The offset in pixels for the overlay connection point on the y-axis */
  private _offsetY: number = 0;

  /** Whether the we're dealing with an RTL context */
  get _isRtl() {
    return this._dir === 'rtl';
  }

  /** Ordered list of preferred positions, from most to least desirable. */
  _preferredPositions: ConnectionPositionPair[] = [];

  /** The origin element against which the overlay will be positioned. */
  private _origin: HTMLElement;

  private _onPositionChange:
      Subject<ConnectedOverlayPositionChange> = new Subject<ConnectedOverlayPositionChange>();

  /** Emits an event when the connection point changes. */
  get onPositionChange(): Observable<ConnectedOverlayPositionChange> {
    return this._onPositionChange.asObservable();
  }

  constructor(
      private _connectedTo: ElementRef,
      private _originPos: OriginConnectionPosition,
      private _overlayPos: OverlayConnectionPosition,
      private _viewportRuler: ViewportRuler) {
    this._origin = this._connectedTo.nativeElement;
    this.withFallbackPosition(_originPos, _overlayPos);
  }

  get positions() {
    return this._preferredPositions;
  }

  /**
   * Updates the position of the overlay element, using whichever preferred position relative
   * to the origin fits on-screen.
   * TODO: internal
   */
  apply(element: HTMLElement): Promise<void> {
    // We need the bounding rects for the origin and the overlay to determine how to position
    // the overlay relative to the origin.
    const originRect = this._origin.getBoundingClientRect();
    const overlayRect = element.getBoundingClientRect();

    // We use the viewport rect to determine whether a position would go off-screen.
    const viewportRect = this._viewportRuler.getViewportRect();
    let firstOverlayPoint: Point = null;

    // We want to place the overlay in the first of the preferred positions such that the
    // overlay fits on-screen.
    for (let pos of this._preferredPositions) {
      // Get the (x, y) point of connection on the origin, and then use that to get the
      // (top, left) coordinate for the overlay at `pos`.
      let originPoint = this._getOriginConnectionPoint(originRect, pos);
      let overlayPoint = this._getOverlayPoint(originPoint, overlayRect, pos);
      firstOverlayPoint = firstOverlayPoint || overlayPoint;

      // If the overlay in the calculated position fits on-screen, put it there and we're done.
      if (this._willOverlayFitWithinViewport(overlayPoint, overlayRect, viewportRect)) {
        this._setElementPosition(element, overlayPoint);
        this._onPositionChange.next(new ConnectedOverlayPositionChange(pos));
        return Promise.resolve(null);
      }
    }

    // TODO(jelbourn): fallback behavior for when none of the preferred positions fit on-screen.
    // For now, just stick it in the first position and let it go off-screen.
    this._setElementPosition(element, firstOverlayPoint);
    return Promise.resolve(null);
  }

  withFallbackPosition(
      originPos: OriginConnectionPosition,
      overlayPos: OverlayConnectionPosition): this {
    this._preferredPositions.push(new ConnectionPositionPair(originPos, overlayPos));
    return this;
  }

  /** Sets the layout direction so the overlay's position can be adjusted to match. */
  withDirection(dir: 'ltr' | 'rtl'): this {
    this._dir = dir;
    return this;
  }

  /** Sets an offset for the overlay's connection point on the x-axis */
  withOffsetX(offset: number): this {
    this._offsetX = offset;
    return this;
  }

  /** Sets an offset for the overlay's connection point on the y-axis */
  withOffsetY(offset: number): this {
    this._offsetY = offset;
    return this;
  }

  /**
   * Gets the horizontal (x) "start" dimension based on whether the overlay is in an RTL context.
   * @param rect
   */
  private _getStartX(rect: ClientRect): number {
    return this._isRtl ? rect.right : rect.left;
  }

  /**
   * Gets the horizontal (x) "end" dimension based on whether the overlay is in an RTL context.
   * @param rect
   */
  private _getEndX(rect: ClientRect): number {
    return this._isRtl ? rect.left : rect.right;
  }


  /**
   * Gets the (x, y) coordinate of a connection point on the origin based on a relative position.
   * @param originRect
   * @param pos
   */
  private _getOriginConnectionPoint(originRect: ClientRect, pos: ConnectionPositionPair): Point {
    const originStartX = this._getStartX(originRect);
    const originEndX = this._getEndX(originRect);

    let x: number;
    if (pos.originX == 'center') {
      x = originStartX + (originRect.width / 2);
    } else {
      x = pos.originX == 'start' ? originStartX : originEndX;
    }

    let y: number;
    if (pos.originY == 'center') {
      y = originRect.top + (originRect.height / 2);
    } else {
      y = pos.originY == 'top' ? originRect.top : originRect.bottom;
    }

    return {x, y};
  }


  /**
   * Gets the (x, y) coordinate of the top-left corner of the overlay given a given position and
   * origin point to which the overlay should be connected.
   * @param originPoint
   * @param overlayRect
   * @param pos
   */
  private _getOverlayPoint(
      originPoint: Point,
      overlayRect: ClientRect,
      pos: ConnectionPositionPair): Point {
    // Calculate the (overlayStartX, overlayStartY), the start of the potential overlay position
    // relative to the origin point.
    let overlayStartX: number;
    if (pos.overlayX == 'center') {
      overlayStartX = -overlayRect.width / 2;
    } else if (pos.overlayX === 'start') {
      overlayStartX = this._isRtl ? -overlayRect.width : 0;
    } else {
      overlayStartX = this._isRtl ? 0 : -overlayRect.width;
    }

    let overlayStartY: number;
    if (pos.overlayY == 'center') {
      overlayStartY = -overlayRect.height / 2;
    } else {
      overlayStartY = pos.overlayY == 'top' ? 0 : -overlayRect.height;
    }

    return {
      x: originPoint.x + overlayStartX + this._offsetX,
      y: originPoint.y + overlayStartY + this._offsetY
    };
  }


  /**
   * Gets whether the overlay positioned at the given point will fit on-screen.
   * @param overlayPoint The top-left coordinate of the overlay.
   * @param overlayRect Bounding rect of the overlay, used to get its size.
   * @param viewportRect The bounding viewport.
   */
  private _willOverlayFitWithinViewport(
      overlayPoint: Point,
      overlayRect: ClientRect,
      viewportRect: ClientRect): boolean {

    // TODO(jelbourn): probably also want some space between overlay edge and viewport edge.
    return overlayPoint.x >= viewportRect.left &&
        overlayPoint.x + overlayRect.width <= viewportRect.right &&
        overlayPoint.y >= viewportRect.top &&
        overlayPoint.y + overlayRect.height <= viewportRect.bottom;
  }


  /**
   * Physically positions the overlay element to the given coordinate.
   * @param element
   * @param overlayPoint
   */
  private _setElementPosition(element: HTMLElement, overlayPoint: Point) {
    // Round the values to prevent blurry overlays due to subpixel rendering.
    let x = Math.round(overlayPoint.x);
    let y = Math.round(overlayPoint.y);

    // TODO(jelbourn): we don't want to always overwrite the transform property here,
    // because it will need to be used for animations.
    applyCssTransform(element, `translateX(${x}px) translateY(${y}px)`);
  }
}


/** A simple (x, y) coordinate. */
type Point = {x: number, y: number};


