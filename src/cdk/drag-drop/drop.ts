/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewEncapsulation,
} from '@angular/core';
import {coerceArray} from '@angular/cdk/coercion';
import {CdkDrag} from './drag';
import {CdkDragExit, CdkDragEnter, CdkDragDrop} from './drag-events';
import {CDK_DROP_CONTAINER} from './drop-container';
import {DragDropRegistry} from './drag-drop-registry';
import {moveItemInArray} from './drag-utils';

/** Counter used to generate unique ids for drop zones. */
let _uniqueIdCounter = 0;

/**
 * Proximity, as a ratio to width/height, at which a
 * dragged item will affect the drop container.
 */
const DROP_PROXIMITY_THRESHOLD = 0.05;

/** Container that wraps a set of draggable items. */
@Component({
  moduleId: module.id,
  selector: 'cdk-drop',
  exportAs: 'cdkDrop',
  template: '<ng-content></ng-content>',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['drop.css'],
  providers: [
    {provide: CDK_DROP_CONTAINER, useExisting: CdkDrop},
  ],
  host: {
    'class': 'cdk-drop',
    '[id]': 'id',
    '[class.cdk-drop-dragging]': '_dragging'
  }
})
export class CdkDrop<T = any> implements OnInit, OnDestroy {
  /** Draggable items in the container. */
  @ContentChildren(forwardRef(() => CdkDrag)) _draggables: QueryList<CdkDrag>;

  /**
   * Other draggable containers that this container is connected to and into which the
   * container's items can be transferred. Can either be references to other drop containers,
   * or their unique IDs.
   */
  @Input() connectedTo: (CdkDrop | string)[] | CdkDrop | string = [];

  /** Arbitrary data to attach to this container. */
  @Input() data: T;

  /** Direction in which the list is oriented. */
  @Input() orientation: 'horizontal' | 'vertical' = 'vertical';

  /**
   * Unique ID for the drop zone. Can be used as a reference
   * in the `connectedTo` of another `CdkDrop`.
   */
  @Input() id: string = `cdk-drop-${_uniqueIdCounter++}`;

  /** Locks the position of the draggable elements inside the container along the specified axis. */
  @Input() lockAxis: 'x' | 'y';

  /**
   * Function that is used to determine whether an item
   * is allowed to be moved into a drop container.
   */
  @Input() enterPredicate: (drag?: CdkDrag, drop?: CdkDrop) => boolean = () => true;

  /** Emits when the user drops an item inside the container. */
  @Output() dropped: EventEmitter<CdkDragDrop<T, any>> = new EventEmitter<CdkDragDrop<T, any>>();

  /**
   * Emits when the user has moved a new drag item into this container.
   */
  @Output() entered: EventEmitter<CdkDragEnter<T>> = new EventEmitter<CdkDragEnter<T>>();

  /**
   * Emits when the user removes an item from the container
   * by dragging it into another container.
   */
  @Output() exited: EventEmitter<CdkDragExit<T>> = new EventEmitter<CdkDragExit<T>>();

  constructor(
    public element: ElementRef<HTMLElement>,
    private _dragDropRegistry: DragDropRegistry<CdkDrag, CdkDrop<T>>) {}

  ngOnInit() {
    this._dragDropRegistry.registerDropContainer(this);
  }

  ngOnDestroy() {
    this._dragDropRegistry.removeDropContainer(this);
  }

  /** Whether an item in the container is being dragged. */
  _dragging = false;

  /** Cache of the dimensions of all the items and the sibling containers. */
  private _positionCache = {
    items: [] as {drag: CdkDrag, clientRect: ClientRect, offset: number}[],
    siblings: [] as {drop: CdkDrop, clientRect: ClientRect}[],
    self: {} as ClientRect
  };

  /**
   * Draggable items that are currently active inside the container. Includes the items
   * from `_draggables`, as well as any items that have been dragged in, but haven't
   * been dropped yet.
   */
  private _activeDraggables: CdkDrag[];

  /** Starts dragging an item. */
  start(): void {
    this._dragging = true;
    this._activeDraggables = this._draggables.toArray();
    this._cachePositions();
  }

  /**
   * Drops an item into this container.
   * @param item Item being dropped into the container.
   * @param currentIndex Index at which the item should be inserted.
   * @param previousContainer Container from which the item got dragged in.
   */
  drop(item: CdkDrag, currentIndex: number, previousContainer: CdkDrop): void {
    this._reset();
    this.dropped.emit({
      item,
      currentIndex,
      previousIndex: previousContainer.getItemIndex(item),
      container: this,
      // TODO(crisbeto): reconsider whether to make this null if the containers are the same.
      previousContainer
    });
  }

  /**
   * Emits an event to indicate that the user moved an item into the container.
   * @param item Item that was moved into the container.
   * @param pointerX Position of the item along the X axis.
   * @param pointerY Position of the item along the Y axis.
   */
  enter(item: CdkDrag, pointerX: number, pointerY: number): void {
    this.entered.emit({item, container: this});
    this.start();

    // We use the coordinates of where the item entered the drop
    // zone to figure out at which index it should be inserted.
    const newIndex = this._getItemIndexFromPointerPosition(item, pointerX, pointerY);
    const currentIndex = this._activeDraggables.indexOf(item);
    const newPositionReference = this._activeDraggables[newIndex];
    const placeholder = item.getPlaceholderElement();

    // Since the item may be in the `activeDraggables` already (e.g. if the user dragged it
    // into another container and back again), we have to ensure that it isn't duplicated.
    if (currentIndex > -1) {
      this._activeDraggables.splice(currentIndex, 1);
    }

    // Don't use items that are being dragged as a reference, because
    // their element has been moved down to the bottom of the body.
    if (newPositionReference && !this._dragDropRegistry.isDragging(newPositionReference)) {
      const element = newPositionReference.element.nativeElement;
      element.parentElement!.insertBefore(placeholder, element);
      this._activeDraggables.splice(newIndex, 0, item);
    } else {
      this.element.nativeElement.appendChild(placeholder);
      this._activeDraggables.push(item);
    }

    // The transform needs to be cleared so it doesn't throw off the measurements.
    placeholder.style.transform = '';

    // Note that the positions were already cached when we called `start` above,
    // but we need to refresh them since the amount of items has changed.
    this._cachePositions();
  }

  /**
   * Removes an item from the container after it was dragged into another container by the user.
   * @param item Item that was dragged out.
   */
  exit(item: CdkDrag): void {
    this._reset();
    this.exited.emit({item, container: this});
  }

  /**
   * Figures out the index of an item in the container.
   * @param item Item whose index should be determined.
   */
  getItemIndex(item: CdkDrag): number {
    return this._dragging ?
        this._positionCache.items.findIndex(currentItem => currentItem.drag === item) :
        this._draggables.toArray().indexOf(item);
  }

  /**
   * Sorts an item inside the container based on its position.
   * @param item Item to be sorted.
   * @param pointerX Position of the item along the X axis.
   * @param pointerY Position of the item along the Y axis.
   */
  _sortItem(item: CdkDrag, pointerX: number, pointerY: number): void {
    // Don't sort the item if it's out of range.
    if (!this._isPointerNearDropContainer(pointerX, pointerY)) {
      return;
    }

    const siblings = this._positionCache.items;
    const newIndex = this._getItemIndexFromPointerPosition(item, pointerX, pointerY);

    if (newIndex === -1 && siblings.length > 0) {
      return;
    }

    const isHorizontal = this.orientation === 'horizontal';
    const currentIndex = siblings.findIndex(currentItem => currentItem.drag === item);
    const currentPosition = siblings[currentIndex].clientRect;
    const newPosition = siblings[newIndex].clientRect;
    const delta = currentIndex > newIndex ? 1 : -1;

    // How many pixels the item's placeholder should be offset.
    const itemOffset = isHorizontal ? newPosition.left - currentPosition.left :
                                      newPosition.top - currentPosition.top;

    // How many pixels all the other items should be offset.
    const siblingOffset = isHorizontal ? currentPosition.width * delta :
                                         currentPosition.height * delta;

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
      const elementToOffset = isDraggedItem ? item.getPlaceholderElement() :
                                              sibling.drag.element.nativeElement;

      // Update the offset to reflect the new position.
      sibling.offset += offset;

      // Since we're moving the items with a `transform`, we need to adjust their cached
      // client rects to reflect their new position, as well as swap their positions in the cache.
      // Note that we shouldn't use `getBoundingClientRect` here to update the cache, because the
      // elements may be mid-animation which will give us a wrong result.
      if (isHorizontal) {
        elementToOffset.style.transform = `translate3d(${sibling.offset}px, 0, 0)`;
        this._adjustClientRect(sibling.clientRect, 0, offset);
      } else {
        elementToOffset.style.transform = `translate3d(0, ${sibling.offset}px, 0)`;
        this._adjustClientRect(sibling.clientRect, offset, 0);
      }
    });
  }

  /**
   * Figures out whether an item should be moved into a sibling
   * drop container, based on its current position.
   * @param item Drag item that is being moved.
   * @param x Position of the item along the X axis.
   * @param y Position of the item along the Y axis.
   */
  _getSiblingContainerFromPosition(item: CdkDrag, x: number, y: number): CdkDrop | null {
    const result = this._positionCache.siblings.find(({clientRect}) => {
      const {top, bottom, left, right} = clientRect;
      return y >= top && y <= bottom && x >= left && x <= right;
    });

    return result && result.drop.enterPredicate(item, this) ? result.drop : null;
  }

  /** Refreshes the position cache of the items and sibling containers. */
  private _cachePositions() {
    this._positionCache.items = this._activeDraggables
      .map(drag => {
        const elementToMeasure = this._dragDropRegistry.isDragging(drag) ?
            // If the element is being dragged, we have to measure the
            // placeholder, because the element is hidden.
            drag.getPlaceholderElement() :
            drag.element.nativeElement;
        const clientRect = elementToMeasure.getBoundingClientRect();

        return {
          drag,
          offset: 0,
          // We need to clone the `clientRect` here, because all the values on it are readonly
          // and we need to be able to update them. Also we can't use a spread here, because
          // the values on a `ClientRect` aren't own properties. See:
          // https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect#Notes
          clientRect: {
            top: clientRect.top,
            right: clientRect.right,
            bottom: clientRect.bottom,
            left: clientRect.left,
            width: clientRect.width,
            height: clientRect.height
          }
        };
      })
      .sort((a, b) => a.clientRect.top - b.clientRect.top);

    this._positionCache.siblings = coerceArray(this.connectedTo)
      .map(drop => typeof drop === 'string' ? this._dragDropRegistry.getDropContainer(drop)! : drop)
      .filter(drop => drop && drop !== this)
      .map(drop => ({drop, clientRect: drop.element.nativeElement.getBoundingClientRect()}));

    this._positionCache.self = this.element.nativeElement.getBoundingClientRect();
  }

  /** Resets the container to its initial state. */
  private _reset() {
    this._dragging = false;

    // TODO(crisbeto): may have to wait for the animations to finish.
    this._activeDraggables.forEach(item => item.element.nativeElement.style.transform = '');
    this._activeDraggables = [];
    this._positionCache.items = [];
    this._positionCache.siblings = [];
  }

  /**
   * Updates the top/left positions of a `ClientRect`, as well as their bottom/right counterparts.
   * @param clientRect `ClientRect` that should be updated.
   * @param top Amount to add to the `top` position.
   * @param left Amount to add to the `left` position.
   */
  private _adjustClientRect(clientRect: ClientRect, top: number, left: number) {
    clientRect.top += top;
    clientRect.bottom = clientRect.top + clientRect.height;

    clientRect.left += left;
    clientRect.right = clientRect.left + clientRect.width;
  }

  /**
   * Gets the index of an item in the drop container, based on the position of the user's pointer.
   * @param item Item that is being sorted.
   * @param pointerX Position of the user's pointer along the X axis.
   * @param pointerY Position of the user's pointer along the Y axis.
   */
  private _getItemIndexFromPointerPosition(item: CdkDrag, pointerX: number, pointerY: number) {
    return this._positionCache.items.findIndex(({drag, clientRect}, _, array) => {
      if (drag === item) {
        // If there's only one item left in the container, it must be
        // the dragged item itself so we use it as a reference.
        return array.length < 2;
      }

      return this.orientation === 'horizontal' ?
          // Round these down since most browsers report client rects with
          // sub-pixel precision, whereas the mouse coordinates are rounded to pixels.
          pointerX >= Math.floor(clientRect.left) && pointerX <= Math.floor(clientRect.right) :
          pointerY >= Math.floor(clientRect.top) && pointerY <= Math.floor(clientRect.bottom);
    });
  }

  /**
   * Checks whether the pointer coordinates are close to the drop container.
   * @param pointerX Coordinates along the X axis.
   * @param pointerY Coordinates along the Y axis.
   */
  private _isPointerNearDropContainer(pointerX: number, pointerY: number): boolean {
    const {top, right, bottom, left, width, height} = this._positionCache.self;
    const xThreshold = width * DROP_PROXIMITY_THRESHOLD;
    const yThreshold = height * DROP_PROXIMITY_THRESHOLD;

    return pointerY > top - yThreshold && pointerY < bottom + yThreshold &&
           pointerX > left - xThreshold && pointerX < right + xThreshold;
  }
}
