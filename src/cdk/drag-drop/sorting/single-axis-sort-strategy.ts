/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Direction} from '@angular/cdk/bidi';
import {ElementRef} from '@angular/core';
import {coerceElement} from '@angular/cdk/coercion';
import {DragDropRegistry} from '../drag-drop-registry';
import {moveItemInArray} from '../drag-utils';
import {combineTransforms} from '../dom/styling';
import {adjustClientRect, getMutableClientRect, isInsideClientRect} from '../dom/client-rect';
import {
  DropListSortStrategy,
  DropListSortStrategyItem,
  SortPredicate,
} from './drop-list-sort-strategy';

/**
 * Entry in the position cache for draggable items.
 * @docs-private
 */
interface CachedItemPosition<T> {
  /** Instance of the drag item. */
  drag: T;
  /** Dimensions of the item. */
  clientRect: ClientRect;
  /** Amount by which the item has been moved since dragging started. */
  offset: number;
  /** Inline transform that the drag item had when dragging started. */
  initialTransform: string;
}

/**
 * Strategy that only supports sorting along a single axis.
 * Items are reordered using CSS transforms which allows for sorting to be animated.
 * @docs-private
 */
export class SingleAxisSortStrategy<T extends DropListSortStrategyItem>
  implements DropListSortStrategy<T>
{
  /** Function used to determine if an item can be sorted into a specific index. */
  private _sortPredicate: SortPredicate<T>;

  /** Cache of the dimensions of all the items inside the container. */
  private _itemPositions: CachedItemPosition<T>[] = [];

  /**
   * Draggable items that are currently active inside the container. Includes the items
   * that were there at the start of the sequence, as well as any items that have been dragged
   * in, but haven't been dropped yet.
   */
  private _activeDraggables: T[];

  /** Direction in which the list is oriented. */
  orientation: 'vertical' | 'horizontal' = 'vertical';

  /** Layout direction of the drop list. */
  direction: Direction;

  constructor(
    private _element: HTMLElement | ElementRef<HTMLElement>,
    private _dragDropRegistry: DragDropRegistry<T, unknown>,
  ) {}

  /**
   * Keeps track of the item that was last swapped with the dragged item, as well as what direction
   * the pointer was moving in when the swap occured and whether the user's pointer continued to
   * overlap with the swapped item after the swapping occurred.
   */
  private _previousSwap = {
    drag: null as T | null,
    delta: 0,
    overlaps: false,
  };

  /**
   * To be called when the drag sequence starts.
   * @param items Items that are currently in the list.
   */
  start(items: readonly T[]) {
    this.withItems(items);
  }

  /**
   * To be called when an item is being sorted.
   * @param item Item to be sorted.
   * @param pointerX Position of the item along the X axis.
   * @param pointerY Position of the item along the Y axis.
   * @param pointerDelta Direction in which the pointer is moving along each axis.
   */
  sort(item: T, pointerX: number, pointerY: number, pointerDelta: {x: number; y: number}) {
    const siblings = this._itemPositions;
    const newIndex = this._getItemIndexFromPointerPosition(item, pointerX, pointerY, pointerDelta);

    if (newIndex === -1 && siblings.length > 0) {
      return null;
    }

    const isHorizontal = this.orientation === 'horizontal';
    const currentIndex = siblings.findIndex(currentItem => currentItem.drag === item);
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

    siblings.forEach((sibling, index) => {
      // Don't do anything if the position hasn't changed.
      if (oldOrder[index] === sibling) {
        return;
      }

      const isDraggedItem = sibling.drag === item;
      const offset = isDraggedItem ? itemOffset : siblingOffset;
      const elementToOffset = isDraggedItem
        ? item.getPlaceholderElement()
        : sibling.drag.getRootElement();

      // Update the offset to reflect the new position.
      sibling.offset += offset;

      // Since we're moving the items with a `transform`, we need to adjust their cached
      // client rects to reflect their new position, as well as swap their positions in the cache.
      // Note that we shouldn't use `getBoundingClientRect` here to update the cache, because the
      // elements may be mid-animation which will give us a wrong result.
      if (isHorizontal) {
        // Round the transforms since some browsers will
        // blur the elements, for sub-pixel transforms.
        elementToOffset.style.transform = combineTransforms(
          `translate3d(${Math.round(sibling.offset)}px, 0, 0)`,
          sibling.initialTransform,
        );
        adjustClientRect(sibling.clientRect, 0, offset);
      } else {
        elementToOffset.style.transform = combineTransforms(
          `translate3d(0, ${Math.round(sibling.offset)}px, 0)`,
          sibling.initialTransform,
        );
        adjustClientRect(sibling.clientRect, offset, 0);
      }
    });

    // Note that it's important that we do this after the client rects have been adjusted.
    this._previousSwap.overlaps = isInsideClientRect(newPosition, pointerX, pointerY);
    this._previousSwap.drag = siblingAtNewPosition.drag;
    this._previousSwap.delta = isHorizontal ? pointerDelta.x : pointerDelta.y;

    return {previousIndex: currentIndex, currentIndex: newIndex};
  }

  /**
   * Called when an item is being moved into the container.
   * @param item Item that was moved into the container.
   * @param pointerX Position of the item along the X axis.
   * @param pointerY Position of the item along the Y axis.
   * @param index Index at which the item entered. If omitted, the container will try to figure it
   *   out automatically.
   */
  enter(item: T, pointerX: number, pointerY: number, index?: number): void {
    const newIndex =
      index == null || index < 0
        ? // We use the coordinates of where the item entered the drop
          // zone to figure out at which index it should be inserted.
          this._getItemIndexFromPointerPosition(item, pointerX, pointerY)
        : index;

    const activeDraggables = this._activeDraggables;
    const currentIndex = activeDraggables.indexOf(item);
    const placeholder = item.getPlaceholderElement();
    let newPositionReference: T | undefined = activeDraggables[newIndex];

    // If the item at the new position is the same as the item that is being dragged,
    // it means that we're trying to restore the item to its initial position. In this
    // case we should use the next item from the list as the reference.
    if (newPositionReference === item) {
      newPositionReference = activeDraggables[newIndex + 1];
    }

    // If we didn't find a new position reference, it means that either the item didn't start off
    // in this container, or that the item requested to be inserted at the end of the list.
    if (
      !newPositionReference &&
      (newIndex == null || newIndex === -1 || newIndex < activeDraggables.length - 1) &&
      this._shouldEnterAsFirstChild(pointerX, pointerY)
    ) {
      newPositionReference = activeDraggables[0];
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
    } else {
      coerceElement(this._element).appendChild(placeholder);
      activeDraggables.push(item);
    }

    // The transform needs to be cleared so it doesn't throw off the measurements.
    placeholder.style.transform = '';

    // Note that usually `start` is called together with `enter` when an item goes into a new
    // container. This will cache item positions, but we need to refresh them since the amount
    // of items has changed.
    this._cacheItemPositions();
  }

  /** Sets the items that are currently part of the list. */
  withItems(items: readonly T[]): void {
    this._activeDraggables = items.slice();
    this._cacheItemPositions();
  }

  /** Assigns a sort predicate to the strategy. */
  withSortPredicate(predicate: SortPredicate<T>): void {
    this._sortPredicate = predicate;
  }

  /** Resets the strategy to its initial state before dragging was started. */
  reset() {
    // TODO(crisbeto): may have to wait for the animations to finish.
    this._activeDraggables.forEach(item => {
      const rootElement = item.getRootElement();

      if (rootElement) {
        const initialTransform = this._itemPositions.find(p => p.drag === item)?.initialTransform;
        rootElement.style.transform = initialTransform || '';
      }
    });

    this._itemPositions = [];
    this._activeDraggables = [];
    this._previousSwap.drag = null;
    this._previousSwap.delta = 0;
    this._previousSwap.overlaps = false;
  }

  /**
   * Gets a snapshot of items currently in the list.
   * Can include items that we dragged in from another list.
   */
  getActiveItemsSnapshot(): readonly T[] {
    return this._activeDraggables;
  }

  /** Gets the index of a specific item. */
  getItemIndex(item: T): number {
    // Items are sorted always by top/left in the cache, however they flow differently in RTL.
    // The rest of the logic still stands no matter what orientation we're in, however
    // we need to invert the array when determining the index.
    const items =
      this.orientation === 'horizontal' && this.direction === 'rtl'
        ? this._itemPositions.slice().reverse()
        : this._itemPositions;

    return items.findIndex(currentItem => currentItem.drag === item);
  }

  /** Used to notify the strategy that the scroll position has changed. */
  updateOnScroll(topDifference: number, leftDifference: number) {
    // Since we know the amount that the user has scrolled we can shift all of the
    // client rectangles ourselves. This is cheaper than re-measuring everything and
    // we can avoid inconsistent behavior where we might be measuring the element before
    // its position has changed.
    this._itemPositions.forEach(({clientRect}) => {
      adjustClientRect(clientRect, topDifference, leftDifference);
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

  /** Refreshes the position cache of the items and sibling containers. */
  private _cacheItemPositions() {
    const isHorizontal = this.orientation === 'horizontal';

    this._itemPositions = this._activeDraggables
      .map(drag => {
        const elementToMeasure = drag.getVisibleElement();
        return {
          drag,
          offset: 0,
          initialTransform: elementToMeasure.style.transform || '',
          clientRect: getMutableClientRect(elementToMeasure),
        };
      })
      .sort((a, b) => {
        return isHorizontal
          ? a.clientRect.left - b.clientRect.left
          : a.clientRect.top - b.clientRect.top;
      });
  }

  /**
   * Gets the offset in pixels by which the item that is being dragged should be moved.
   * @param currentPosition Current position of the item.
   * @param newPosition Position of the item where the current item should be moved.
   * @param delta Direction in which the user is moving.
   */
  private _getItemOffsetPx(currentPosition: ClientRect, newPosition: ClientRect, delta: 1 | -1) {
    const isHorizontal = this.orientation === 'horizontal';
    let itemOffset = isHorizontal
      ? newPosition.left - currentPosition.left
      : newPosition.top - currentPosition.top;

    // Account for differences in the item width/height.
    if (delta === -1) {
      itemOffset += isHorizontal
        ? newPosition.width - currentPosition.width
        : newPosition.height - currentPosition.height;
    }

    return itemOffset;
  }

  /**
   * Gets the offset in pixels by which the items that aren't being dragged should be moved.
   * @param currentIndex Index of the item currently being dragged.
   * @param siblings All of the items in the list.
   * @param delta Direction in which the user is moving.
   */
  private _getSiblingOffsetPx(
    currentIndex: number,
    siblings: CachedItemPosition<T>[],
    delta: 1 | -1,
  ) {
    const isHorizontal = this.orientation === 'horizontal';
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
   * Checks if pointer is entering in the first position
   * @param pointerX Position of the user's pointer along the X axis.
   * @param pointerY Position of the user's pointer along the Y axis.
   */
  private _shouldEnterAsFirstChild(pointerX: number, pointerY: number) {
    if (!this._activeDraggables.length) {
      return false;
    }

    const itemPositions = this._itemPositions;
    const isHorizontal = this.orientation === 'horizontal';

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
  private _getItemIndexFromPointerPosition(
    item: T,
    pointerX: number,
    pointerY: number,
    delta?: {x: number; y: number},
  ): number {
    const isHorizontal = this.orientation === 'horizontal';
    const index = this._itemPositions.findIndex(({drag, clientRect}) => {
      // Skip the item itself.
      if (drag === item) {
        return false;
      }

      if (delta) {
        const direction = isHorizontal ? delta.x : delta.y;

        // If the user is still hovering over the same item as last time, their cursor hasn't left
        // the item after we made the swap, and they didn't change the direction in which they're
        // dragging, we don't consider it a direction swap.
        if (
          drag === this._previousSwap.drag &&
          this._previousSwap.overlaps &&
          direction === this._previousSwap.delta
        ) {
          return false;
        }
      }

      return isHorizontal
        ? // Round these down since most browsers report client rects with
          // sub-pixel precision, whereas the pointer coordinates are rounded to pixels.
          pointerX >= Math.floor(clientRect.left) && pointerX < Math.floor(clientRect.right)
        : pointerY >= Math.floor(clientRect.top) && pointerY < Math.floor(clientRect.bottom);
    });

    return index === -1 || !this._sortPredicate(index, item) ? -1 : index;
  }
}
