import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  Optional,
  Output,
  ViewEncapsulation
} from '@angular/core';
import {MdCalendarCell} from './calendar-body';
import {DateAdapter} from '../core/datetime/index';
import {createMissingDateImplError} from './datepicker-errors';
import {MD_DATE_FORMATS, MdDateFormats} from '../core/datetime/date-formats';


const DAYS_PER_WEEK = 7;


/**
 * An internal component used to display a single month in the datepicker.
 * @docs-private
 */
@Component({
  moduleId: module.id,
  selector: 'md-month-view',
  templateUrl: 'month-view.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdMonthView<D> implements AfterContentInit {
  /**
   * The date to display in this month view (everything other than the month and year is ignored).
   */
  @Input()
  get activeDate(): D { return this._activeDate; }
  set activeDate(value: D) {
    let oldActiveDate = this._activeDate;
    this._activeDate = value || this._dateAdapter.today();
    if (!this._hasSameMonthAndYear(oldActiveDate, this._activeDate)) {
      this._init();
    }
  }
  private _activeDate: D;

  /** The currently selected date. */
  @Input()
  get selected(): D { return this._selected; }
  set selected(value: D) {
    this._selected = value;
    this._selectedDate = this._getDateInCurrentMonth(this.selected);
  }
  private _selected: D;

  /** A function used to filter which dates are selectable. */
  @Input() dateFilter: (date: D) => boolean;

  /** Emits when a new date is selected. */
  @Output() selectedChange = new EventEmitter<D>();

  /** The label for this month (e.g. "January 2017"). */
  _monthLabel: string;

  /** Grid of calendar cells representing the dates of the month. */
  _weeks: MdCalendarCell[][];

  /** The number of blank cells in the first row before the 1st of the month. */
  _firstWeekOffset: number;

  /**
   * The date of the month that the currently selected Date falls on.
   * Null if the currently selected Date is in another month.
   */
  _selectedDate: number;

  /** The date of the month that today falls on. Null if today is in another month. */
  _todayDate: number;

  /** The names of the weekdays. */
  _weekdays: {long: string, narrow: string}[];

  constructor(@Optional() public _dateAdapter: DateAdapter<D>,
              @Optional() @Inject(MD_DATE_FORMATS) private _dateFormats: MdDateFormats) {
    if (!this._dateAdapter) {
      throw createMissingDateImplError('DateAdapter');
    }
    if (!this._dateFormats) {
      throw createMissingDateImplError('MD_DATE_FORMATS');
    }

    const firstDayOfWeek = this._dateAdapter.getFirstDayOfWeek();
    const narrowWeekdays = this._dateAdapter.getDayOfWeekNames('narrow');
    const longWeekdays = this._dateAdapter.getDayOfWeekNames('long');

    // Rotate the labels for days of the week based on the configured first day of the week.
    let weekdays = longWeekdays.map((long, i) => {
      return {long, narrow: narrowWeekdays[i]};
    });
    this._weekdays = weekdays.slice(firstDayOfWeek).concat(weekdays.slice(0, firstDayOfWeek));

    this._activeDate = this._dateAdapter.today();
  }

  ngAfterContentInit(): void {
    this._init();
  }

  /** Handles when a new date is selected. */
  _dateSelected(date: number) {
    if (this._selectedDate == date) {
      return;
    }
    this.selectedChange.emit(this._dateAdapter.createDate(
        this._dateAdapter.getYear(this.activeDate), this._dateAdapter.getMonth(this.activeDate),
        date));
  }

  /** Initializes this month view. */
  private _init() {
    this._selectedDate = this._getDateInCurrentMonth(this.selected);
    this._todayDate = this._getDateInCurrentMonth(this._dateAdapter.today());
    this._monthLabel =
        this._dateAdapter.getMonthNames('short')[this._dateAdapter.getMonth(this.activeDate)]
            .toLocaleUpperCase();

    let firstOfMonth = this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate),
        this._dateAdapter.getMonth(this.activeDate), 1);
    this._firstWeekOffset =
        (DAYS_PER_WEEK + this._dateAdapter.getDayOfWeek(firstOfMonth) -
         this._dateAdapter.getFirstDayOfWeek()) % DAYS_PER_WEEK;

    this._createWeekCells();
  }

  /** Creates MdCalendarCells for the dates in this month. */
  private _createWeekCells() {
    let daysInMonth = this._dateAdapter.getNumDaysInMonth(this.activeDate);
    let dateNames = this._dateAdapter.getDateNames();
    this._weeks = [[]];
    for (let i = 0, cell = this._firstWeekOffset; i < daysInMonth; i++, cell++) {
      if (cell == DAYS_PER_WEEK) {
        this._weeks.push([]);
        cell = 0;
      }
      let date = this._dateAdapter.createDate(
          this._dateAdapter.getYear(this.activeDate),
          this._dateAdapter.getMonth(this.activeDate), i + 1);
      let enabled = !this.dateFilter ||
          this.dateFilter(date);
      let ariaLabel = this._dateAdapter.format(date, this._dateFormats.display.dateA11yLabel);
      this._weeks[this._weeks.length - 1]
          .push(new MdCalendarCell(i + 1, dateNames[i], ariaLabel, enabled));
    }
  }

  /**
   * Gets the date in this month that the given Date falls on.
   * Returns null if the given Date is in another month.
   */
  private _getDateInCurrentMonth(date: D): number {
    return this._hasSameMonthAndYear(date, this.activeDate) ?
        this._dateAdapter.getDate(date) : null;
  }

  /** Checks whether the 2 dates are non-null and fall within the same month of the same year. */
  private _hasSameMonthAndYear(d1: D, d2: D): boolean {
    return !!(d1 && d2 && this._dateAdapter.getMonth(d1) == this._dateAdapter.getMonth(d2) &&
              this._dateAdapter.getYear(d1) == this._dateAdapter.getYear(d2));
  }
}
