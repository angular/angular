import {PositionStrategy} from './position-strategy';
import {ElementRef} from '@angular/core';
import {ViewportRuler} from './viewport-ruler';
import {
  ConnectionPositionPair,
  OriginConnectionPosition,
  OverlayConnectionPosition,
  ConnectedOverlayPositionChange, ScrollableViewProperties
} from './connected-position';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {Scrollable} from '../scroll/scrollable';

/**
 * Container to hold the bounding positions of a particular element with respect to the viewport,
 * where top and bottom are the y-axis coordinates of the bounding rectangle and left and right are
 * the x-axis coordinates.
 */
type ElementBoundingPositions = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

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

  /** The Scrollable containers used to check scrollable view properties on position change. */
  private scrollables: Scrollable[] = [];

  /** Whether the we're dealing with an RTL context */
  get _isRtl() {
    return this._dir === 'rtl';
  }

  /** Ordered list of preferred positions, from most to least desirable. */
  _preferredPositions: ConnectionPositionPair[] = [];

  /** The origin element against which the overlay will be positioned. */
  private _origin: HTMLElement;

  /** The overlay pane element. */
  private _pane: HTMLElement;

  /** The last position to have been calculated as the best fit position. */
  private _lastConnectedPosition: ConnectionPositionPair;

  _onPositionChange:
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

  /** Ordered list of preferred positions, from most to least desirable. */
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
   *
   * @param element Element to which to apply the CSS styles.
   * @returns Resolves when the styles have been applied.
   */
  apply(element: HTMLElement): Promise<void> {
    // Cache the overlay pane element in case re-calculating position is necessary
    this._pane = element;

    // We need the bounding rects for the origin and the overlay to determine how to position
    // the overlay relative to the origin.
    const originRect = this._origin.getBoundingClientRect();
    const overlayRect = element.getBoundingClientRect();

    // We use the viewport rect to determine whether a position would go off-screen.
    const viewportRect = this._viewportRuler.getViewportRect();

    // Fallback point if none of the fallbacks fit into the viewport.
    let fallbackPoint: OverlayPoint = null;
    let fallbackPosition: ConnectionPositionPair = null;

    // We want to place the overlay in the first of the preferred positions such that the
    // overlay fits on-screen.
    for (let pos of this._preferredPositions) {
      // Get the (x, y) point of connection on the origin, and then use that to get the
      // (top, left) coordinate for the overlay at `pos`.
      let originPoint = this._getOriginConnectionPoint(originRect, pos);
      let overlayPoint = this._getOverlayPoint(originPoint, overlayRect, viewportRect, pos);

      // If the overlay in the calculated position fits on-screen, put it there and we're done.
      if (overlayPoint.fitsInViewport) {
        this._setElementPosition(element, overlayRect, overlayPoint, pos);

        // Save the last connected position in case the position needs to be re-calculated.
        this._lastConnectedPosition = pos;

        // Notify that the position has been changed along with its change properties.
        const scrollableViewProperties = this.getScrollableViewProperties(element);
        const positionChange = new ConnectedOverlayPositionChange(pos, scrollableViewProperties);
        this._onPositionChange.next(positionChange);

        return Promise.resolve(null);
      } else if (!fallbackPoint || fallbackPoint.visibleArea < overlayPoint.visibleArea) {
        fallbackPoint = overlayPoint;
        fallbackPosition = pos;
      }
    }

    // If none of the preferred positions were in the viewport, take the one
    // with the largest visible area.
    this._setElementPosition(element, overlayRect, fallbackPoint, fallbackPosition);

    return Promise.resolve(null);
  }

  /**
   * This re-aligns the overlay element with the trigger in its last calculated position,
   * even if a position higher in the "preferred positions" list would now fit. This
   * allows one to re-align the panel without changing the orientation of the panel.
   */
  recalculateLastPosition(): void {
    const originRect = this._origin.getBoundingClientRect();
    const overlayRect = this._pane.getBoundingClientRect();
    const viewportRect = this._viewportRuler.getViewportRect();
    const lastPosition = this._lastConnectedPosition || this._preferredPositions[0];

    let originPoint = this._getOriginConnectionPoint(originRect, lastPosition);
    let overlayPoint = this._getOverlayPoint(originPoint, overlayRect, viewportRect, lastPosition);
    this._setElementPosition(this._pane, overlayRect, overlayPoint, lastPosition);
  }

  /**
   * Sets the list of Scrollable containers that host the origin element so that
   * on reposition we can evaluate if it or the overlay has been clipped or outside view. Every
   * Scrollable must be an ancestor element of the strategy's origin element.
   */
  withScrollableContainers(scrollables: Scrollable[]) {
    this.scrollables = scrollables;
  }

  /**
   * Adds a new preferred fallback position.
   * @param originPos
   * @param overlayPos
   */
  withFallbackPosition(
      originPos: OriginConnectionPosition,
      overlayPos: OverlayConnectionPosition): this {
    this._preferredPositions.push(new ConnectionPositionPair(originPos, overlayPos));
    return this;
  }

  /**
   * Sets the layout direction so the overlay's position can be adjusted to match.
   * @param dir New layout direction.
   */
  withDirection(dir: 'ltr' | 'rtl'): this {
    this._dir = dir;
    return this;
  }

  /**
   * Sets an offset for the overlay's connection point on the x-axis
   * @param offset New offset in the X axis.
   */
  withOffsetX(offset: number): this {
    this._offsetX = offset;
    return this;
  }

  /**
   * Sets an offset for the overlay's connection point on the y-axis
   * @param  offset New offset in the Y axis.
   */
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
    let leftOverflow = 0 - x;
    let rightOverflow = (x + overlayRect.width) - viewportRect.width;
    let topOverflow = 0 - y;
    let bottomOverflow = (y + overlayRect.height) - viewportRect.height;

    // Visible parts of the element on each axis.
    let visibleWidth = this._subtractOverflows(overlayRect.width, leftOverflow, rightOverflow);
    let visibleHeight = this._subtractOverflows(overlayRect.height, topOverflow, bottomOverflow);

    // The area of the element that's within the viewport.
    let visibleArea = visibleWidth * visibleHeight;
    let fitsInViewport = (overlayRect.width * overlayRect.height) === visibleArea;

    return {x, y, fitsInViewport, visibleArea};
  }

  /**
   * Gets the view properties of the trigger and overlay, including whether they are clipped
   * or completely outside the view of any of the strategy's scrollables.
   */
  private getScrollableViewProperties(overlay: HTMLElement): ScrollableViewProperties {
    const originBounds = this._getElementBounds(this._origin);
    const overlayBounds = this._getElementBounds(overlay);
    const scrollContainerBounds = this.scrollables.map((scrollable: Scrollable) => {
      return this._getElementBounds(scrollable.getElementRef().nativeElement);
    });

    return {
      isOriginClipped: this.isElementClipped(originBounds, scrollContainerBounds),
      isOriginOutsideView: this.isElementOutsideView(originBounds, scrollContainerBounds),
      isOverlayClipped: this.isElementClipped(overlayBounds, scrollContainerBounds),
      isOverlayOutsideView: this.isElementOutsideView(overlayBounds, scrollContainerBounds),
    };
  }

  /** Whether the element is completely out of the view of any of the containers. */
  private isElementOutsideView(
      elementBounds: ElementBoundingPositions,
      containersBounds: ElementBoundingPositions[]): boolean {
    return containersBounds.some((containerBounds: ElementBoundingPositions) => {
      const outsideAbove = elementBounds.bottom < containerBounds.top;
      const outsideBelow = elementBounds.top > containerBounds.bottom;
      const outsideLeft = elementBounds.right < containerBounds.left;
      const outsideRight = elementBounds.left > containerBounds.right;

      return outsideAbove || outsideBelow || outsideLeft || outsideRight;
    });
  }

  /** Whether the element is clipped by any of the containers. */
  private isElementClipped(
      elementBounds: ElementBoundingPositions,
      containersBounds: ElementBoundingPositions[]): boolean {
    return containersBounds.some((containerBounds: ElementBoundingPositions) => {
      const clippedAbove = elementBounds.top < containerBounds.top;
      const clippedBelow = elementBounds.bottom > containerBounds.bottom;
      const clippedLeft = elementBounds.left < containerBounds.left;
      const clippedRight = elementBounds.right > containerBounds.right;

      return clippedAbove || clippedBelow || clippedLeft || clippedRight;
    });
  }

  /** Physically positions the overlay element to the given coordinate. */
  private _setElementPosition(
      element: HTMLElement,
      overlayRect: ClientRect,
      overlayPoint: Point,
      pos: ConnectionPositionPair) {

    // We want to set either `top` or `bottom` based on whether the overlay wants to appear above
    // or below the origin and the direction in which the element will expand.
    let verticalStyleProperty = pos.overlayY === 'bottom' ? 'bottom' : 'top';

    // When using `bottom`, we adjust the y position such that it is the distance
    // from the bottom of the viewport rather than the top.
    let y = verticalStyleProperty === 'top' ?
        overlayPoint.y :
        document.documentElement.clientHeight - (overlayPoint.y + overlayRect.height);

    // We want to set either `left` or `right` based on whether the overlay wants to appear "before"
    // or "after" the origin, which determines the direction in which the element will expand.
    // For the horizontal axis, the meaning of "before" and "after" change based on whether the
    // page is in RTL or LTR.
    let horizontalStyleProperty: string;
    if (this._dir === 'rtl') {
      horizontalStyleProperty = pos.overlayX === 'end' ? 'left' : 'right';
    } else {
      horizontalStyleProperty = pos.overlayX === 'end' ? 'right' : 'left';
    }

    // When we're setting `right`, we adjust the x position such that it is the distance
    // from the right edge of the viewport rather than the left edge.
    let x = horizontalStyleProperty === 'left' ?
      overlayPoint.x :
      document.documentElement.clientWidth - (overlayPoint.x + overlayRect.width);


    // Reset any existing styles. This is necessary in case the preferred position has
    // changed since the last `apply`.
    ['top', 'bottom', 'left', 'right'].forEach(p => element.style[p] = null);

    element.style[verticalStyleProperty] = `${y}px`;
    element.style[horizontalStyleProperty] = `${x}px`;
  }

  /** Returns the bounding positions of the provided element with respect to the viewport. */
  private _getElementBounds(element: HTMLElement): ElementBoundingPositions {
    const boundingClientRect = element.getBoundingClientRect();
    return {
      top: boundingClientRect.top,
      right: boundingClientRect.left + boundingClientRect.width,
      bottom: boundingClientRect.top + boundingClientRect.height,
      left: boundingClientRect.left
    };
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
}

/**
 * Expands the simple (x, y) coordinate by adding info about whether the
 * element would fit inside the viewport at that position, as well as
 * how much of the element would be visible.
 */
interface OverlayPoint extends Point {
  visibleArea?: number;
  fitsInViewport?: boolean;
}
