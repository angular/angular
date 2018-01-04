/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  Optional,
  ViewEncapsulation
} from '@angular/core';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {CdkColumnDef} from '@angular/cdk/table';
import {Subscription} from 'rxjs/Subscription';
import {merge} from 'rxjs/observable/merge';
import {MatSort, MatSortable} from './sort';
import {MatSortHeaderIntl} from './sort-header-intl';
import {getSortHeaderNotContainedWithinSortError} from './sort-errors';
import {CanDisable, mixinDisabled} from '@angular/material/core';
import {matSortAnimations} from './sort-animations';

// Boilerplate for applying mixins to the sort header.
/** @docs-private */
export class MatSortHeaderBase {}
export const _MatSortHeaderMixinBase = mixinDisabled(MatSortHeaderBase);


/**
 * Applies sorting behavior (click to change sort) and styles to an element, including an
 * arrow to display the current sort direction.
 *
 * Must be provided with an id and contained within a parent MatSort directive.
 *
 * If used on header cells in a CdkTable, it will automatically default its id from its containing
 * column definition.
 */
@Component({
  moduleId: module.id,
  selector: '[mat-sort-header]',
  exportAs: 'matSortHeader',
  templateUrl: 'sort-header.html',
  styleUrls: ['sort-header.css'],
  host: {
    '(click)': '_handleClick()',
    '[class.mat-sort-header-sorted]': '_isSorted()',
    '[class.mat-sort-header-disabled]': '_isDisabled()',
  },
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  inputs: ['disabled'],
  animations: [
    matSortAnimations.indicator,
    matSortAnimations.leftPointer,
    matSortAnimations.rightPointer,
    matSortAnimations.indicatorToggle
  ]
})
export class MatSortHeader extends _MatSortHeaderMixinBase implements MatSortable, CanDisable {
  private _rerenderSubscription: Subscription;

  /**
   * ID of this sort header. If used within the context of a CdkColumnDef, this will default to
   * the column's name.
   */
  @Input('mat-sort-header') id: string;

  /** Sets the position of the arrow that displays when sorted. */
  @Input() arrowPosition: 'before' | 'after' = 'after';

  /** Overrides the sort start value of the containing MatSort for this MatSortable. */
  @Input('start') start: 'asc' | 'desc';

  /** Overrides the disable clear value of the containing MatSort for this MatSortable. */
  @Input()
  get disableClear(): boolean { return this._disableClear; }
  set disableClear(v) { this._disableClear = coerceBooleanProperty(v); }
  private _disableClear: boolean;

  constructor(public _intl: MatSortHeaderIntl,
              changeDetectorRef: ChangeDetectorRef,
              @Optional() public _sort: MatSort,
              @Optional() public _cdkColumnDef: CdkColumnDef) {

    super();

    if (!_sort) {
      throw getSortHeaderNotContainedWithinSortError();
    }

    this._rerenderSubscription = merge(_sort.sortChange, _sort._stateChanges, _intl.changes)
      .subscribe(() => changeDetectorRef.markForCheck());
  }

  ngOnInit() {
    if (!this.id && this._cdkColumnDef) {
      this.id = this._cdkColumnDef.name;
    }

    this._sort.register(this);
  }

  ngOnDestroy() {
    this._sort.deregister(this);
    this._rerenderSubscription.unsubscribe();
  }

  /** Handles click events on the header. */
  _handleClick() {
    if (!this._isDisabled()) {
      this._sort.sort(this);
    }
  }

  /** Whether this MatSortHeader is currently sorted in either ascending or descending order. */
  _isSorted() {
    return this._sort.active == this.id &&
        (this._sort.direction === 'asc' || this._sort.direction === 'desc');
  }

  _isDisabled() {
    return this._sort.disabled || this.disabled;
  }
}
