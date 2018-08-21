/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CdkDrag} from './drag';
import {CdkDropContainer} from './drop-container';

/** Event emitted when the user starts dragging a draggable. */
export interface CdkDragStart<T = any> {
  /** Draggable that emitted the event. */
  source: CdkDrag<T>;
}

/** Event emitted when the user stops dragging a draggable. */
export interface CdkDragEnd<T = any> {
  /** Draggable that emitted the event. */
  source: CdkDrag<T>;
}

/** Event emitted when the user moves an item into a new drop container. */
export interface CdkDragEnter<T = any, I = T> {
  /** Container into which the user has moved the item. */
  container: CdkDropContainer<T>;
  /** Item that was removed from the container. */
  item: CdkDrag<I>;
}

/**
 * Event emitted when the user removes an item from a
 * drop container by moving it into another one.
 */
export interface CdkDragExit<T = any, I = T> {
  /** Container from which the user has a removed an item. */
  container: CdkDropContainer<T>;
  /** Item that was removed from the container. */
  item: CdkDrag<I>;
}


/** Event emitted when the user drops a draggable item inside a drop container. */
export interface CdkDragDrop<T, O = T> {
  /** Index of the item when it was picked up. */
  previousIndex: number;
  /** Current index of the item. */
  currentIndex: number;
  /** Item that is being dropped. */
  item: CdkDrag;
  /** Container in which the item was dropped. */
  container: CdkDropContainer<T>;
  /** Container from which the item was picked up. Can be the same as the `container`. */
  previousContainer: CdkDropContainer<O>;
}

/** Event emitted as the user is dragging a draggable item. */
export interface CdkDragMove<T = any> {
  /** Item that is being dragged. */
  source: CdkDrag<T>;
  /** Position of the user's pointer on the page. */
  pointerPosition: {x: number, y: number};
  /** Native event that is causing the dragging. */
  event: MouseEvent | TouchEvent;
}
