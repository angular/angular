/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';

/** Indicates the width of a column. */
export interface ColumnSize {
  /** The ID/name of the column, as defined in CdkColumnDef. */
  readonly columnId: string;

  /** The width in pixels of the column. */
  readonly size: number;

  /** The width in pixels of the column prior to this update, if known. */
  readonly previousSize?: number;
}

/** Interface describing column size changes. */
export interface ColumnSizeAction extends ColumnSize {
  /**
   * Whether the resize action should be applied instantaneously. False for events triggered during
   * a UI-triggered resize (such as with the mouse) until the mouse button is released. True
   * for all programmatically triggered resizes.
   */
  readonly completeImmediately?: boolean;

  /**
   * Whether the resize action is being applied to a sticky/stickyEnd column.
   */
  readonly isStickyColumn?: boolean;
}

/**
 * Originating source of column resize events within a table.
 * @docs-private
 */
@Injectable()
export class ColumnResizeNotifierSource {
  /** Emits when an in-progress resize is canceled. */
  readonly resizeCanceled = new Subject<ColumnSizeAction>();

  /** Emits when a resize is applied. */
  readonly resizeCompleted = new Subject<ColumnSize>();

  /** Triggers a resize action. */
  readonly triggerResize = new Subject<ColumnSizeAction>();
}

/** Service for triggering column resizes imperatively or being notified of them. */
@Injectable()
export class ColumnResizeNotifier {
  /** Emits whenever a column is resized. */
  readonly resizeCompleted: Observable<ColumnSize> = this._source.resizeCompleted;

  constructor(private readonly _source: ColumnResizeNotifierSource) {}

  /** Instantly resizes the specified column. */
  resize(columnId: string, size: number): void {
    this._source.triggerResize.next({
      columnId,
      size,
      completeImmediately: true,
      isStickyColumn: true,
    });
  }
}
