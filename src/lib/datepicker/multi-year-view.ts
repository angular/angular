/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Optional,
  Output,
  ViewEncapsulation
} from '@angular/core';
import {DateAdapter} from '@angular/material/core';
import {MatCalendarCell} from './calendar-body';
import {createMissingDateImplError} from './datepicker-errors';


export const yearsPerPage = 24;

export const yearsPerRow = 4;


/**
 * An internal component used to display a year selector in the datepicker.
 * @docs-private
 */
@Component({
  moduleId: module.id,
  selector: 'mat-multi-year-view',
  templateUrl: 'multi-year-view.html',
  exportAs: 'matMultiYearView',
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatMultiYearView<D> implements AfterContentInit {
  /** The date to display in this multi-year view (everything other than the year is ignored). */
  @Input()
  get activeDate(): D { return this._activeDate; }
  set activeDate(value: D) {
    let oldActiveDate = this._activeDate;
    this._activeDate =
        this._getValidDateOrNull(this._dateAdapter.deserialize(value)) || this._dateAdapter.today();
    if (Math.floor(this._dateAdapter.getYear(oldActiveDate) / yearsPerPage) !=
        Math.floor(this._dateAdapter.getYear(this._activeDate) / yearsPerPage)) {
      this._init();
    }
  }
  private _activeDate: D;

  /** The currently selected date. */
  @Input()
  get selected(): D | null { return this._selected; }
  set selected(value: D | null) {
    this._selected = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
    this._selectedYear = this._selected && this._dateAdapter.getYear(this._selected);
  }
  private _selected: D | null;

  /** A function used to filter which dates are selectable. */
  @Input() dateFilter: (date: D) => boolean;

  /** Emits when a new month is selected. */
  @Output() selectedChange = new EventEmitter<D>();

  /** Grid of calendar cells representing the currently displayed years. */
  _years: MatCalendarCell[][];

  /** The year that today falls on. */
  _todayYear: number;

  /** The year of the selected date. Null if the selected date is null. */
  _selectedYear: number | null;

  constructor(@Optional() public _dateAdapter: DateAdapter<D>,
              private _changeDetectorRef: ChangeDetectorRef) {
    if (!this._dateAdapter) {
      throw createMissingDateImplError('DateAdapter');
    }

    this._activeDate = this._dateAdapter.today();
  }

  ngAfterContentInit() {
    this._init();
  }

  /** Initializes this multi-year view. */
  _init() {
    this._todayYear = this._dateAdapter.getYear(this._dateAdapter.today());
    let activeYear = this._dateAdapter.getYear(this._activeDate);
    let activeOffset = activeYear % yearsPerPage;
    this._years = [];
    for (let i = 0, row: number[] = []; i < yearsPerPage; i++) {
      row.push(activeYear - activeOffset + i);
      if (row.length == yearsPerRow) {
        this._years.push(row.map(year => this._createCellForYear(year)));
        row = [];
      }
    }
    this._changeDetectorRef.markForCheck();
  }

  /** Handles when a new year is selected. */
  _yearSelected(year: number) {
    let month = this._dateAdapter.getMonth(this.activeDate);
    let daysInMonth =
        this._dateAdapter.getNumDaysInMonth(this._dateAdapter.createDate(year, month, 1));
    this.selectedChange.emit(this._dateAdapter.createDate(year, month,
        Math.min(this._dateAdapter.getDate(this.activeDate), daysInMonth)));
  }

  _getActiveCell(): number {
    return this._dateAdapter.getYear(this.activeDate) % yearsPerPage;
  }

  /** Creates an MatCalendarCell for the given year. */
  private _createCellForYear(year: number) {
    let yearName = this._dateAdapter.getYearName(this._dateAdapter.createDate(year, 0, 1));
    return new MatCalendarCell(year, yearName, yearName, true);
  }

  /**
   * @param obj The object to check.
   * @returns The given object if it is both a date instance and valid, otherwise null.
   */
  private _getValidDateOrNull(obj: any): D | null {
    return (this._dateAdapter.isDateInstance(obj) && this._dateAdapter.isValid(obj)) ? obj : null;
  }
}
