/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
  NgZone,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  AfterViewChecked,
} from '@angular/core';
import {take} from 'rxjs/operators';

/** Extra CSS classes that can be associated with a calendar cell. */
export type MatCalendarCellCssClasses = string | string[] | Set<string> | {[key: string]: any};

/** Function that can generate the extra classes that should be added to a calendar cell. */
export type MatCalendarCellClassFunction<D> = (
  date: D,
  view: 'month' | 'year' | 'multi-year',
) => MatCalendarCellCssClasses;

/**
 * An internal class that represents the data corresponding to a single calendar cell.
 * @docs-private
 */
export class MatCalendarCell<D = any> {
  constructor(
    public value: number,
    public displayValue: string,
    public ariaLabel: string,
    public enabled: boolean,
    public cssClasses: MatCalendarCellCssClasses = {},
    public compareValue = value,
    public rawValue?: D,
  ) {}
}

/** Event emitted when a date inside the calendar is triggered as a result of a user action. */
export interface MatCalendarUserEvent<D> {
  value: D;
  event: Event;
}

let calendarBodyId = 1;

/**
 * An internal component used to display calendar data in a table.
 * @docs-private
 */
@Component({
  selector: '[mat-calendar-body]',
  templateUrl: 'calendar-body.html',
  styleUrls: ['calendar-body.css'],
  host: {
    'class': 'mat-calendar-body',
  },
  exportAs: 'matCalendarBody',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatCalendarBody implements OnChanges, OnDestroy, AfterViewChecked {
  /**
   * Used to skip the next focus event when rendering the preview range.
   * We need a flag like this, because some browsers fire focus events asynchronously.
   */
  private _skipNextFocus: boolean;

  /**
   * Used to focus the active cell after change detection has run.
   */
  private _focusActiveCellAfterViewChecked = false;

  /** The label for the table. (e.g. "Jan 2017"). */
  @Input() label: string;

  /** The cells to display in the table. */
  @Input() rows: MatCalendarCell[][];

  /** The value in the table that corresponds to today. */
  @Input() todayValue: number;

  /** Start value of the selected date range. */
  @Input() startValue: number;

  /** End value of the selected date range. */
  @Input() endValue: number;

  /** The minimum number of free cells needed to fit the label in the first row. */
  @Input() labelMinRequiredCells: number;

  /** The number of columns in the table. */
  @Input() numCols: number = 7;

  /** The cell number of the active cell in the table. */
  @Input() activeCell: number = 0;

  ngAfterViewChecked() {
    if (this._focusActiveCellAfterViewChecked) {
      this._focusActiveCell();
      this._focusActiveCellAfterViewChecked = false;
    }
  }

  /** Whether a range is being selected. */
  @Input() isRange: boolean = false;

  /**
   * The aspect ratio (width / height) to use for the cells in the table. This aspect ratio will be
   * maintained even as the table resizes.
   */
  @Input() cellAspectRatio: number = 1;

  /** Start of the comparison range. */
  @Input() comparisonStart: number | null;

  /** End of the comparison range. */
  @Input() comparisonEnd: number | null;

  /** Start of the preview range. */
  @Input() previewStart: number | null = null;

  /** End of the preview range. */
  @Input() previewEnd: number | null = null;

  /** ARIA Accessible name of the `<input matStartDate/>` */
  @Input() startDateAccessibleName: string | null;

  /** ARIA Accessible name of the `<input matEndDate/>` */
  @Input() endDateAccessibleName: string | null;

  /** Emits when a new value is selected. */
  @Output() readonly selectedValueChange = new EventEmitter<MatCalendarUserEvent<number>>();

  /** Emits when the preview has changed as a result of a user action. */
  @Output() readonly previewChange = new EventEmitter<
    MatCalendarUserEvent<MatCalendarCell | null>
  >();

  @Output() readonly activeDateChange = new EventEmitter<MatCalendarUserEvent<number>>();

  /** The number of blank cells to put at the beginning for the first row. */
  _firstRowOffset: number;

  /** Padding for the individual date cells. */
  _cellPadding: string;

  /** Width of an individual cell. */
  _cellWidth: string;

  constructor(private _elementRef: ElementRef<HTMLElement>, private _ngZone: NgZone) {
    _ngZone.runOutsideAngular(() => {
      const element = _elementRef.nativeElement;
      element.addEventListener('mouseenter', this._enterHandler, true);
      element.addEventListener('focus', this._enterHandler, true);
      element.addEventListener('mouseleave', this._leaveHandler, true);
      element.addEventListener('blur', this._leaveHandler, true);
    });
  }

  /** Called when a cell is clicked. */
  _cellClicked(cell: MatCalendarCell, event: MouseEvent): void {
    if (cell.enabled) {
      this.selectedValueChange.emit({value: cell.value, event});
    }
  }

  _emitActiveDateChange(cell: MatCalendarCell, event: FocusEvent): void {
    if (cell.enabled) {
      this.activeDateChange.emit({value: cell.value, event});
    }
  }

  /** Returns whether a cell should be marked as selected. */
  _isSelected(value: number) {
    return this.startValue === value || this.endValue === value;
  }

  ngOnChanges(changes: SimpleChanges) {
    const columnChanges = changes['numCols'];
    const {rows, numCols} = this;

    if (changes['rows'] || columnChanges) {
      this._firstRowOffset = rows && rows.length && rows[0].length ? numCols - rows[0].length : 0;
    }

    if (changes['cellAspectRatio'] || columnChanges || !this._cellPadding) {
      this._cellPadding = `${(50 * this.cellAspectRatio) / numCols}%`;
    }

    if (columnChanges || !this._cellWidth) {
      this._cellWidth = `${100 / numCols}%`;
    }
  }

  ngOnDestroy() {
    const element = this._elementRef.nativeElement;
    element.removeEventListener('mouseenter', this._enterHandler, true);
    element.removeEventListener('focus', this._enterHandler, true);
    element.removeEventListener('mouseleave', this._leaveHandler, true);
    element.removeEventListener('blur', this._leaveHandler, true);
  }

  /** Returns whether a cell is active. */
  _isActiveCell(rowIndex: number, colIndex: number): boolean {
    let cellNumber = rowIndex * this.numCols + colIndex;

    // Account for the fact that the first row may not have as many cells.
    if (rowIndex) {
      cellNumber -= this._firstRowOffset;
    }

    return cellNumber == this.activeCell;
  }

  /**
   * Focuses the active cell after the microtask queue is empty.
   *
   * Adding a 0ms setTimeout seems to fix Voiceover losing focus when pressing PageUp/PageDown
   * (issue #24330).
   *
   * Determined a 0ms by gradually increasing duration from 0 and testing two use cases with screen
   * reader enabled:
   *
   * 1. Pressing PageUp/PageDown repeatedly with pausing between each key press.
   * 2. Pressing and holding the PageDown key with repeated keys enabled.
   *
   * Test 1 worked roughly 95-99% of the time with 0ms and got a little bit better as the duration
   * increased. Test 2 got slightly better until the duration was long enough to interfere with
   * repeated keys. If the repeated key speed was faster than the timeout duration, then pressing
   * and holding pagedown caused the entire page to scroll.
   *
   * Since repeated key speed can verify across machines, determined that any duration could
   * potentially interfere with repeated keys. 0ms would be best because it almost entirely
   * eliminates the focus being lost in Voiceover (#24330) without causing unintended side effects.
   * Adding delay also complicates writing tests.
   */
  _focusActiveCell(movePreview = true) {
    this._ngZone.runOutsideAngular(() => {
      this._ngZone.onStable.pipe(take(1)).subscribe(() => {
        setTimeout(() => {
          const activeCell: HTMLElement | null = this._elementRef.nativeElement.querySelector(
            '.mat-calendar-body-active',
          );

          if (activeCell) {
            if (!movePreview) {
              this._skipNextFocus = true;
            }

            activeCell.focus();
          }
        });
      });
    });
  }

  /** Focuses the active cell after change detection has run and the microtask queue is empty. */
  _scheduleFocusActiveCellAfterViewChecked() {
    this._focusActiveCellAfterViewChecked = true;
  }

  /** Gets whether a value is the start of the main range. */
  _isRangeStart(value: number) {
    return isStart(value, this.startValue, this.endValue);
  }

  /** Gets whether a value is the end of the main range. */
  _isRangeEnd(value: number) {
    return isEnd(value, this.startValue, this.endValue);
  }

  /** Gets whether a value is within the currently-selected range. */
  _isInRange(value: number): boolean {
    return isInRange(value, this.startValue, this.endValue, this.isRange);
  }

  /** Gets whether a value is the start of the comparison range. */
  _isComparisonStart(value: number) {
    return isStart(value, this.comparisonStart, this.comparisonEnd);
  }

  /** Whether the cell is a start bridge cell between the main and comparison ranges. */
  _isComparisonBridgeStart(value: number, rowIndex: number, colIndex: number) {
    if (!this._isComparisonStart(value) || this._isRangeStart(value) || !this._isInRange(value)) {
      return false;
    }

    let previousCell: MatCalendarCell | undefined = this.rows[rowIndex][colIndex - 1];

    if (!previousCell) {
      const previousRow = this.rows[rowIndex - 1];
      previousCell = previousRow && previousRow[previousRow.length - 1];
    }

    return previousCell && !this._isRangeEnd(previousCell.compareValue);
  }

  /** Whether the cell is an end bridge cell between the main and comparison ranges. */
  _isComparisonBridgeEnd(value: number, rowIndex: number, colIndex: number) {
    if (!this._isComparisonEnd(value) || this._isRangeEnd(value) || !this._isInRange(value)) {
      return false;
    }

    let nextCell: MatCalendarCell | undefined = this.rows[rowIndex][colIndex + 1];

    if (!nextCell) {
      const nextRow = this.rows[rowIndex + 1];
      nextCell = nextRow && nextRow[0];
    }

    return nextCell && !this._isRangeStart(nextCell.compareValue);
  }

  /** Gets whether a value is the end of the comparison range. */
  _isComparisonEnd(value: number) {
    return isEnd(value, this.comparisonStart, this.comparisonEnd);
  }

  /** Gets whether a value is within the current comparison range. */
  _isInComparisonRange(value: number) {
    return isInRange(value, this.comparisonStart, this.comparisonEnd, this.isRange);
  }

  /**
   * Gets whether a value is the same as the start and end of the comparison range.
   * For context, the functions that we use to determine whether something is the start/end of
   * a range don't allow for the start and end to be on the same day, because we'd have to use
   * much more specific CSS selectors to style them correctly in all scenarios. This is fine for
   * the regular range, because when it happens, the selected styles take over and still show where
   * the range would've been, however we don't have these selected styles for a comparison range.
   * This function is used to apply a class that serves the same purpose as the one for selected
   * dates, but it only applies in the context of a comparison range.
   */
  _isComparisonIdentical(value: number) {
    // Note that we don't need to null check the start/end
    // here, because the `value` will always be defined.
    return this.comparisonStart === this.comparisonEnd && value === this.comparisonStart;
  }

  /** Gets whether a value is the start of the preview range. */
  _isPreviewStart(value: number) {
    return isStart(value, this.previewStart, this.previewEnd);
  }

  /** Gets whether a value is the end of the preview range. */
  _isPreviewEnd(value: number) {
    return isEnd(value, this.previewStart, this.previewEnd);
  }

  /** Gets whether a value is inside the preview range. */
  _isInPreview(value: number) {
    return isInRange(value, this.previewStart, this.previewEnd, this.isRange);
  }

  /** Gets ids of aria descriptions for the start and end of a date range. */
  _getDescribedby(value: number): string | null {
    if (!this.isRange) {
      return null;
    }

    if (this.startValue === value && this.endValue === value) {
      return `${this._startDateLabelId} ${this._endDateLabelId}`;
    } else if (this.startValue === value) {
      return this._startDateLabelId;
    } else if (this.endValue === value) {
      return this._endDateLabelId;
    }
    return null;
  }

  /**
   * Event handler for when the user enters an element
   * inside the calendar body (e.g. by hovering in or focus).
   */
  private _enterHandler = (event: Event) => {
    if (this._skipNextFocus && event.type === 'focus') {
      this._skipNextFocus = false;
      return;
    }

    // We only need to hit the zone when we're selecting a range.
    if (event.target && this.isRange) {
      const cell = this._getCellFromElement(event.target as HTMLElement);

      if (cell) {
        this._ngZone.run(() => this.previewChange.emit({value: cell.enabled ? cell : null, event}));
      }
    }
  };

  /**
   * Event handler for when the user's pointer leaves an element
   * inside the calendar body (e.g. by hovering out or blurring).
   */
  private _leaveHandler = (event: Event) => {
    // We only need to hit the zone when we're selecting a range.
    if (this.previewEnd !== null && this.isRange) {
      // Only reset the preview end value when leaving cells. This looks better, because
      // we have a gap between the cells and the rows and we don't want to remove the
      // range just for it to show up again when the user moves a few pixels to the side.
      if (event.target && this._getCellFromElement(event.target as HTMLElement)) {
        this._ngZone.run(() => this.previewChange.emit({value: null, event}));
      }
    }
  };

  /** Finds the MatCalendarCell that corresponds to a DOM node. */
  private _getCellFromElement(element: HTMLElement): MatCalendarCell | null {
    let cell: HTMLElement | undefined;

    if (isTableCell(element)) {
      cell = element;
    } else if (isTableCell(element.parentNode!)) {
      cell = element.parentNode as HTMLElement;
    }

    if (cell) {
      const row = cell.getAttribute('data-mat-row');
      const col = cell.getAttribute('data-mat-col');

      if (row && col) {
        return this.rows[parseInt(row)][parseInt(col)];
      }
    }

    return null;
  }

  private _id = `mat-calendar-body-${calendarBodyId++}`;

  _startDateLabelId = `${this._id}-start-date`;

  _endDateLabelId = `${this._id}-end-date`;
}

/** Checks whether a node is a table cell element. */
function isTableCell(node: Node): node is HTMLTableCellElement {
  return node.nodeName === 'TD';
}

/** Checks whether a value is the start of a range. */
function isStart(value: number, start: number | null, end: number | null): boolean {
  return end !== null && start !== end && value < end && value === start;
}

/** Checks whether a value is the end of a range. */
function isEnd(value: number, start: number | null, end: number | null): boolean {
  return start !== null && start !== end && value >= start && value === end;
}

/** Checks whether a value is inside of a range. */
function isInRange(
  value: number,
  start: number | null,
  end: number | null,
  rangeEnabled: boolean,
): boolean {
  return (
    rangeEnabled &&
    start !== null &&
    end !== null &&
    start !== end &&
    value >= start &&
    value <= end
  );
}
