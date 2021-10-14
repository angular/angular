/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '@angular/core';
import {DragRefConfig, Point, DragRef} from '../drag-ref';

/** Possible values that can be used to configure the drag start delay. */
export type DragStartDelay = number | {touch: number; mouse: number};

/** Possible axis along which dragging can be locked. */
export type DragAxis = 'x' | 'y';

/** Function that can be used to constrain the position of a dragged element. */
export type DragConstrainPosition = (point: Point, dragRef: DragRef) => Point;

/** Possible orientations for a drop list. */
export type DropListOrientation = 'horizontal' | 'vertical';

/**
 * Injection token that can be used to configure the
 * behavior of the drag&drop-related components.
 */
export const CDK_DRAG_CONFIG = new InjectionToken<DragDropConfig>('CDK_DRAG_CONFIG');

/**
 * Object that can be used to configure the drag
 * items and drop lists within a module or a component.
 */
export interface DragDropConfig extends Partial<DragRefConfig> {
  lockAxis?: DragAxis;
  dragStartDelay?: DragStartDelay;
  constrainPosition?: DragConstrainPosition;
  previewClass?: string | string[];
  boundaryElement?: string;
  rootElementSelector?: string;
  draggingDisabled?: boolean;
  sortingDisabled?: boolean;
  listAutoScrollDisabled?: boolean;
  listOrientation?: DropListOrientation;
  zIndex?: number;
  previewContainer?: 'global' | 'parent';
}
