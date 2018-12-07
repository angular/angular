/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken, QueryList, ElementRef} from '@angular/core';
import {CdkDrag} from './directives/drag';


/**
 * @deprecated To be removed. No longer being used. Previously the interface was used to avoid
 * circular imports between `CdkDrag` and `CdkDropList`, however now we're using the
 * `CdkDropListInternal` interface to achieve the same result, without having to maintain
 * this large of an interface.
 * @breaking-change 8.0.0
 */
export interface CdkDropListContainer<T = any> {
  /** DOM node that corresponds to the drop container. */
  element: ElementRef<HTMLElement>;

  /** Arbitrary data to attach to all events emitted by this container. */
  data: T;

  /** Unique ID for the drop zone. */
  id: string;

  /** Direction in which the list is oriented. */
  orientation: 'horizontal' | 'vertical';

  /** Locks the position of the draggable elements inside the container along the specified axis. */
  lockAxis: 'x' | 'y';

  /** Whether starting a dragging sequence from this container is disabled. */
  disabled: boolean;

  /** Starts dragging an item. */
  start(): void;

  /**
   * Drops an item into this container.
   * @param item Item being dropped into the container.
   * @param currentIndex Index at which the item should be inserted.
   * @param previousContainer Container from which the item got dragged in.
   * @param isPointerOverContainer Whether the user's pointer was over the
   *    container when the item was dropped.
   */
  drop(item: CdkDrag, currentIndex: number, previousContainer: Partial<CdkDropListContainer>,
        isPointerOverContainer: boolean): void;

  /**
   * Emits an event to indicate that the user moved an item into the container.
   * @param item Item that was moved into the container.
   * @param pointerX Position of the item along the X axis.
   * @param pointerY Position of the item along the Y axis.
   */
  enter(item: CdkDrag, pointerX: number, pointerY: number): void;

  /**
   * Removes an item from the container after it was dragged into another container by the user.
   * @param item Item that was dragged out.
   */
  exit(item: CdkDrag): void;

  /**
   * Figures out the index of an item in the container.
   * @param item Item whose index should be determined.
   */
  getItemIndex(item: CdkDrag): number;
  _sortItem(item: CdkDrag, pointerX: number, pointerY: number, delta: {x: number, y: number}): void;
  _draggables: QueryList<CdkDrag>;
  _getSiblingContainerFromPosition(item: CdkDrag, x: number, y: number):
      CdkDropListContainer | null;
  _isOverContainer(x: number, y: number): boolean;
}

/**
 * Injection token that is used to provide a CdkDropList instance to CdkDrag.
 * Used for avoiding circular imports.
 */
export const CDK_DROP_LIST = new InjectionToken<CdkDropListContainer>('CDK_DROP_LIST');

/**
 * Injection token that is used to provide a CdkDropList instance to CdkDrag.
 * Used for avoiding circular imports.
 * @deprecated Use `CDK_DROP_LIST` instead.
 * @breaking-change 8.0.0
 */
export const CDK_DROP_LIST_CONTAINER = CDK_DROP_LIST;

