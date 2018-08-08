/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken, QueryList} from '@angular/core';
import {CdkDrag} from './drag';

export interface CdkDropContainer<T = any> {
  /** Arbitrary data to attach to all events emitted by this container. */
  data: T;

  /** Unique ID for the drop zone. */
  id: string;

  /** Direction in which the list is oriented. */
  orientation: 'horizontal' | 'vertical';

  /** Starts dragging an item. */
  start(): void;

  /**
   * Drops an item into this container.
   * @param item Item being dropped into the container.
   * @param currentIndex Index at which the item should be inserted.
   * @param previousContainer Container from which the item got dragged in.
   */
  drop(item: CdkDrag, currentIndex: number, previousContainer?: CdkDropContainer): void;

  /**
   * Emits an event to indicate that the user moved an item into the container.
   * @param item Item that was moved into the container.
   * @param xOffset Position of the item along the X axis.
   * @param yOffset Position of the item along the Y axis.
   */
  enter(item: CdkDrag, xOffset: number, yOffset: number): void;

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
  _sortItem(item: CdkDrag, xOffset: number, yOffset: number): void;
  _draggables: QueryList<CdkDrag>;
  _getSiblingContainerFromPosition(x: number, y: number): CdkDropContainer | null;
}

/**
 * Injection token that is used to provide a CdkDrop instance to CdkDrag.
 * Used for avoiding circular imports.
 */
export const CDK_DROP_CONTAINER = new InjectionToken<CdkDropContainer>('CDK_DROP_CONTAINER');
