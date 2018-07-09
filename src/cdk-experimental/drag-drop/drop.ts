/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Component,
  ContentChildren,
  forwardRef,
  Input,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  ElementRef,
  QueryList,
} from '@angular/core';
import {CdkDrag} from './drag';
import {CdkDragExit, CdkDragEnter, CdkDragDrop} from './drag-events';
import {CDK_DROP_CONTAINER} from './drop-container';

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
    '[class.cdk-drop-dragging]': '_dragging'
  }
})
export class CdkDrop<T = any> {
  /** Draggable items in the container. */
  @ContentChildren(forwardRef(() => CdkDrag)) _draggables: QueryList<CdkDrag>;

  /**
   * Other draggable containers that this container is connected
   * to and into which the container's items can be transferred.
   */
  @Input() connectedTo: CdkDrop[] = [];

  /** Arbitrary data to attach to all events emitted by this container. */
  @Input() data: T;

  /** Direction in which the list is oriented. */
  @Input() orientation: 'horizontal' | 'vertical' = 'vertical';

  /** Emits when the user drops an item inside the container. */
  @Output() dropped = new EventEmitter<CdkDragDrop<T, any>>();

  /**
   * Emits when the user has moved a new drag item into this container.
   */
  @Output() entered = new EventEmitter<CdkDragEnter<T>>();

  /**
   * Emits when the user removes an item from the container
   * by dragging it into another container.
   */
  @Output() exited = new EventEmitter<CdkDragExit<T>>();

  constructor(public element: ElementRef<HTMLElement>) {}

  /** Whether an item in the container is being dragged. */
  _dragging = false;

  /** Cache of the dimensions of all the items and the sibling containers. */
  private _positionCache = {
    items: [] as {drag: CdkDrag, clientRect: ClientRect}[],
    siblings: [] as {drop: CdkDrop, clientRect: ClientRect}[]
  };

  /** Starts dragging an item. */
  start(): void {
    this._dragging = true;
    this._refreshPositions();
  }

  /**
   * Drops an item into this container.
   * @param item Item being dropped into the container.
   * @param currentIndex Index at which the item should be inserted.
   * @param previousContainer Container from which the item got dragged in.
   */
  drop(item: CdkDrag, currentIndex: number, previousContainer: CdkDrop): void {
    this.dropped.emit({
      item,
      currentIndex,
      previousIndex: previousContainer.getItemIndex(item),
      container: this,
      // TODO: reconsider whether to make this null if the containers are the same.
      previousContainer
    });

    this._reset();
  }

  /**
   * Emits an event to indicate that the user moved an item into the container.
   * @param item Item that was moved into the container.
   */
  enter(item: CdkDrag): void {
    this.entered.emit({item, container: this});
    this.start();
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
    return this._draggables.toArray().indexOf(item);
  }

  /**
   * Sorts an item inside the container based on its position.
   * @param item Item to be sorted.
   * @param xOffset Position of the item along the X axis.
   * @param yOffset Position of the item along the Y axis.
   */
  _sortItem(item: CdkDrag, xOffset: number, yOffset: number): void {
    const siblings = this._positionCache.items;
    const newPosition = siblings.find(({drag, clientRect}) => {
      if (drag === item) {
        return false;
      }

      return this.orientation === 'horizontal' ?
          xOffset > clientRect.left && xOffset < clientRect.right :
          yOffset > clientRect.top && yOffset < clientRect.bottom;
    });

    if (!newPosition && siblings.length > 0) {
      return;
    }

    const element = newPosition ? newPosition.drag.element.nativeElement : null;
    const next = element ? element!.nextSibling : null;
    const parent = element ? element.parentElement! : this.element.nativeElement;
    const placeholder = item.getPlaceholderElement();

    if (next) {
      parent.insertBefore(placeholder, next === placeholder ? element : next);
    } else {
      parent.appendChild(placeholder);
    }

    this._refreshPositions();
  }

  /**
   * Figures out whether an item should be moved into a sibling
   * drop container, based on its current position.
   * @param x Position of the item along the X axis.
   * @param y Position of the item along the Y axis.
   */
  _getSiblingContainerFromPosition(x: number, y: number): CdkDrop | null {
    const result = this._positionCache.siblings.find(({clientRect}) => {
      const {top, bottom, left, right} = clientRect;
      return y >= top && y <= bottom && x >= left && x <= right;
    });

    return result ? result.drop : null;
  }

  /** Refreshes the position cache of the items and sibling containers. */
  private _refreshPositions() {
    this._positionCache.items = this._draggables
      .map(drag => ({drag, clientRect: drag.element.nativeElement.getBoundingClientRect()}))
      .sort((a, b) => a.clientRect.top - b.clientRect.top);

    // TODO: add filter here that ensures that the current container isn't being passed to itself.
    this._positionCache.siblings = this.connectedTo
      .map(drop => ({drop, clientRect: drop.element.nativeElement.getBoundingClientRect()}));
  }

  /** Resets the container to its initial state. */
  private _reset() {
    this._dragging = false;
    this._positionCache.items = [];
    this._positionCache.siblings = [];
  }
}
