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
  Inject,
  OnDestroy,
  Optional,
  ViewChild,
  ViewEncapsulation,
  Directive,
  Injectable,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MatDateFormats,
  ThemePalette,
  MatNativeDateModule,
} from '@angular/material/core';
import {
  MatCalendar,
  MatCalendarHeader,
  MatDatepickerInputEvent,
  MAT_DATE_RANGE_SELECTION_STRATEGY,
  MatDateRangeSelectionStrategy,
  DateRange,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import {MatLegacyFormFieldModule} from '@angular/material/legacy-form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyInputModule} from '@angular/material/legacy-input';
import {MatSelectModule} from '@angular/material/select';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

/** Range selection strategy that preserves the current range. */
@Injectable()
export class PreserveRangeStrategy<D> implements MatDateRangeSelectionStrategy<D> {
  constructor(private _dateAdapter: DateAdapter<D>) {}

  selectionFinished(date: D, currentRange: DateRange<D>) {
    let {start, end} = currentRange;

    if (start && end) {
      return this._getRangeRelativeToDate(date, start, end);
    }

    if (start == null) {
      start = date;
    } else if (end == null) {
      end = date;
    }

    return new DateRange<D>(start, end);
  }

  createPreview(activeDate: D | null, currentRange: DateRange<D>): DateRange<D> {
    if (activeDate) {
      if (currentRange.start && currentRange.end) {
        return this._getRangeRelativeToDate(activeDate, currentRange.start, currentRange.end);
      } else if (currentRange.start && !currentRange.end) {
        return new DateRange(currentRange.start, activeDate);
      }
    }

    return new DateRange<D>(null, null);
  }

  private _getRangeRelativeToDate(date: D | null, start: D, end: D): DateRange<D> {
    let rangeStart: D | null = null;
    let rangeEnd: D | null = null;

    if (date) {
      const delta = Math.round(Math.abs(this._dateAdapter.compareDate(start, end)) / 2);
      rangeStart = this._dateAdapter.addCalendarDays(date, -delta);
      rangeEnd = this._dateAdapter.addCalendarDays(date, delta);
    }

    return new DateRange(rangeStart, rangeEnd);
  }
}

@Directive({
  selector: '[customRangeStrategy]',
  standalone: true,
  providers: [
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: PreserveRangeStrategy,
    },
  ],
})
export class CustomRangeStrategy {}

// Custom header component for datepicker
@Component({
  selector: 'custom-header',
  templateUrl: 'custom-header.html',
  styleUrls: ['custom-header.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatIconModule],
})
export class CustomHeader<D> implements OnDestroy {
  private readonly _destroyed = new Subject<void>();

  constructor(
    private _calendar: MatCalendar<D>,
    private _dateAdapter: DateAdapter<D>,
    @Inject(MAT_DATE_FORMATS) private _dateFormats: MatDateFormats,
    cdr: ChangeDetectorRef,
  ) {
    _calendar.stateChanges.pipe(takeUntil(this._destroyed)).subscribe(() => cdr.markForCheck());
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  get periodLabel() {
    return this._dateAdapter
      .format(this._calendar.activeDate, this._dateFormats.display.monthYearLabel)
      .toLocaleUpperCase();
  }

  previousClicked(mode: 'month' | 'year') {
    this._calendar.activeDate =
      mode === 'month'
        ? this._dateAdapter.addCalendarMonths(this._calendar.activeDate, -1)
        : this._dateAdapter.addCalendarYears(this._calendar.activeDate, -1);
  }

  nextClicked(mode: 'month' | 'year') {
    this._calendar.activeDate =
      mode === 'month'
        ? this._dateAdapter.addCalendarMonths(this._calendar.activeDate, 1)
        : this._dateAdapter.addCalendarYears(this._calendar.activeDate, 1);
  }
}

@Component({
  selector: 'customer-header-ng-content',
  template: `
      <mat-calendar-header #header>
        <button mat-button type="button" (click)="todayClicked()">TODAY</button>
      </mat-calendar-header>
    `,
  standalone: true,
  imports: [MatDatepickerModule],
})
export class CustomHeaderNgContent<D> {
  @ViewChild(MatCalendarHeader)
  header: MatCalendarHeader<D>;

  constructor(@Optional() private _dateAdapter: DateAdapter<D>) {}

  todayClicked() {
    let calendar = this.header.calendar;

    calendar.activeDate = this._dateAdapter.today();
    calendar.currentView = 'month';
  }
}

@Component({
  selector: 'datepicker-demo',
  templateUrl: 'datepicker-demo.html',
  styleUrls: ['datepicker-demo.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatLegacyFormFieldModule,
    MatIconModule,
    MatLegacyInputModule,
    MatNativeDateModule,
    MatSelectModule,
    ReactiveFormsModule,
    CustomHeader,
    CustomHeaderNgContent,
    CustomRangeStrategy,
  ],
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
  date: any;
  lastDateInput: Date | null;
  lastDateChange: Date | null;
  color: ThemePalette;
  showActions = false;

  dateCtrl = new FormControl<Date | null>(null);
  range1 = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
  range2 = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
  range3 = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
  comparisonStart: Date;
  comparisonEnd: Date;

  constructor() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    this.comparisonStart = new Date(year, month, 9);
    this.comparisonEnd = new Date(year, month, 13);
  }

  dateFilter: (date: Date | null) => boolean = (date: Date | null) => {
    if (date === null) {
      return true;
    }
    return !(date.getFullYear() % 2) && Boolean(date.getMonth() % 2) && !(date.getDate() % 2);
  };

  onDateInput = (e: MatDatepickerInputEvent<Date>) => (this.lastDateInput = e.value);
  onDateChange = (e: MatDatepickerInputEvent<Date>) => (this.lastDateChange = e.value);

  // pass custom header component type as input
  customHeader = CustomHeader;
  customHeaderNgContent = CustomHeaderNgContent;
}
