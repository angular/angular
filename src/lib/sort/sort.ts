/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Directive,
  EventEmitter,
  Input,
  isDevMode,
  Output,
  OnChanges,
  OnDestroy,
} from '@angular/core';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {CanDisable, mixinDisabled} from '@angular/material/core';
import {SortDirection} from './sort-direction';
import {
  getSortInvalidDirectionError,
  getSortDuplicateSortableIdError,
  getSortHeaderMissingIdError
} from './sort-errors';
import {Subject} from 'rxjs/Subject';

/** Interface for a directive that holds sorting state consumed by `MatSortHeader`. */
export interface MatSortable {
  /** The id of the column being sorted. */
  id: string;

  /** Starting sort direction. */
  start: 'asc' | 'desc';

  /** Whether to disable clearing the sorting state. */
  disableClear: boolean;
}

/** The current sort state. */
export interface Sort {
  /** The id of the column being sorted. */
  active: string;

  /** The sort direction. */
  direction: SortDirection;
}

// Boilerplate for applying mixins to MatSort.
/** @docs-private */
export class MatSortBase {}
export const _MatSortMixinBase = mixinDisabled(MatSortBase);

/** Container for MatSortables to manage the sort state and provide default sort parameters. */
@Directive({
  selector: '[matSort]',
  exportAs: 'matSort',
  inputs: ['disabled: matSortDisabled']
})
export class MatSort extends _MatSortMixinBase implements CanDisable, OnChanges, OnDestroy {
  /** Collection of all registered sortables that this directive manages. */
  sortables = new Map<string, MatSortable>();

  /** Used to notify any child components listening to state changes. */
  _stateChanges = new Subject<void>();

  /** The id of the most recently sorted MatSortable. */
  @Input('matSortActive') active: string;

  /**
   * The direction to set when an MatSortable is initially sorted.
   * May be overriden by the MatSortable's sort start.
   */
  @Input('matSortStart') start: 'asc' | 'desc' = 'asc';

  /** The sort direction of the currently active MatSortable. */
  @Input('matSortDirection')
  set direction(direction: SortDirection) {
    if (isDevMode() && direction && direction !== 'asc' && direction !== 'desc') {
      throw getSortInvalidDirectionError(direction);
    }
    this._direction = direction;
  }
  get direction(): SortDirection { return this._direction; }
  private _direction: SortDirection = '';

  /**
   * Whether to disable the user from clearing the sort by finishing the sort direction cycle.
   * May be overriden by the MatSortable's disable clear input.
   */
  @Input('matSortDisableClear')
  get disableClear() { return this._disableClear; }
  set disableClear(v: boolean) { this._disableClear = coerceBooleanProperty(v); }
  private _disableClear: boolean;

  /** Event emitted when the user changes either the active sort or sort direction. */
  @Output('matSortChange') readonly sortChange = new EventEmitter<Sort>();

  /**
   * Register function to be used by the contained MatSortables. Adds the MatSortable to the
   * collection of MatSortables.
   */
  register(sortable: MatSortable) {
    if (!sortable.id) {
      throw getSortHeaderMissingIdError();
    }

    if (this.sortables.has(sortable.id)) {
      throw getSortDuplicateSortableIdError(sortable.id);
    }
    this.sortables.set(sortable.id, sortable);
  }

  /**
   * Unregister function to be used by the contained MatSortables. Removes the MatSortable from the
   * collection of contained MatSortables.
   */
  deregister(sortable: MatSortable) {
    this.sortables.delete(sortable.id);
  }

  /** Sets the active sort id and determines the new sort direction. */
  sort(sortable: MatSortable) {
    if (this.active != sortable.id) {
      this.active = sortable.id;
      this.direction = sortable.start ? sortable.start : this.start;
    } else {
      this.direction = this.getNextSortDirection(sortable);
    }

    this.sortChange.next({active: this.active, direction: this.direction});
  }

  /** Returns the next sort direction of the active sortable, checking for potential overrides. */
  getNextSortDirection(sortable: MatSortable): SortDirection {
    if (!sortable) { return ''; }

    // Get the sort direction cycle with the potential sortable overrides.
    const disableClear = sortable.disableClear != null ? sortable.disableClear : this.disableClear;
    let sortDirectionCycle = getSortDirectionCycle(sortable.start || this.start, disableClear);

    // Get and return the next direction in the cycle
    let nextDirectionIndex = sortDirectionCycle.indexOf(this.direction) + 1;
    if (nextDirectionIndex >= sortDirectionCycle.length) { nextDirectionIndex = 0; }
    return sortDirectionCycle[nextDirectionIndex];
  }

  ngOnChanges() {
    this._stateChanges.next();
  }

  ngOnDestroy() {
    this._stateChanges.complete();
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
