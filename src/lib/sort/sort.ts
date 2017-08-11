/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, EventEmitter, Input, Output} from '@angular/core';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {SortDirection} from './sort-direction';
import {getMdSortDuplicateMdSortableIdError, getMdSortHeaderMissingIdError} from './sort-errors';

export interface MdSortable {
  id: string;
  start: 'asc' | 'desc';
  disableClear: boolean;
}

export interface Sort {
  active: string;
  direction: SortDirection;
}

/** Container for MdSortables to manage the sort state and provide default sort parameters. */
@Directive({
  selector: '[mdSort], [matSort]',
})
export class MdSort {
  /** Collection of all registered sortables that this directive manages. */
  sortables = new Map<string, MdSortable>();

  /** The id of the most recently sorted MdSortable. */
  @Input('mdSortActive') active: string;

  /**
   * The direction to set when an MdSortable is initially sorted.
   * May be overriden by the MdSortable's sort start.
   */
  @Input('mdSortStart') start: 'asc' | 'desc' = 'asc';

  /** The sort direction of the currently active MdSortable. */
  @Input('mdSortDirection') direction: SortDirection = '';

  /**
   * Whether to disable the user from clearing the sort by finishing the sort direction cycle.
   * May be overriden by the MdSortable's disable clear input.
   */
  @Input('mdSortDisableClear')
  get disableClear() { return this._disableClear; }
  set disableClear(v) { this._disableClear = coerceBooleanProperty(v); }
  private _disableClear: boolean;

  // Properties with `mat-` prefix for noconflict mode.
  @Input('matSortActive')
  get _matSortActive() { return this.active; }
  set _matSortActive(v) { this.active = v; }

  // Properties with `mat-` prefix for noconflict mode.
  @Input('matSortStart')
  get _matSortStart() { return this.start; }
  set _matSortStart(v) { this.start = v; }

  // Properties with `mat-` prefix for noconflict mode.
  @Input('matSortDirection')
  get _matSortDirection() { return this.direction; }
  set _matSortDirection(v) { this.direction = v; }

  // Properties with `mat-` prefix for noconflict mode.
  @Input('matSortDisableClear')
  get _matSortDisableClear() { return this.disableClear; }
  set _matSortDisableClear(v) { this.disableClear = v; }

  /** Event emitted when the user changes either the active sort or sort direction. */
  @Output() mdSortChange = new EventEmitter<Sort>();

  /**
   * Register function to be used by the contained MdSortables. Adds the MdSortable to the
   * collection of MdSortables.
   */
  register(sortable: MdSortable) {
    if (!sortable.id) {
      throw getMdSortHeaderMissingIdError();
    }

    if (this.sortables.has(sortable.id)) {
      throw getMdSortDuplicateMdSortableIdError(sortable.id);
    }
    this.sortables.set(sortable.id, sortable);
  }

  /**
   * Unregister function to be used by the contained MdSortables. Removes the MdSortable from the
   * collection of contained MdSortables.
   */
  deregister(sortable: MdSortable) {
    this.sortables.delete(sortable.id);
  }

  /** Sets the active sort id and determines the new sort direction. */
  sort(sortable: MdSortable) {
    if (this.active != sortable.id) {
      this.active = sortable.id;
      this.direction = sortable.start ? sortable.start : this.start;
    } else {
      this.direction = this.getNextSortDirection(sortable);
    }

    this.mdSortChange.next({active: this.active, direction: this.direction});
  }

  /** Returns the next sort direction of the active sortable, checking for potential overrides. */
  getNextSortDirection(sortable: MdSortable): SortDirection {
    if (!sortable) { return ''; }

    // Get the sort direction cycle with the potential sortable overrides.
    const disableClear = sortable.disableClear != null ? sortable.disableClear : this.disableClear;
    let sortDirectionCycle = getSortDirectionCycle(sortable.start || this.start, disableClear);

    // Get and return the next direction in the cycle
    let nextDirectionIndex = sortDirectionCycle.indexOf(this.direction) + 1;
    if (nextDirectionIndex >= sortDirectionCycle.length) { nextDirectionIndex = 0; }
    return sortDirectionCycle[nextDirectionIndex];
  }
}

/** Returns the sort direction cycle to use given the provided parameters of order and clear. */
function getSortDirectionCycle(start: 'asc' | 'desc',
                               disableClear: boolean): SortDirection[] {
  let sortOrder: SortDirection[] = ['asc', 'desc'];
  if (start == 'desc') { sortOrder.reverse(); }
  if (!disableClear) { sortOrder.push(''); }

  return sortOrder;
}
