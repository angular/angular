import {PositionStrategy} from './position-strategy';
import {ElementRef} from '@angular/core';
import {ViewportRuler} from './viewport-ruler';
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
   * To be used to for any cleanup after the element gets destroyed.
   */
  dispose() { }

  /**
   * Updates the position of the overlay element, using whichever preferred position relative
   * to the origin fits on-screen.
   * @docs-private
   */
  apply(element: HTMLElement): Promise<void> {
    // We need the bounding rects for the origin and the overlay to determine how to position
    // the overlay relative to the origin.
    const originRect = this._origin.getBoundingClientRect();
    const overlayRect = element.getBoundingClientRect();

    // We use the viewport rect to determine whether a position would go off-screen.
    const viewportRect = this._viewportRuler.getViewportRect();

    // Fallback point if none of the fallbacks fit into the viewport.
    let fallbackPoint: OverlayPoint = null;

    // We want to place the overlay in the first of the preferred positions such that the
    // overlay fits on-screen.
    for (let pos of this._preferredPositions) {
      // Get the (x, y) point of connection on the origin, and then use that to get the
      // (top, left) coordinate for the overlay at `pos`.
      let originPoint = this._getOriginConnectionPoint(originRect, pos);
      let overlayPoint = this._getOverlayPoint(originPoint, overlayRect, viewportRect, pos);

      // If the overlay in the calculated position fits on-screen, put it there and we're done.
      if (overlayPoint.fitsInViewport) {
        this._setElementPosition(element, overlayPoint);
        this._onPositionChange.next(new ConnectedOverlayPositionChange(pos));
        return Promise.resolve(null);
      } else if (!fallbackPoint || fallbackPoint.visibleArea < overlayPoint.visibleArea) {
        fallbackPoint = overlayPoint;
      }
    }

    // If none of the preferred positions were in the viewport, take the one
    // with the largest visible area.
    this._setElementPosition(element, fallbackPoint);

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
   * origin point to which the overlay should be connected, as well as how much of the element
   * would be inside the viewport at that position.
   */
  private _getOverlayPoint(
      originPoint: Point,
      overlayRect: ClientRect,
      viewportRect: ClientRect,
      pos: ConnectionPositionPair): OverlayPoint {
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

    // The (x, y) coordinates of the overlay.
    let x = originPoint.x + overlayStartX + this._offsetX;
    let y = originPoint.y + overlayStartY + this._offsetY;

    // How much the overlay would overflow at this position, on each side.
    let leftOverflow = viewportRect.left - x;
    let rightOverflow = (x + overlayRect.width) - viewportRect.right;
    let topOverflow = viewportRect.top - y;
    let bottomOverflow = (y + overlayRect.height) - viewportRect.bottom;

    // Visible parts of the element on each axis.
    let visibleWidth = this._subtractOverflows(overlayRect.width, leftOverflow, rightOverflow);
    let visibleHeight = this._subtractOverflows(overlayRect.height, topOverflow, bottomOverflow);

    // The area of the element that's within the viewport.
    let visibleArea = visibleWidth * visibleHeight;
    let fitsInViewport = (overlayRect.width * overlayRect.height) === visibleArea;

    return {x, y, fitsInViewport, visibleArea};
  }

  /**
   * Physically positions the overlay element to the given coordinate.
   * @param element
   * @param overlayPoint
   */
  private _setElementPosition(element: HTMLElement, overlayPoint: Point) {
    element.style.left = overlayPoint.x + 'px';
    element.style.top = overlayPoint.y + 'px';
  }

  /**
   * Subtracts the amount that an element is overflowing on an axis from it's length.
   */
  private _subtractOverflows(length: number, ...overflows: number[]): number {
    return overflows.reduce((currentValue: number, currentOverflow: number) => {
      return currentValue - Math.max(currentOverflow, 0);
    }, length);
  }
}

/** A simple (x, y) coordinate. */
interface Point {
  x: number;
  y: number;
};

/**
 * Expands the simple (x, y) coordinate by adding info about whether the
 * element would fit inside the viewport at that position, as well as
 * how much of the element would be visible.
 */
interface OverlayPoint extends Point {
  visibleArea?: number;
  fitsInViewport?: boolean;
}
