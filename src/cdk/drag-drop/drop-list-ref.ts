/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementRef, NgZone} from '@angular/core';
import {Direction} from '@angular/cdk/bidi';
import {coerceElement} from '@angular/cdk/coercion';
import {ViewportRuler} from '@angular/cdk/scrolling';
import {_getShadowRoot} from '@angular/cdk/platform';
import {Subject, Subscription, interval, animationFrameScheduler} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {DragDropRegistry} from './drag-drop-registry';
import {DragRefInternal as DragRef, Point} from './drag-ref';
import {isPointerNearClientRect, isInsideClientRect} from './dom/client-rect';
import {ParentPositionTracker} from './dom/parent-position-tracker';
import {DragCSSStyleDeclaration} from './dom/styling';
import {DropListSortStrategy} from './sorting/drop-list-sort-strategy';
import {SingleAxisSortStrategy} from './sorting/single-axis-sort-strategy';

/**
 * Proximity, as a ratio to width/height, at which a
 * dragged item will affect the drop container.
 */
const DROP_PROXIMITY_THRESHOLD = 0.05;

/**
 * Proximity, as a ratio to width/height at which to start auto-scrolling the drop list or the
 * viewport. The value comes from trying it out manually until it feels right.
 */
const SCROLL_PROXIMITY_THRESHOLD = 0.05;

/** Vertical direction in which we can auto-scroll. */
const enum AutoScrollVerticalDirection {
  NONE,
  UP,
  DOWN,
}

/** Horizontal direction in which we can auto-scroll. */
const enum AutoScrollHorizontalDirection {
  NONE,
  LEFT,
  RIGHT,
}

/**
 * Internal compile-time-only representation of a `DropListRef`.
 * Used to avoid circular import issues between the `DropListRef` and the `DragRef`.
 * @docs-private
 */
export interface DropListRefInternal extends DropListRef {}

type RootNode = DocumentOrShadowRoot & {
  // As of TS 4.4 the built in DOM typings don't include `elementFromPoint` on `ShadowRoot`,
  // even though it exists (see https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot).
  // This type is a utility to avoid having to add casts everywhere.
  elementFromPoint(x: number, y: number): Element | null;
};

/**
 * Reference to a drop list. Used to manipulate or dispose of the container.
 */
export class DropListRef<T = any> {
  /** Element that the drop list is attached to. */
  element: HTMLElement | ElementRef<HTMLElement>;

  /** Whether starting a dragging sequence from this container is disabled. */
  disabled: boolean = false;

  /** Whether sorting items within the list is disabled. */
  sortingDisabled: boolean = false;

  /** Locks the position of the draggable elements inside the container along the specified axis. */
  lockAxis: 'x' | 'y';

  /**
   * Whether auto-scrolling the view when the user
   * moves their pointer close to the edges is disabled.
   */
  autoScrollDisabled: boolean = false;

  /** Number of pixels to scroll for each frame when auto-scrolling an element. */
  autoScrollStep: number = 2;

  /**
   * Function that is used to determine whether an item
   * is allowed to be moved into a drop container.
   */
  enterPredicate: (drag: DragRef, drop: DropListRef) => boolean = () => true;

  /** Function that is used to determine whether an item can be sorted into a particular index. */
  sortPredicate: (index: number, drag: DragRef, drop: DropListRef) => boolean = () => true;

  /** Emits right before dragging has started. */
  readonly beforeStarted = new Subject<void>();

  /**
   * Emits when the user has moved a new drag item into this container.
   */
  readonly entered = new Subject<{item: DragRef; container: DropListRef; currentIndex: number}>();

  /**
   * Emits when the user removes an item from the container
   * by dragging it into another container.
   */
  readonly exited = new Subject<{item: DragRef; container: DropListRef}>();

  /** Emits when the user drops an item inside the container. */
  readonly dropped = new Subject<{
    item: DragRef;
    currentIndex: number;
    previousIndex: number;
    container: DropListRef;
    previousContainer: DropListRef;
    isPointerOverContainer: boolean;
    distance: Point;
    dropPoint: Point;
    event: MouseEvent | TouchEvent;
  }>();

  /** Emits as the user is swapping items while actively dragging. */
  readonly sorted = new Subject<{
    previousIndex: number;
    currentIndex: number;
    container: DropListRef;
    item: DragRef;
  }>();

  /** Arbitrary data that can be attached to the drop list. */
  data: T;

  /** Whether an item in the list is being dragged. */
  private _isDragging = false;

  /** Keeps track of the positions of any parent scrollable elements. */
  private _parentPositions: ParentPositionTracker;

  /** Strategy being used to sort items within the list. */
  private _sortStrategy: DropListSortStrategy<DragRef>;

  /** Cached `ClientRect` of the drop list. */
  private _clientRect: ClientRect | undefined;

  /** Draggable items in the container. */
  private _draggables: readonly DragRef[] = [];

  /** Drop lists that are connected to the current one. */
  private _siblings: readonly DropListRef[] = [];

  /** Connected siblings that currently have a dragged item. */
  private _activeSiblings = new Set<DropListRef>();

  /** Subscription to the window being scrolled. */
  private _viewportScrollSubscription = Subscription.EMPTY;

  /** Vertical direction in which the list is currently scrolling. */
  private _verticalScrollDirection = AutoScrollVerticalDirection.NONE;

  /** Horizontal direction in which the list is currently scrolling. */
  private _horizontalScrollDirection = AutoScrollHorizontalDirection.NONE;

  /** Node that is being auto-scrolled. */
  private _scrollNode: HTMLElement | Window;

  /** Used to signal to the current auto-scroll sequence when to stop. */
  private readonly _stopScrollTimers = new Subject<void>();

  /** Shadow root of the current element. Necessary for `elementFromPoint` to resolve correctly. */
  private _cachedShadowRoot: RootNode | null = null;

  /** Reference to the document. */
  private _document: Document;

  /** Elements that can be scrolled while the user is dragging. */
  private _scrollableElements: HTMLElement[];

  /** Initial value for the element's `scroll-snap-type` style. */
  private _initialScrollSnap: string;

  constructor(
    element: ElementRef<HTMLElement> | HTMLElement,
    private _dragDropRegistry: DragDropRegistry<DragRef, DropListRef>,
    _document: any,
    private _ngZone: NgZone,
    private _viewportRuler: ViewportRuler,
  ) {
    this.element = coerceElement(element);
    this._document = _document;
    this.withScrollableParents([this.element]);
    _dragDropRegistry.registerDropContainer(this);
    this._parentPositions = new ParentPositionTracker(_document);
    this._sortStrategy = new SingleAxisSortStrategy(this.element, _dragDropRegistry);
    this._sortStrategy.withSortPredicate((index, item) => this.sortPredicate(index, item, this));
  }

  /** Removes the drop list functionality from the DOM element. */
  dispose() {
    this._stopScrolling();
    this._stopScrollTimers.complete();
    this._viewportScrollSubscription.unsubscribe();
    this.beforeStarted.complete();
    this.entered.complete();
    this.exited.complete();
    this.dropped.complete();
    this.sorted.complete();
    this._activeSiblings.clear();
    this._scrollNode = null!;
    this._parentPositions.clear();
    this._dragDropRegistry.removeDropContainer(this);
  }

  /** Whether an item from this list is currently being dragged. */
  isDragging() {
    return this._isDragging;
  }

  /** Starts dragging an item. */
  start(): void {
    this._draggingStarted();
    this._notifyReceivingSiblings();
  }

  /**
   * Attempts to move an item into the container.
   * @param item Item that was moved into the container.
   * @param pointerX Position of the item along the X axis.
   * @param pointerY Position of the item along the Y axis.
   * @param index Index at which the item entered. If omitted, the container will try to figure it
   *   out automatically.
   */
  enter(item: DragRef, pointerX: number, pointerY: number, index?: number): void {
    this._draggingStarted();

    // If sorting is disabled, we want the item to return to its starting
    // position if the user is returning it to its initial container.
    if (index == null && this.sortingDisabled) {
      index = this._draggables.indexOf(item);
    }

    this._sortStrategy.enter(item, pointerX, pointerY, index);

    // Note that this usually happens inside `_draggingStarted` as well, but the dimensions
    // can change when the sort strategy moves the item around inside `enter`.
    this._cacheParentPositions();

    // Notify siblings at the end so that the item has been inserted into the `activeDraggables`.
    this._notifyReceivingSiblings();
    this.entered.next({item, container: this, currentIndex: this.getItemIndex(item)});
  }

  /**
   * Removes an item from the container after it was dragged into another container by the user.
   * @param item Item that was dragged out.
   */
  exit(item: DragRef): void {
    this._reset();
    this.exited.next({item, container: this});
  }

  /**
   * Drops an item into this container.
   * @param item Item being dropped into the container.
   * @param currentIndex Index at which the item should be inserted.
   * @param previousIndex Index of the item when dragging started.
   * @param previousContainer Container from which the item got dragged in.
   * @param isPointerOverContainer Whether the user's pointer was over the
   *    container when the item was dropped.
   * @param distance Distance the user has dragged since the start of the dragging sequence.
   * @param event Event that triggered the dropping sequence.
   *
   * @breaking-change 15.0.0 `previousIndex` and `event` parameters to become required.
   */
  drop(
    item: DragRef,
    currentIndex: number,
    previousIndex: number,
    previousContainer: DropListRef,
    isPointerOverContainer: boolean,
    distance: Point,
    dropPoint: Point,
    event: MouseEvent | TouchEvent = {} as any,
  ): void {
    this._reset();
    this.dropped.next({
      item,
      currentIndex,
      previousIndex,
      container: this,
      previousContainer,
      isPointerOverContainer,
      distance,
      dropPoint,
      event,
    });
  }

  /**
   * Sets the draggable items that are a part of this list.
   * @param items Items that are a part of this list.
   */
  withItems(items: DragRef[]): this {
    const previousItems = this._draggables;
    this._draggables = items;
    items.forEach(item => item._withDropContainer(this));

    if (this.isDragging()) {
      const draggedItems = previousItems.filter(item => item.isDragging());

      // If all of the items being dragged were removed
      // from the list, abort the current drag sequence.
      if (draggedItems.every(item => items.indexOf(item) === -1)) {
        this._reset();
      } else {
        this._sortStrategy.withItems(this._draggables);
      }
    }

    return this;
  }

  /** Sets the layout direction of the drop list. */
  withDirection(direction: Direction): this {
    this._sortStrategy.direction = direction;
    return this;
  }

  /**
   * Sets the containers that are connected to this one. When two or more containers are
   * connected, the user will be allowed to transfer items between them.
   * @param connectedTo Other containers that the current containers should be connected to.
   */
  connectedTo(connectedTo: DropListRef[]): this {
    this._siblings = connectedTo.slice();
    return this;
  }

  /**
   * Sets the orientation of the container.
   * @param orientation New orientation for the container.
   */
  withOrientation(orientation: 'vertical' | 'horizontal'): this {
    // TODO(crisbeto): eventually we should be constructing the new sort strategy here based on
    // the new orientation. For now we can assume that it'll always be `SingleAxisSortStrategy`.
    (this._sortStrategy as SingleAxisSortStrategy<DragRef>).orientation = orientation;
    return this;
  }

  /**
   * Sets which parent elements are can be scrolled while the user is dragging.
   * @param elements Elements that can be scrolled.
   */
  withScrollableParents(elements: HTMLElement[]): this {
    const element = coerceElement(this.element);

    // We always allow the current element to be scrollable
    // so we need to ensure that it's in the array.
    this._scrollableElements =
      elements.indexOf(element) === -1 ? [element, ...elements] : elements.slice();
    return this;
  }

  /** Gets the scrollable parents that are registered with this drop container. */
  getScrollableParents(): readonly HTMLElement[] {
    return this._scrollableElements;
  }

  /**
   * Figures out the index of an item in the container.
   * @param item Item whose index should be determined.
   */
  getItemIndex(item: DragRef): number {
    return this._isDragging
      ? this._sortStrategy.getItemIndex(item)
      : this._draggables.indexOf(item);
  }

  /**
   * Whether the list is able to receive the item that
   * is currently being dragged inside a connected drop list.
   */
  isReceiving(): boolean {
    return this._activeSiblings.size > 0;
  }

  /**
   * Sorts an item inside the container based on its position.
   * @param item Item to be sorted.
   * @param pointerX Position of the item along the X axis.
   * @param pointerY Position of the item along the Y axis.
   * @param pointerDelta Direction in which the pointer is moving along each axis.
   */
  _sortItem(
    item: DragRef,
    pointerX: number,
    pointerY: number,
    pointerDelta: {x: number; y: number},
  ): void {
    // Don't sort the item if sorting is disabled or it's out of range.
    if (
      this.sortingDisabled ||
      !this._clientRect ||
      !isPointerNearClientRect(this._clientRect, DROP_PROXIMITY_THRESHOLD, pointerX, pointerY)
    ) {
      return;
    }

    const result = this._sortStrategy.sort(item, pointerX, pointerY, pointerDelta);

    if (result) {
      this.sorted.next({
        previousIndex: result.previousIndex,
        currentIndex: result.currentIndex,
        container: this,
        item,
      });
    }
  }

  /**
   * Checks whether the user's pointer is close to the edges of either the
   * viewport or the drop list and starts the auto-scroll sequence.
   * @param pointerX User's pointer position along the x axis.
   * @param pointerY User's pointer position along the y axis.
   */
  _startScrollingIfNecessary(pointerX: number, pointerY: number) {
    if (this.autoScrollDisabled) {
      return;
    }

    let scrollNode: HTMLElement | Window | undefined;
    let verticalScrollDirection = AutoScrollVerticalDirection.NONE;
    let horizontalScrollDirection = AutoScrollHorizontalDirection.NONE;

    // Check whether we should start scrolling any of the parent containers.
    this._parentPositions.positions.forEach((position, element) => {
      // We have special handling for the `document` below. Also this would be
      // nicer with a  for...of loop, but it requires changing a compiler flag.
      if (element === this._document || !position.clientRect || scrollNode) {
        return;
      }

      if (
        isPointerNearClientRect(position.clientRect, DROP_PROXIMITY_THRESHOLD, pointerX, pointerY)
      ) {
        [verticalScrollDirection, horizontalScrollDirection] = getElementScrollDirections(
          element as HTMLElement,
          position.clientRect,
          pointerX,
          pointerY,
        );

        if (verticalScrollDirection || horizontalScrollDirection) {
          scrollNode = element as HTMLElement;
        }
      }
    });

    // Otherwise check if we can start scrolling the viewport.
    if (!verticalScrollDirection && !horizontalScrollDirection) {
      const {width, height} = this._viewportRuler.getViewportSize();
      const clientRect = {
        width,
        height,
        top: 0,
        right: width,
        bottom: height,
        left: 0,
      } as ClientRect;
      verticalScrollDirection = getVerticalScrollDirection(clientRect, pointerY);
      horizontalScrollDirection = getHorizontalScrollDirection(clientRect, pointerX);
      scrollNode = window;
    }

    if (
      scrollNode &&
      (verticalScrollDirection !== this._verticalScrollDirection ||
        horizontalScrollDirection !== this._horizontalScrollDirection ||
        scrollNode !== this._scrollNode)
    ) {
      this._verticalScrollDirection = verticalScrollDirection;
      this._horizontalScrollDirection = horizontalScrollDirection;
      this._scrollNode = scrollNode;

      if ((verticalScrollDirection || horizontalScrollDirection) && scrollNode) {
        this._ngZone.runOutsideAngular(this._startScrollInterval);
      } else {
        this._stopScrolling();
      }
    }
  }

  /** Stops any currently-running auto-scroll sequences. */
  _stopScrolling() {
    this._stopScrollTimers.next();
  }

  /** Starts the dragging sequence within the list. */
  private _draggingStarted() {
    const styles = coerceElement(this.element).style as DragCSSStyleDeclaration;
    this.beforeStarted.next();
    this._isDragging = true;

    // We need to disable scroll snapping while the user is dragging, because it breaks automatic
    // scrolling. The browser seems to round the value based on the snapping points which means
    // that we can't increment/decrement the scroll position.
    this._initialScrollSnap = styles.msScrollSnapType || styles.scrollSnapType || '';
    styles.scrollSnapType = styles.msScrollSnapType = 'none';
    this._sortStrategy.start(this._draggables);
    this._cacheParentPositions();
    this._viewportScrollSubscription.unsubscribe();
    this._listenToScrollEvents();
  }

  /** Caches the positions of the configured scrollable parents. */
  private _cacheParentPositions() {
    const element = coerceElement(this.element);
    this._parentPositions.cache(this._scrollableElements);

    // The list element is always in the `scrollableElements`
    // so we can take advantage of the cached `ClientRect`.
    this._clientRect = this._parentPositions.positions.get(element)!.clientRect!;
  }

  /** Resets the container to its initial state. */
  private _reset() {
    this._isDragging = false;

    const styles = coerceElement(this.element).style as DragCSSStyleDeclaration;
    styles.scrollSnapType = styles.msScrollSnapType = this._initialScrollSnap;

    this._siblings.forEach(sibling => sibling._stopReceiving(this));
    this._sortStrategy.reset();
    this._stopScrolling();
    this._viewportScrollSubscription.unsubscribe();
    this._parentPositions.clear();
  }

  /** Starts the interval that'll auto-scroll the element. */
  private _startScrollInterval = () => {
    this._stopScrolling();

    interval(0, animationFrameScheduler)
      .pipe(takeUntil(this._stopScrollTimers))
      .subscribe(() => {
        const node = this._scrollNode;
        const scrollStep = this.autoScrollStep;

        if (this._verticalScrollDirection === AutoScrollVerticalDirection.UP) {
          node.scrollBy(0, -scrollStep);
        } else if (this._verticalScrollDirection === AutoScrollVerticalDirection.DOWN) {
          node.scrollBy(0, scrollStep);
        }

        if (this._horizontalScrollDirection === AutoScrollHorizontalDirection.LEFT) {
          node.scrollBy(-scrollStep, 0);
        } else if (this._horizontalScrollDirection === AutoScrollHorizontalDirection.RIGHT) {
          node.scrollBy(scrollStep, 0);
        }
      });
  };

  /**
   * Checks whether the user's pointer is positioned over the container.
   * @param x Pointer position along the X axis.
   * @param y Pointer position along the Y axis.
   */
  _isOverContainer(x: number, y: number): boolean {
    return this._clientRect != null && isInsideClientRect(this._clientRect, x, y);
  }

  /**
   * Figures out whether an item should be moved into a sibling
   * drop container, based on its current position.
   * @param item Drag item that is being moved.
   * @param x Position of the item along the X axis.
   * @param y Position of the item along the Y axis.
   */
  _getSiblingContainerFromPosition(item: DragRef, x: number, y: number): DropListRef | undefined {
    return this._siblings.find(sibling => sibling._canReceive(item, x, y));
  }

  /**
   * Checks whether the drop list can receive the passed-in item.
   * @param item Item that is being dragged into the list.
   * @param x Position of the item along the X axis.
   * @param y Position of the item along the Y axis.
   */
  _canReceive(item: DragRef, x: number, y: number): boolean {
    if (
      !this._clientRect ||
      !isInsideClientRect(this._clientRect, x, y) ||
      !this.enterPredicate(item, this)
    ) {
      return false;
    }

    const elementFromPoint = this._getShadowRoot().elementFromPoint(x, y) as HTMLElement | null;

    // If there's no element at the pointer position, then
    // the client rect is probably scrolled out of the view.
    if (!elementFromPoint) {
      return false;
    }

    const nativeElement = coerceElement(this.element);

    // The `ClientRect`, that we're using to find the container over which the user is
    // hovering, doesn't give us any information on whether the element has been scrolled
    // out of the view or whether it's overlapping with other containers. This means that
    // we could end up transferring the item into a container that's invisible or is positioned
    // below another one. We use the result from `elementFromPoint` to get the top-most element
    // at the pointer position and to find whether it's one of the intersecting drop containers.
    return elementFromPoint === nativeElement || nativeElement.contains(elementFromPoint);
  }

  /**
   * Called by one of the connected drop lists when a dragging sequence has started.
   * @param sibling Sibling in which dragging has started.
   */
  _startReceiving(sibling: DropListRef, items: DragRef[]) {
    const activeSiblings = this._activeSiblings;

    if (
      !activeSiblings.has(sibling) &&
      items.every(item => {
        // Note that we have to add an exception to the `enterPredicate` for items that started off
        // in this drop list. The drag ref has logic that allows an item to return to its initial
        // container, if it has left the initial container and none of the connected containers
        // allow it to enter. See `DragRef._updateActiveDropContainer` for more context.
        return this.enterPredicate(item, this) || this._draggables.indexOf(item) > -1;
      })
    ) {
      activeSiblings.add(sibling);
      this._cacheParentPositions();
      this._listenToScrollEvents();
    }
  }

  /**
   * Called by a connected drop list when dragging has stopped.
   * @param sibling Sibling whose dragging has stopped.
   */
  _stopReceiving(sibling: DropListRef) {
    this._activeSiblings.delete(sibling);
    this._viewportScrollSubscription.unsubscribe();
  }

  /**
   * Starts listening to scroll events on the viewport.
   * Used for updating the internal state of the list.
   */
  private _listenToScrollEvents() {
    this._viewportScrollSubscription = this._dragDropRegistry
      .scrolled(this._getShadowRoot())
      .subscribe(event => {
        if (this.isDragging()) {
          const scrollDifference = this._parentPositions.handleScroll(event);

          if (scrollDifference) {
            this._sortStrategy.updateOnScroll(scrollDifference.top, scrollDifference.left);
          }
        } else if (this.isReceiving()) {
          this._cacheParentPositions();
        }
      });
  }

  /**
   * Lazily resolves and returns the shadow root of the element. We do this in a function, rather
   * than saving it in property directly on init, because we want to resolve it as late as possible
   * in order to ensure that the element has been moved into the shadow DOM. Doing it inside the
   * constructor might be too early if the element is inside of something like `ngFor` or `ngIf`.
   */
  private _getShadowRoot(): RootNode {
    if (!this._cachedShadowRoot) {
      const shadowRoot = _getShadowRoot(coerceElement(this.element));
      this._cachedShadowRoot = (shadowRoot || this._document) as RootNode;
    }

    return this._cachedShadowRoot;
  }

  /** Notifies any siblings that may potentially receive the item. */
  private _notifyReceivingSiblings() {
    const draggedItems = this._sortStrategy
      .getActiveItemsSnapshot()
      .filter(item => item.isDragging());
    this._siblings.forEach(sibling => sibling._startReceiving(this, draggedItems));
  }
}

/**
 * Gets whether the vertical auto-scroll direction of a node.
 * @param clientRect Dimensions of the node.
 * @param pointerY Position of the user's pointer along the y axis.
 */
function getVerticalScrollDirection(clientRect: ClientRect, pointerY: number) {
  const {top, bottom, height} = clientRect;
  const yThreshold = height * SCROLL_PROXIMITY_THRESHOLD;

  if (pointerY >= top - yThreshold && pointerY <= top + yThreshold) {
    return AutoScrollVerticalDirection.UP;
  } else if (pointerY >= bottom - yThreshold && pointerY <= bottom + yThreshold) {
    return AutoScrollVerticalDirection.DOWN;
  }

  return AutoScrollVerticalDirection.NONE;
}

/**
 * Gets whether the horizontal auto-scroll direction of a node.
 * @param clientRect Dimensions of the node.
 * @param pointerX Position of the user's pointer along the x axis.
 */
function getHorizontalScrollDirection(clientRect: ClientRect, pointerX: number) {
  const {left, right, width} = clientRect;
  const xThreshold = width * SCROLL_PROXIMITY_THRESHOLD;

  if (pointerX >= left - xThreshold && pointerX <= left + xThreshold) {
    return AutoScrollHorizontalDirection.LEFT;
  } else if (pointerX >= right - xThreshold && pointerX <= right + xThreshold) {
    return AutoScrollHorizontalDirection.RIGHT;
  }

  return AutoScrollHorizontalDirection.NONE;
}

/**
 * Gets the directions in which an element node should be scrolled,
 * assuming that the user's pointer is already within it scrollable region.
 * @param element Element for which we should calculate the scroll direction.
 * @param clientRect Bounding client rectangle of the element.
 * @param pointerX Position of the user's pointer along the x axis.
 * @param pointerY Position of the user's pointer along the y axis.
 */
function getElementScrollDirections(
  element: HTMLElement,
  clientRect: ClientRect,
  pointerX: number,
  pointerY: number,
): [AutoScrollVerticalDirection, AutoScrollHorizontalDirection] {
  const computedVertical = getVerticalScrollDirection(clientRect, pointerY);
  const computedHorizontal = getHorizontalScrollDirection(clientRect, pointerX);
  let verticalScrollDirection = AutoScrollVerticalDirection.NONE;
  let horizontalScrollDirection = AutoScrollHorizontalDirection.NONE;

  // Note that we here we do some extra checks for whether the element is actually scrollable in
  // a certain direction and we only assign the scroll direction if it is. We do this so that we
  // can allow other elements to be scrolled, if the current element can't be scrolled anymore.
  // This allows us to handle cases where the scroll regions of two scrollable elements overlap.
  if (computedVertical) {
    const scrollTop = element.scrollTop;

    if (computedVertical === AutoScrollVerticalDirection.UP) {
      if (scrollTop > 0) {
        verticalScrollDirection = AutoScrollVerticalDirection.UP;
      }
    } else if (element.scrollHeight - scrollTop > element.clientHeight) {
      verticalScrollDirection = AutoScrollVerticalDirection.DOWN;
    }
  }

  if (computedHorizontal) {
    const scrollLeft = element.scrollLeft;

    if (computedHorizontal === AutoScrollHorizontalDirection.LEFT) {
      if (scrollLeft > 0) {
        horizontalScrollDirection = AutoScrollHorizontalDirection.LEFT;
      }
    } else if (element.scrollWidth - scrollLeft > element.clientWidth) {
      horizontalScrollDirection = AutoScrollHorizontalDirection.RIGHT;
    }
  }

  return [verticalScrollDirection, horizontalScrollDirection];
}
