/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, NgZone} from '@angular/core';
import {combineLatest, MonoTypeOperatorFunction, Observable, Subject} from 'rxjs';
import {distinctUntilChanged, map, share, skip, startWith} from 'rxjs/operators';

import {_closest} from '@angular/cdk-experimental/popover-edit';

import {HEADER_ROW_SELECTOR} from './selectors';

/** Coordinates events between the column resize directives. */
@Injectable()
export class HeaderRowEventDispatcher {
  /**
   * Emits the currently hovered header cell or null when no header cells are hovered.
   * Exposed publicly for events to feed in, but subscribers should use headerCellHoveredDistinct,
   * defined below.
   */
  readonly headerCellHovered = new Subject<Element | null>();

  /**
   * Emits the header cell for which a user-triggered resize is active or null
   * when no resize is in progress.
   */
  readonly overlayHandleActiveForCell = new Subject<Element | null>();

  constructor(private readonly _ngZone: NgZone) {}

  /** Distinct and shared version of headerCellHovered. */
  readonly headerCellHoveredDistinct = this.headerCellHovered.pipe(distinctUntilChanged(), share());

  /**
   * Emits the header that is currently hovered or hosting an active resize event (with active
   * taking precedence).
   */
  readonly headerRowHoveredOrActiveDistinct = combineLatest([
    this.headerCellHoveredDistinct.pipe(
      map(cell => _closest(cell, HEADER_ROW_SELECTOR)),
      startWith(null),
      distinctUntilChanged(),
    ),
    this.overlayHandleActiveForCell.pipe(
      map(cell => _closest(cell, HEADER_ROW_SELECTOR)),
      startWith(null),
      distinctUntilChanged(),
    ),
  ]).pipe(
    skip(1), // Ignore initial [null, null] emission.
    map(([hovered, active]) => active || hovered),
    distinctUntilChanged(),
    share(),
  );

  private readonly _headerRowHoveredOrActiveDistinctReenterZone =
    this.headerRowHoveredOrActiveDistinct.pipe(this._enterZone(), share());

  // Optimization: Share row events observable with subsequent callers.
  // At startup, calls will be sequential by row (and typically there's only one).
  private _lastSeenRow: Element | null = null;
  private _lastSeenRowHover: Observable<boolean> | null = null;

  /**
   * Emits whether the specified row should show its overlay controls.
   * Emission occurs within the NgZone.
   */
  resizeOverlayVisibleForHeaderRow(row: Element): Observable<boolean> {
    if (row !== this._lastSeenRow) {
      this._lastSeenRow = row;
      this._lastSeenRowHover = this._headerRowHoveredOrActiveDistinctReenterZone.pipe(
        map(hoveredRow => hoveredRow === row),
        distinctUntilChanged(),
        share(),
      );
    }

    return this._lastSeenRowHover!;
  }

  private _enterZone<T>(): MonoTypeOperatorFunction<T> {
    return (source: Observable<T>) =>
      new Observable<T>(observer =>
        source.subscribe({
          next: value => this._ngZone.run(() => observer.next(value)),
          error: err => observer.error(err),
          complete: () => observer.complete(),
        }),
      );
  }
}
