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
import {moveItemInArray} from './drag-utils';
import {DragDropRegistry} from './drag-drop-registry';
import {DragRefInternal as DragRef, Point} from './drag-ref';
import {
  isPointerNearClientRect,
  adjustClientRect,
  getMutableClientRect,
  isInsideClientRect,
} from './client-rect';
import {ParentPositionTracker} from './parent-position-tracker';
import {DragCSSStyleDeclaration} from './drag-styling';

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

/**
 * Entry in the position cache for draggable items.
 * @docs-private
 */
interface CachedItemPosition {
  /** Instance of the drag item. */
  drag: DragRef;
  /** Dimensions of the item. */
  clientRect: ClientRect;
  /** Amount by which the item has been moved since dragging started. */
  offset: number;
}

/** Vertical direction in which we can auto-scroll. */
const enum AutoScrollVerticalDirection {NONE, UP, DOWN}

/** Horizontal direction in which we can auto-scroll. */
const enum AutoScrollHorizontalDirection {NONE, LEFT, RIGHT}

/**
 * Internal compile-time-only representation of a `DropListRef`.
 * Used to avoid circular import issues between the `DropListRef` and the `DragRef`.
 * @docs-private
 */
export interface DropListRefInternal extends DropListRef {}

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

  /** Functions that is used to determine whether an item can be sorted into a particular index. */
  sortPredicate: (index: number, drag: DragRef, drop: DropListRef) => boolean = () => true;

  /** Emits right before dragging has started. */
  beforeStarted = new Subject<void>();

  /**
   * Emits when the user has moved a new drag item into this container.
   */
  entered = new Subject<{item: DragRef, container: DropListRef, currentIndex: number}>();

  /**
   * Emits when the user removes an item from the container
   * by dragging it into another container.
   */
  exited = new Subject<{item: DragRef, container: DropListRef}>();

  /** Emits when the user drops an item inside the container. */
  dropped = new Subject<{
    item: DragRef,
    currentIndex: number,
    previousIndex: number,
    container: DropListRef,
    previousContainer: DropListRef,
    isPointerOverContainer: boolean,
    distance: Point;
  }>();

  /** Emits as the user is swapping items while actively dragging. */
  sorted = new Subject<{
    previousIndex: number,
    currentIndex: number,
    container: DropListRef,
    item: DragRef
  }>();

  /** Arbitrary data that can be attached to the drop list. */
  data: T;

  /** Whether an item in the list is being dragged. */
  private _isDragging = false;

  /** Cache of the dimensions of all the items inside the container. */
  private _itemPositions: CachedItemPosition[] = [];

  /** Keeps track of the positions of any parent scrollable elements. */
  private _parentPositions: ParentPositionTracker;

  /** Cached `ClientRect` of the drop list. */
  private _clientRect: ClientRect | undefined;

  /**
   * Draggable items that are currently active inside the container. Includes the items
   * from `_draggables`, as well as any items that have been dragged in, but haven't
   * been dropped yet.
   */
  private _activeDraggables: DragRef[];

  /**
   * Keeps track of the item that was last swapped with the dragged item, as well as what direction
   * the pointer was moving in when the swap occured and whether the user's pointer continued to
   * overlap with the swapped item after the swapping occurred.
   */
  private _previousSwap = {drag: null as DragRef | null, delta: 0, overlaps: false};

  /** Draggable items in the container. */
  private _draggables: ReadonlyArray<DragRef> = [];

  /** Drop lists that are connected to the current one. */
  private _siblings: ReadonlyArray<DropListRef> = [];

  /** Direction in which the list is oriented. */
  private _orientation: 'horizontal' | 'vertical' = 'vertical';

  /** Connected siblings that currently have a dragged item. */
  private _activeSiblings = new Set<DropListRef>();

  /** Layout direction of the drop list. */
  private _direction: Direction = 'ltr';

  /** Subscription to the window being scrolled. */
  private _viewportScrollSubscription = Subscription.EMPTY;

  /** Vertical direction in which the list is currently scrolling. */
  private _verticalScrollDirection = AutoScrollVerticalDirection.NONE;

  /** Horizontal direction in which the list is currently scrolling. */
  private _horizontalScrollDirection = AutoScrollHorizontalDirection.NONE;

  /** Node that is being auto-scrolled. */
  private _scrollNode: HTMLElement | Window;

  /** Used to signal to the current auto-scroll sequence when to stop. */
  private _stopScrollTimers = new Subject<void>();

  /** Shadow root of the current element. Necessary for `elementFromPoint` to resolve correctly. */
  private _cachedShadowRoot: DocumentOrShadowRoot | null = null;

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
    private _viewportRuler: ViewportRuler) {
    this.element = coerceElement(element);
    this._document = _document;
    this.withScrollableParents([this.element]);
    _dragDropRegistry.registerDropContainer(this);
    this._parentPositions = new ParentPositionTracker(_document, _viewportRuler);
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
   * Emits an event to indicate that the user moved an item into the container.
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
    let newIndex: number;

    if (index == null) {
      newIndex = this.sortingDisabled ? this._draggables.indexOf(item) : -1;

      if (newIndex === -1) {
        // We use the coordinates of where the item entered the drop
        // zone to figure out at which index it should be inserted.
        newIndex = this._getItemIndexFromPointerPosition(item, pointerX, pointerY);
      }
    } else {
      newIndex = index;
    }

    const activeDraggables = this._activeDraggables;
    const currentIndex = activeDraggables.indexOf(item);
    const placeholder = item.getPlaceholderElement();
    let newPositionReference: DragRef | undefined = activeDraggables[newIndex];

    // If the item at the new position is the same as the item that is being dragged,
    // it means that we're trying to restore the item to its initial position. In this
    // case we should use the next item from the list as the reference.
    if (newPositionReference === item) {
      newPositionReference = activeDraggables[newIndex + 1];
    }

    // Since the item may be in the `activeDraggables` already (e.g. if the user dragged it
    // into another container and back again), we have to ensure that it isn't duplicated.
    if (currentIndex > -1) {
      activeDraggables.splice(currentIndex, 1);
    }

    // Don't use items that are being dragged as a reference, because
    // their element has been moved down to the bottom of the body.
    if (newPositionReference && !this._dragDropRegistry.isDragging(newPositionReference)) {
      const element = newPositionReference.getRootElement();
      element.parentElement!.insertBefore(placeholder, element);
      activeDraggables.splice(newIndex, 0, item);
    } else if (this._shouldEnterAsFirstChild(pointerX, pointerY)) {
      const reference = activeDraggables[0].getRootElement();
      reference.parentNode!.insertBefore(placeholder, reference);
      activeDraggables.unshift(item);
    } else {
      coerceElement(this.element).appendChild(placeholder);
      activeDraggables.push(item);
    }

    // The transform needs to be cleared so it doesn't throw off the measurements.
    placeholder.style.transform = '';

    // Note that the positions were already cached when we called `start` above,
    // but we need to refresh them since the amount of items has changed and also parent rects.
    this._cacheItemPositions();
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
   */
  drop(item: DragRef, currentIndex: number, previousIndex: number, previousContainer: DropListRef,
    isPointerOverContainer: boolean, distance: Point): void {
    this._reset();
    this.dropped.next({
      item,
      currentIndex,
      previousIndex,
      container: this,
      previousContainer,
      isPointerOverContainer,
      distance
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
        this._cacheItems();
      }
    }

    return this;
  }

  /** Sets the layout direction of the drop list. */
  withDirection(direction: Direction): this {
    this._direction = direction;
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
    this._orientation = orientation;
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
  getScrollableParents(): ReadonlyArray<HTMLElement> {
    return this._scrollableElements;
  }

  /**
   * Figures out the index of an item in the container.
   * @param item Item whose index should be determined.
   */
  getItemIndex(item: DragRef): number {
    if (!this._isDragging) {
      return this._draggables.indexOf(item);
    }

    // Items are sorted always by top/left in the cache, however they flow differently in RTL.
    // The rest of the logic still stands no matter what orientation we're in, however
    // we need to invert the array when determining the index.
    const items = this._orientation === 'horizontal' && this._direction === 'rtl' ?
        this._itemPositions.slice().reverse() : this._itemPositions;

    return findIndex(items, currentItem => currentItem.drag === item);
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
  _sortItem(item: DragRef, pointerX: number, pointerY: number,
            pointerDelta: {x: number, y: number}): void {
    // Don't sort the item if sorting is disabled or it's out of range.
    if (this.sortingDisabled || !this._clientRect ||
        !isPointerNearClientRect(this._clientRect, DROP_PROXIMITY_THRESHOLD, pointerX, pointerY)) {
      return;
    }

    const siblings = this._itemPositions;
    const newIndex = this._getItemIndexFromPointerPosition(item, pointerX, pointerY, pointerDelta);

    if (newIndex === -1 && siblings.length > 0) {
      return;
    }

    const isHorizontal = this._orientation === 'horizontal';
    const currentIndex = findIndex(siblings, currentItem => currentItem.drag === item);
    const siblingAtNewPosition = siblings[newIndex];
    const currentPosition = siblings[currentIndex].clientRect;
    const newPosition = siblingAtNewPosition.clientRect;
    const delta = currentIndex > newIndex ? 1 : -1;

    // How many pixels the item's placeholder should be offset.
    const itemOffset = this._getItemOffsetPx(currentPosition, newPosition, delta);

    // How many pixels all the other items should be offset.
    const siblingOffset = this._getSiblingOffsetPx(currentIndex, siblings, delta);

    // Save the previous order of the items before moving the item to its new index.
    // We use this to check whether an item has been moved as a result of the sorting.
    const oldOrder = siblings.slice();

    // Shuffle the array in place.
    moveItemInArray(siblings, currentIndex, newIndex);

    this.sorted.next({
      previousIndex: currentIndex,
      currentIndex: newIndex,
      container: this,
      item
    });

    siblings.forEach((sibling, index) => {
      // Don't do anything if the position hasn't changed.
      if (oldOrder[index] === sibling) {
        return;
      }

      const isDraggedItem = sibling.drag === item;
      const offset = isDraggedItem ? itemOffset : siblingOffset;
      const elementToOffset = isDraggedItem ? item.getPlaceholderElement() :
                                              sibling.drag.getRootElement();

      // Update the offset to reflect the new position.
      sibling.offset += offset;

      // Since we're moving the items with a `transform`, we need to adjust their cached
      // client rects to reflect their new position, as well as swap their positions in the cache.
      // Note that we shouldn't use `getBoundingClientRect` here to update the cache, because the
      // elements may be mid-animation which will give us a wrong result.
      if (isHorizontal) {
        // Round the transforms since some browsers will
        // blur the elements, for sub-pixel transforms.
        elementToOffset.style.transform = `translate3d(${Math.round(sibling.offset)}px, 0, 0)`;
        adjustClientRect(sibling.clientRect, 0, offset);
      } else {
        elementToOffset.style.transform = `translate3d(0, ${Math.round(sibling.offset)}px, 0)`;
        adjustClientRect(sibling.clientRect, offset, 0);
      }
    });

    // Note that it's important that we do this after the client rects have been adjusted.
    this._previousSwap.overlaps = isInsideClientRect(newPosition, pointerX, pointerY);
    this._previousSwap.drag = siblingAtNewPosition.drag;
    this._previousSwap.delta = isHorizontal ? pointerDelta.x : pointerDelta.y;
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

      if (isPointerNearClientRect(position.clientRect, DROP_PROXIMITY_THRESHOLD,
          pointerX, pointerY)) {
        [verticalScrollDirection, horizontalScrollDirection] = getElementScrollDirections(
            element as HTMLElement, position.clientRect, pointerX, pointerY);

        if (verticalScrollDirection || horizontalScrollDirection) {
          scrollNode = element as HTMLElement;
        }
      }
    });

    // Otherwise check if we can start scrolling the viewport.
    if (!verticalScrollDirection && !horizontalScrollDirection) {
      const {width, height} = this._viewportRuler.getViewportSize();
      const clientRect = {width, height, top: 0, right: width, bottom: height, left: 0};
      verticalScrollDirection = getVerticalScrollDirection(clientRect, pointerY);
      horizontalScrollDirection = getHorizontalScrollDirection(clientRect, pointerX);
      scrollNode = window;
    }

    if (scrollNode && (verticalScrollDirection !== this._verticalScrollDirection ||
        horizontalScrollDirection !== this._horizontalScrollDirection ||
        scrollNode !== this._scrollNode)) {
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
    this._cacheItems();
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

  /** Refreshes the position cache of the items and sibling containers. */
  private _cacheItemPositions() {
    const isHorizontal = this._orientation === 'horizontal';

    this._itemPositions = this._activeDraggables.map(drag => {
      const elementToMeasure = drag.getVisibleElement();
      return {drag, offset: 0, clientRect: getMutableClientRect(elementToMeasure)};
    }).sort((a, b) => {
      return isHorizontal ? a.clientRect.left - b.clientRect.left :
                            a.clientRect.top - b.clientRect.top;
    });
  }

  /** Resets the container to its initial state. */
  private _reset() {
    this._isDragging = false;

    const styles = coerceElement(this.element).style as DragCSSStyleDeclaration;
    styles.scrollSnapType = styles.msScrollSnapType = this._initialScrollSnap;

    // TODO(crisbeto): may have to wait for the animations to finish.
    this._activeDraggables.forEach(item => {
      const rootElement = item.getRootElement();

      if (rootElement) {
        rootElement.style.transform = '';
      }
    });
    this._siblings.forEach(sibling => sibling._stopReceiving(this));
    this._activeDraggables = [];
    this._itemPositions = [];
    this._previousSwap.drag = null;
    this._previousSwap.delta = 0;
    this._previousSwap.overlaps = false;
    this._stopScrolling();
    this._viewportScrollSubscription.unsubscribe();
    this._parentPositions.clear();
  }

  /**
   * Gets the offset in pixels by which the items that aren't being dragged should be moved.
   * @param currentIndex Index of the item currently being dragged.
   * @param siblings All of the items in the list.
   * @param delta Direction in which the user is moving.
   */
  private _getSiblingOffsetPx(currentIndex: number,
                              siblings: CachedItemPosition[],
                              delta: 1 | -1) {

    const isHorizontal = this._orientation === 'horizontal';
    const currentPosition = siblings[currentIndex].clientRect;
    const immediateSibling = siblings[currentIndex + delta * -1];
    let siblingOffset = currentPosition[isHorizontal ? 'width' : 'height'] * delta;

    if (immediateSibling) {
      const start = isHorizontal ? 'left' : 'top';
      const end = isHorizontal ? 'right' : 'bottom';

      // Get the spacing between the start of the current item and the end of the one immediately
      // after it in the direction in which the user is dragging, or vice versa. We add it to the
      // offset in order to push the element to where it will be when it's inline and is influenced
      // by the `margin` of its siblings.
      if (delta === -1) {
        siblingOffset -= immediateSibling.clientRect[start] - currentPosition[end];
      } else {
        siblingOffset += currentPosition[start] - immediateSibling.clientRect[end];
      }
    }

    return siblingOffset;
  }

  /**
   * Gets the offset in pixels by which the item that is being dragged should be moved.
   * @param currentPosition Current position of the item.
   * @param newPosition Position of the item where the current item should be moved.
   * @param delta Direction in which the user is moving.
   */
  private _getItemOffsetPx(currentPosition: ClientRect, newPosition: ClientRect, delta: 1 | -1) {
    const isHorizontal = this._orientation === 'horizontal';
    let itemOffset = isHorizontal ? newPosition.left - currentPosition.left :
                                    newPosition.top - currentPosition.top;

    // Account for differences in the item width/height.
    if (delta === -1) {
      itemOffset += isHorizontal ? newPosition.width - currentPosition.width :
                                   newPosition.height - currentPosition.height;
    }

    return itemOffset;
  }

  /**
   * Checks if pointer is entering in the first position
   * @param pointerX Position of the user's pointer along the X axis.
   * @param pointerY Position of the user's pointer along the Y axis.
   */
  private _shouldEnterAsFirstChild(pointerX: number, pointerY: number) {
    if (!this._activeDraggables.length) {
      return false;
    }

    const itemPositions = this._itemPositions;
    const isHorizontal = this._orientation === 'horizontal';

    // `itemPositions` are sorted by position while `activeDraggables` are sorted by child index
    // check if container is using some sort of "reverse" ordering (eg: flex-direction: row-reverse)
    const reversed = itemPositions[0].drag !== this._activeDraggables[0];
    if (reversed) {
      const lastItemRect = itemPositions[itemPositions.length - 1].clientRect;
      return isHorizontal ? pointerX >= lastItemRect.right : pointerY >= lastItemRect.bottom;
    } else {
      const firstItemRect = itemPositions[0].clientRect;
      return isHorizontal ? pointerX <= firstItemRect.left : pointerY <= firstItemRect.top;
    }
  }

  /**
   * Gets the index of an item in the drop container, based on the position of the user's pointer.
   * @param item Item that is being sorted.
   * @param pointerX Position of the user's pointer along the X axis.
   * @param pointerY Position of the user's pointer along the Y axis.
   * @param delta Direction in which the user is moving their pointer.
   */
  private _getItemIndexFromPointerPosition(item: DragRef, pointerX: number, pointerY: number,
                                           delta?: {x: number, y: number}): number {
    const isHorizontal = this._orientation === 'horizontal';
    const index = findIndex(this._itemPositions, ({drag, clientRect}, _, array) => {
      if (drag === item) {
        // If there's only one item left in the container, it must be
        // the dragged item itself so we use it as a reference.
        return array.length < 2;
      }

      if (delta) {
        const direction = isHorizontal ? delta.x : delta.y;

        // If the user is still hovering over the same item as last time, their cursor hasn't left
        // the item after we made the swap, and they didn't change the direction in which they're
        // dragging, we don't consider it a direction swap.
        if (drag === this._previousSwap.drag && this._previousSwap.overlaps &&
            direction === this._previousSwap.delta) {
          return false;
        }
      }

      return isHorizontal ?
          // Round these down since most browsers report client rects with
          // sub-pixel precision, whereas the pointer coordinates are rounded to pixels.
          pointerX >= Math.floor(clientRect.left) && pointerX < Math.floor(clientRect.right) :
          pointerY >= Math.floor(clientRect.top) && pointerY < Math.floor(clientRect.bottom);
    });

    return (index === -1 || !this.sortPredicate(index, item, this)) ? -1 : index;
  }

  /** Caches the current items in the list and their positions. */
  private _cacheItems(): void {
    this._activeDraggables = this._draggables.slice();
    this._cacheItemPositions();
    this._cacheParentPositions();
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
          incrementVerticalScroll(node, -scrollStep);
        } else if (this._verticalScrollDirection === AutoScrollVerticalDirection.DOWN) {
          incrementVerticalScroll(node, scrollStep);
        }

        if (this._horizontalScrollDirection === AutoScrollHorizontalDirection.LEFT) {
          incrementHorizontalScroll(node, -scrollStep);
        } else if (this._horizontalScrollDirection === AutoScrollHorizontalDirection.RIGHT) {
          incrementHorizontalScroll(node, scrollStep);
        }
      });
  }

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
    if (!this._clientRect || !isInsideClientRect(this._clientRect, x, y) ||
        !this.enterPredicate(item, this)) {
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

    if (!activeSiblings.has(sibling) && items.every(item => {
      // Note that we have to add an exception to the `enterPredicate` for items that started off
      // in this drop list. The drag ref has logic that allows an item to return to its initial
      // container, if it has left the initial container and none of the connected containers
      // allow it to enter. See `DragRef._updateActiveDropContainer` for more context.
      return this.enterPredicate(item, this) || this._draggables.indexOf(item) > -1;
    })) {
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
    this._viewportScrollSubscription = this._dragDropRegistry.scroll.subscribe(event => {
      if (this.isDragging()) {
        const scrollDifference = this._parentPositions.handleScroll(event);

        if (scrollDifference) {
          // Since we know the amount that the user has scrolled we can shift all of the
          // client rectangles ourselves. This is cheaper than re-measuring everything and
          // we can avoid inconsistent behavior where we might be measuring the element before
          // its position has changed.
          this._itemPositions.forEach(({clientRect}) => {
            adjustClientRect(clientRect, scrollDifference.top, scrollDifference.left);
          });

          // We need two loops for this, because we want all of the cached
          // positions to be up-to-date before we re-sort the item.
          this._itemPositions.forEach(({drag}) => {
            if (this._dragDropRegistry.isDragging(drag)) {
              // We need to re-sort the item manually, because the pointer move
              // events won't be dispatched while the user is scrolling.
              drag._sortFromLastPointerPosition();
            }
          });
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
  private _getShadowRoot(): DocumentOrShadowRoot {
    if (!this._cachedShadowRoot) {
      const shadowRoot = _getShadowRoot(coerceElement(this.element));
      this._cachedShadowRoot = shadowRoot || this._document;
    }

    return this._cachedShadowRoot;
  }

  /** Notifies any siblings that may potentially receive the item. */
  private _notifyReceivingSiblings() {
    const draggedItems = this._activeDraggables.filter(item => item.isDragging());
    this._siblings.forEach(sibling => sibling._startReceiving(this, draggedItems));
  }
}


/**
 * Finds the index of an item that matches a predicate function. Used as an equivalent
 * of `Array.prototype.findIndex` which isn't part of the standard Google typings.
 * @param array Array in which to look for matches.
 * @param predicate Function used to determine whether an item is a match.
 */
function findIndex<T>(array: T[],
                      predicate: (value: T, index: number, obj: T[]) => boolean): number {

  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i], i, array)) {
      return i;
    }
  }

  return -1;
}

/**
 * Increments the vertical scroll position of a node.
 * @param node Node whose scroll position should change.
 * @param amount Amount of pixels that the `node` should be scrolled.
 */
function incrementVerticalScroll(node: HTMLElement | Window, amount: number) {
  if (node === window) {
    (node as Window).scrollBy(0, amount);
  } else {
    // Ideally we could use `Element.scrollBy` here as well, but IE and Edge don't support it.
    (node as HTMLElement).scrollTop += amount;
  }
}

/**
 * Increments the horizontal scroll position of a node.
 * @param node Node whose scroll position should change.
 * @param amount Amount of pixels that the `node` should be scrolled.
 */
function incrementHorizontalScroll(node: HTMLElement | Window, amount: number) {
  if (node === window) {
    (node as Window).scrollBy(amount, 0);
  } else {
    // Ideally we could use `Element.scrollBy` here as well, but IE and Edge don't support it.
    (node as HTMLElement).scrollLeft += amount;
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
function getElementScrollDirections(element: HTMLElement, clientRect: ClientRect, pointerX: number,
  pointerY: number): [AutoScrollVerticalDirection, AutoScrollHorizontalDirection] {
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
