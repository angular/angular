/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  DOWN_ARROW,
  END,
  ENTER,
  HOME,
  LEFT_ARROW,
  PAGE_DOWN,
  PAGE_UP,
  RIGHT_ARROW,
  UP_ARROW,
} from '@angular/cdk/keycodes';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Optional,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {DateAdapter, MAT_DATE_FORMATS, MatDateFormats} from '@angular/material/core';
import {take} from 'rxjs/operators/take';
import {Subscription} from 'rxjs/Subscription';
import {createMissingDateImplError} from './datepicker-errors';
import {MatDatepickerIntl} from './datepicker-intl';
import {MatMonthView} from './month-view';
import {MatMultiYearView, yearsPerPage, yearsPerRow} from './multi-year-view';
import {MatYearView} from './year-view';
import {Directionality} from '@angular/cdk/bidi';


/**
 * A calendar that is used as part of the datepicker.
 * @docs-private
 */
@Component({
  moduleId: module.id,
  selector: 'mat-calendar',
  templateUrl: 'calendar.html',
  styleUrls: ['calendar.css'],
  host: {
    'class': 'mat-calendar',
  },
  exportAs: 'matCalendar',
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatCalendar<D> implements AfterContentInit, OnDestroy, OnChanges {
  private _intlChanges: Subscription;

  /** A date representing the period (month or year) to start the calendar in. */
  @Input()
  get startAt(): D | null { return this._startAt; }
  set startAt(value: D | null) {
    this._startAt = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
  }
  private _startAt: D | null;

  /** Whether the calendar should be started in month or year view. */
  @Input() startView: 'month' | 'year' | 'multi-year' = 'month';

  /** The currently selected date. */
  @Input()
  get selected(): D | null { return this._selected; }
  set selected(value: D | null) {
    this._selected = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
  }
  private _selected: D | null;

  /** The minimum selectable date. */
  @Input()
  get minDate(): D | null { return this._minDate; }
  set minDate(value: D | null) {
    this._minDate = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
  }
  private _minDate: D | null;

  /** The maximum selectable date. */
  @Input()
  get maxDate(): D | null { return this._maxDate; }
  set maxDate(value: D | null) {
    this._maxDate = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
  }
  private _maxDate: D | null;

  /** A function used to filter which dates are selectable. */
  @Input() dateFilter: (date: D) => boolean;

  /** Emits when the currently selected date changes. */
  @Output() readonly selectedChange = new EventEmitter<D>();

  /** Emits when any date is selected. */
  @Output() readonly _userSelection = new EventEmitter<void>();

  /** Reference to the current month view component. */
  @ViewChild(MatMonthView) monthView: MatMonthView<D>;

  /** Reference to the current year view component. */
  @ViewChild(MatYearView) yearView: MatYearView<D>;

  /** Reference to the current multi-year view component. */
  @ViewChild(MatMultiYearView) multiYearView: MatMultiYearView<D>;

  /** Date filter for the month, year, and multi-year views. */
  _dateFilterForViews = (date: D) => {
    return !!date &&
        (!this.dateFilter || this.dateFilter(date)) &&
        (!this.minDate || this._dateAdapter.compareDate(date, this.minDate) >= 0) &&
        (!this.maxDate || this._dateAdapter.compareDate(date, this.maxDate) <= 0);
  }

  /**
   * The current active date. This determines which time period is shown and which date is
   * highlighted when using keyboard navigation.
   */
  get _activeDate(): D { return this._clampedActiveDate; }
  set _activeDate(value: D) {
    this._clampedActiveDate = this._dateAdapter.clampDate(value, this.minDate, this.maxDate);
  }
  private _clampedActiveDate: D;

  /** Whether the calendar is in month view. */
  _currentView: 'month' | 'year' | 'multi-year';

  /** The label for the current calendar view. */
  get _periodButtonText(): string {
    if (this._currentView == 'month') {
      return this._dateAdapter.format(this._activeDate, this._dateFormats.display.monthYearLabel)
          .toLocaleUpperCase();
    }
    if (this._currentView == 'year') {
      return this._dateAdapter.getYearName(this._activeDate);
    }
    const activeYear = this._dateAdapter.getYear(this._activeDate);
    const firstYearInView = this._dateAdapter.getYearName(
        this._dateAdapter.createDate(activeYear - activeYear % 24, 0, 1));
    const lastYearInView = this._dateAdapter.getYearName(
        this._dateAdapter.createDate(activeYear + yearsPerPage - 1 - activeYear % 24, 0, 1));
    return `${firstYearInView} \u2013 ${lastYearInView}`;
  }

  get _periodButtonLabel(): string {
    return this._currentView == 'month' ?
        this._intl.switchToMultiYearViewLabel : this._intl.switchToMonthViewLabel;
  }

  /** The label for the the previous button. */
  get _prevButtonLabel(): string {
    return {
      'month': this._intl.prevMonthLabel,
      'year': this._intl.prevYearLabel,
      'multi-year': this._intl.prevMultiYearLabel
    }[this._currentView];
  }

  /** The label for the the next button. */
  get _nextButtonLabel(): string {
    return {
      'month': this._intl.nextMonthLabel,
      'year': this._intl.nextYearLabel,
      'multi-year': this._intl.nextMultiYearLabel
    }[this._currentView];
  }

  constructor(private _elementRef: ElementRef,
              private _intl: MatDatepickerIntl,
              private _ngZone: NgZone,
              @Optional() private _dateAdapter: DateAdapter<D>,
              @Optional() @Inject(MAT_DATE_FORMATS) private _dateFormats: MatDateFormats,
              changeDetectorRef: ChangeDetectorRef,
              @Optional() private _dir?: Directionality) {

    if (!this._dateAdapter) {
      throw createMissingDateImplError('DateAdapter');
    }

    if (!this._dateFormats) {
      throw createMissingDateImplError('MAT_DATE_FORMATS');
    }

    this._intlChanges = _intl.changes.subscribe(() => changeDetectorRef.markForCheck());
  }

  ngAfterContentInit() {
    this._activeDate = this.startAt || this._dateAdapter.today();
    this._focusActiveCell();
    this._currentView = this.startView;
  }

  ngOnDestroy() {
    this._intlChanges.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    const change = changes.minDate || changes.maxDate || changes.dateFilter;

    if (change && !change.firstChange) {
      const view = this.monthView || this.yearView || this.multiYearView;

      if (view) {
        view._init();
      }
    }
  }

  /** Handles date selection in the month view. */
  _dateSelected(date: D): void {
    if (!this._dateAdapter.sameDate(date, this.selected)) {
      this.selectedChange.emit(date);
    }
  }

  _userSelected(): void {
    this._userSelection.emit();
  }

  /** Handles month selection in the multi-year view. */
  _goToDateInView(date: D, view: 'month' | 'year' | 'multi-year'): void {
    this._activeDate = date;
    this._currentView = view;
  }

  /** Handles user clicks on the period label. */
  _currentPeriodClicked(): void {
    this._currentView = this._currentView == 'month' ? 'multi-year' : 'month';
  }

  /** Handles user clicks on the previous button. */
  _previousClicked(): void {
    this._activeDate = this._currentView == 'month' ?
        this._dateAdapter.addCalendarMonths(this._activeDate, -1) :
        this._dateAdapter.addCalendarYears(
            this._activeDate, this._currentView == 'year' ? -1 : -yearsPerPage);
  }

  /** Handles user clicks on the next button. */
  _nextClicked(): void {
    this._activeDate = this._currentView == 'month' ?
        this._dateAdapter.addCalendarMonths(this._activeDate, 1) :
        this._dateAdapter.addCalendarYears(
            this._activeDate, this._currentView == 'year' ? 1 : yearsPerPage);
  }

  /** Whether the previous period button is enabled. */
  _previousEnabled(): boolean {
    if (!this.minDate) {
      return true;
    }
    return !this.minDate || !this._isSameView(this._activeDate, this.minDate);
  }

  /** Whether the next period button is enabled. */
  _nextEnabled(): boolean {
    return !this.maxDate || !this._isSameView(this._activeDate, this.maxDate);
  }

  /** Handles keydown events on the calendar body. */
  _handleCalendarBodyKeydown(event: KeyboardEvent): void {
    // TODO(mmalerba): We currently allow keyboard navigation to disabled dates, but just prevent
    // disabled ones from being selected. This may not be ideal, we should look into whether
    // navigation should skip over disabled dates, and if so, how to implement that efficiently.
    if (this._currentView == 'month') {
      this._handleCalendarBodyKeydownInMonthView(event);
    } else if (this._currentView == 'year') {
      this._handleCalendarBodyKeydownInYearView(event);
    } else {
      this._handleCalendarBodyKeydownInMultiYearView(event);
    }
  }

  /** Focuses the active cell after the microtask queue is empty. */
  _focusActiveCell() {
    this._ngZone.runOutsideAngular(() => {
      this._ngZone.onStable.asObservable().pipe(take(1)).subscribe(() => {
        this._elementRef.nativeElement.querySelector('.mat-calendar-body-active').focus();
      });
    });
  }

  /** Whether the two dates represent the same view in the current view mode (month or year). */
  private _isSameView(date1: D, date2: D): boolean {
    if (this._currentView == 'month') {
      return this._dateAdapter.getYear(date1) == this._dateAdapter.getYear(date2) &&
          this._dateAdapter.getMonth(date1) == this._dateAdapter.getMonth(date2);
    }
    if (this._currentView == 'year') {
      return this._dateAdapter.getYear(date1) == this._dateAdapter.getYear(date2);
    }
    // Otherwise we are in 'multi-year' view.
    return Math.floor(this._dateAdapter.getYear(date1) / yearsPerPage) ==
        Math.floor(this._dateAdapter.getYear(date2) / yearsPerPage);
  }

  /** Handles keydown events on the calendar body when calendar is in month view. */
  private _handleCalendarBodyKeydownInMonthView(event: KeyboardEvent): void {
    const isRtl = this._isRtl();

    switch (event.keyCode) {
      case LEFT_ARROW:
        this._activeDate = this._dateAdapter.addCalendarDays(this._activeDate, isRtl ? 1 : -1);
        break;
      case RIGHT_ARROW:
        this._activeDate = this._dateAdapter.addCalendarDays(this._activeDate, isRtl ? -1 : 1);
        break;
      case UP_ARROW:
        this._activeDate = this._dateAdapter.addCalendarDays(this._activeDate, -7);
        break;
      case DOWN_ARROW:
        this._activeDate = this._dateAdapter.addCalendarDays(this._activeDate, 7);
        break;
      case HOME:
        this._activeDate = this._dateAdapter.addCalendarDays(this._activeDate,
            1 - this._dateAdapter.getDate(this._activeDate));
        break;
      case END:
        this._activeDate = this._dateAdapter.addCalendarDays(this._activeDate,
            (this._dateAdapter.getNumDaysInMonth(this._activeDate) -
             this._dateAdapter.getDate(this._activeDate)));
        break;
      case PAGE_UP:
        this._activeDate = event.altKey ?
            this._dateAdapter.addCalendarYears(this._activeDate, -1) :
            this._dateAdapter.addCalendarMonths(this._activeDate, -1);
        break;
      case PAGE_DOWN:
        this._activeDate = event.altKey ?
            this._dateAdapter.addCalendarYears(this._activeDate, 1) :
            this._dateAdapter.addCalendarMonths(this._activeDate, 1);
        break;
      case ENTER:
        if (this._dateFilterForViews(this._activeDate)) {
          this._dateSelected(this._activeDate);
          this._userSelected();
          // Prevent unexpected default actions such as form submission.
          event.preventDefault();
        }
        return;
      default:
        // Don't prevent default or focus active cell on keys that we don't explicitly handle.
        return;
    }

    this._focusActiveCell();
    // Prevent unexpected default actions such as form submission.
    event.preventDefault();
  }

  /** Handles keydown events on the calendar body when calendar is in year view. */
  private _handleCalendarBodyKeydownInYearView(event: KeyboardEvent): void {
    const isRtl = this._isRtl();

    switch (event.keyCode) {
      case LEFT_ARROW:
        this._activeDate = this._dateAdapter.addCalendarMonths(this._activeDate, isRtl ? 1 : -1);
        break;
      case RIGHT_ARROW:
        this._activeDate = this._dateAdapter.addCalendarMonths(this._activeDate, isRtl ? -1 : 1);
        break;
      case UP_ARROW:
        this._activeDate = this._dateAdapter.addCalendarMonths(this._activeDate, -4);
        break;
      case DOWN_ARROW:
        this._activeDate = this._dateAdapter.addCalendarMonths(this._activeDate, 4);
        break;
      case HOME:
        this._activeDate = this._dateAdapter.addCalendarMonths(this._activeDate,
            -this._dateAdapter.getMonth(this._activeDate));
        break;
      case END:
        this._activeDate = this._dateAdapter.addCalendarMonths(this._activeDate,
            11 - this._dateAdapter.getMonth(this._activeDate));
        break;
      case PAGE_UP:
        this._activeDate =
            this._dateAdapter.addCalendarYears(this._activeDate, event.altKey ? -10 : -1);
        break;
      case PAGE_DOWN:
        this._activeDate =
            this._dateAdapter.addCalendarYears(this._activeDate, event.altKey ? 10 : 1);
        break;
      case ENTER:
        this._goToDateInView(this._activeDate, 'month');
        break;
      default:
        // Don't prevent default or focus active cell on keys that we don't explicitly handle.
        return;
    }

    this._focusActiveCell();
    // Prevent unexpected default actions such as form submission.
    event.preventDefault();
  }

  /** Handles keydown events on the calendar body when calendar is in multi-year view. */
  private _handleCalendarBodyKeydownInMultiYearView(event: KeyboardEvent): void {
    switch (event.keyCode) {
      case LEFT_ARROW:
        this._activeDate = this._dateAdapter.addCalendarYears(this._activeDate, -1);
        break;
      case RIGHT_ARROW:
        this._activeDate = this._dateAdapter.addCalendarYears(this._activeDate, 1);
        break;
      case UP_ARROW:
        this._activeDate = this._dateAdapter.addCalendarYears(this._activeDate, -yearsPerRow);
        break;
      case DOWN_ARROW:
        this._activeDate = this._dateAdapter.addCalendarYears(this._activeDate, yearsPerRow);
        break;
      case HOME:
        this._activeDate = this._dateAdapter.addCalendarYears(this._activeDate,
            -this._dateAdapter.getYear(this._activeDate) % yearsPerPage);
        break;
      case END:
        this._activeDate = this._dateAdapter.addCalendarYears(this._activeDate,
            yearsPerPage - this._dateAdapter.getYear(this._activeDate) % yearsPerPage - 1);
        break;
      case PAGE_UP:
        this._activeDate =
            this._dateAdapter.addCalendarYears(
                this._activeDate, event.altKey ? -yearsPerPage * 10 : -yearsPerPage);
        break;
      case PAGE_DOWN:
        this._activeDate =
            this._dateAdapter.addCalendarYears(
                this._activeDate, event.altKey ? yearsPerPage * 10 : yearsPerPage);
        break;
      case ENTER:
        this._goToDateInView(this._activeDate, 'year');
        break;
      default:
        // Don't prevent default or focus active cell on keys that we don't explicitly handle.
        return;
    }

    this._focusActiveCell();
    // Prevent unexpected default actions such as form submission.
    event.preventDefault();
  }

  /**
   * @param obj The object to check.
   * @returns The given object if it is both a date instance and valid, otherwise null.
   */
  private _getValidDateOrNull(obj: any): D | null {
    return (this._dateAdapter.isDateInstance(obj) && this._dateAdapter.isValid(obj)) ? obj : null;
  }

  /** Determines whether the user has the RTL layout direction. */
  private _isRtl() {
    return this._dir && this._dir.value === 'rtl';
  }
}
