/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component, Host} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';
import {DateAdapter} from '@angular/material/core';
import {MatCalendar} from '@angular/material';
import {ThemePalette} from '@angular/material/core';

@Component({
  moduleId: module.id,
  selector: 'datepicker-demo',
  templateUrl: 'datepicker-demo.html',
  styleUrls: ['datepicker-demo.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerDemo {
  touch: boolean;
  filterOdd: boolean;
  yearView: boolean;
  inputDisabled: boolean;
  datepickerDisabled: boolean;
  minDate: Date;
  maxDate: Date;
  startAt: Date;
  date: Date;
  lastDateInput: Date | null;
  lastDateChange: Date | null;
  color: ThemePalette;

  dateCtrl = new FormControl();

  dateFilter =
      (date: Date) => !(date.getFullYear() % 2) && (date.getMonth() % 2) && !(date.getDate() % 2)

  onDateInput = (e: MatDatepickerInputEvent<Date>) => this.lastDateInput = e.value;
  onDateChange = (e: MatDatepickerInputEvent<Date>) => this.lastDateChange = e.value;

  // pass custom header component type as input
  customHeader = CustomHeader;
}

// Custom header component for datepicker
@Component({
  moduleId: module.id,
  selector: 'custom-header',
  templateUrl: 'custom-header.html',
  styleUrls: ['custom-header.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomHeader<D> {
  constructor(@Host() private _calendar: MatCalendar<D>,
              private _dateAdapter: DateAdapter<D>) {}

  get periodLabel() {
    const year = this._dateAdapter.getYearName(this._calendar.activeDate);
    const month = (this._dateAdapter.getMonth(this._calendar.activeDate) + 1);
    return `${month}/${year}`;
  }

  previousClicked(mode: 'month' | 'year') {
    this._calendar.activeDate = mode == 'month' ?
        this._dateAdapter.addCalendarMonths(this._calendar.activeDate, -1) :
            this._dateAdapter.addCalendarYears(this._calendar.activeDate, -1);
  }

  nextClicked(mode: 'month' | 'year') {
    this._calendar.activeDate = mode == 'month' ?
        this._dateAdapter.addCalendarMonths(this._calendar.activeDate, 1) :
            this._dateAdapter.addCalendarYears(this._calendar.activeDate, 1);
  }
}
