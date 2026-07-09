/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  computed,
  effect,
  inject,
  signal,
  Signal,
  untracked,
  viewChild,
  viewChildren,
  WritableSignal,
  ElementRef,
} from '@angular/core';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MatDateFormats,
  provideNativeDateAdapter,
} from '@angular/material/core';
import {Grid, GridRow, GridCell, GridCellWidget} from '@angular/aria/grid';
import {Combobox, ComboboxPopup, ComboboxWidget} from '@angular/aria/combobox';
import {OverlayModule} from '@angular/cdk/overlay';
import {A11yModule} from '@angular/cdk/a11y';

const DAYS_PER_WEEK = 7;

interface CalendarCell<D = any> {
  displayName: string;
  ariaLabel: string;
  date: D;
  selected: boolean;
}

/** @title Combobox with Datepicker Grid. */
@Component({
  selector: 'app-root:not([theme="basic-retro"])',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  providers: [provideNativeDateAdapter()],
  imports: [
    Grid,
    GridRow,
    GridCell,
    GridCellWidget,
    Combobox,
    ComboboxPopup,
    ComboboxWidget,
    OverlayModule,
    A11yModule,
  ],
})
export class App<D> {
  private readonly _dateAdapter = inject<DateAdapter<D>>(DateAdapter, {optional: true})!;
  private readonly _dateFormats = inject<MatDateFormats>(MAT_DATE_FORMATS, {optional: true})!;
  private readonly _dayButtons = viewChildren(GridCellWidget); // Dynamic capture of grid cell button widgets

  readonly grid = viewChild(Grid);
  readonly gridTable = viewChild<ElementRef<HTMLElement>>('gridTable');
  readonly comboboxInput = viewChild<ElementRef<HTMLInputElement>>('comboboxInput');

  readonly selection = signal('');
  readonly popupExpanded = signal(false);
  readonly viewMonth: WritableSignal<D> = signal(this._dateAdapter.today());
  private readonly _activeDate: WritableSignal<D> = signal(this._dateAdapter.today());

  // Track the target date that must receive focus post-render
  readonly focusTargetDate = signal<D | null>(null);

  // Helper to identify the current focus target in templates
  isFocusTarget(date: D): boolean {
    const target = this.focusTargetDate();
    return target ? this._dateAdapter.compareDate(date, target) === 0 : false;
  }

  constructor() {
    // Safe, post-render focus restoration loop
    effect(() => {
      const target = this.focusTargetDate();
      if (!target) return;

      // Grab dynamic dependency on day buttons list query
      const buttons = this._dayButtons();

      // Locate the focus button marked with our target attribute
      const targetBtn = buttons.find(
        (btn) => btn.element.getAttribute('data-focus-target') === 'true',
      );

      if (targetBtn) {
        targetBtn.element.focus();

        // Schedule cleanup in separate microtask to avoid circular signal write errors
        Promise.resolve().then(() => {
          untracked(() => this.focusTargetDate.set(null));
        });
      }
    });
  }

  readonly monthYearLabel: Signal<string> = computed(() =>
    this._dateAdapter
      .format(this.viewMonth(), this._dateFormats.display.monthYearLabel)
      .toLocaleUpperCase(),
  );

  readonly activeMonthAnnouncement = computed(
    () =>
      `Showing ${this._dateAdapter.format(this.viewMonth(), this._dateFormats.display.monthYearLabel)}`,
  );

  private readonly _firstWeekOffset: Signal<number> = computed(() => {
    const firstOfMonth = this._dateAdapter.createDate(
      this._dateAdapter.getYear(this.viewMonth()),
      this._dateAdapter.getMonth(this.viewMonth()),
      1,
    );

    return (
      (DAYS_PER_WEEK +
        this._dateAdapter.getDayOfWeek(firstOfMonth) -
        this._dateAdapter.getFirstDayOfWeek()) %
      DAYS_PER_WEEK
    );
  });

  readonly prevMonthNumDays: Signal<number> = computed(() =>
    this._dateAdapter.getNumDaysInMonth(this._dateAdapter.addCalendarMonths(this.viewMonth(), -1)),
  );

  readonly daysFromPrevMonth: Signal<number[]> = computed(() => {
    const days: number[] = [];
    for (let i = this._firstWeekOffset() - 1; i >= 0; i--) {
      days.push(this.prevMonthNumDays() - i);
    }
    return days;
  });

  // Calculate the trailing empty days from the next month reactively to complete the final calendar grid week row.
  readonly daysInNextMonth: Signal<number[]> = computed(() => {
    const activeWeeks = this.weeks();
    const lastWeekLength = activeWeeks[activeWeeks.length - 1]?.length || 0;
    const trailingCount = lastWeekLength > 0 ? 7 - lastWeekLength : 0;
    const days: number[] = [];
    for (let i = 1; i <= trailingCount; i++) {
      days.push(i);
    }
    return days;
  });

  // Shift the weekday names array reactively to align with the localized starting day of the week.
  readonly weekdays: Signal<{long: string; narrow: string}[]> = computed(() => {
    const firstDayOfWeek = this._dateAdapter.getFirstDayOfWeek();
    const narrowWeekdays = this._dateAdapter.getDayOfWeekNames('narrow');
    const longWeekdays = this._dateAdapter.getDayOfWeekNames('long');

    const weekdays = longWeekdays.map((long, i) => {
      return {long, narrow: narrowWeekdays[i]};
    });
    return weekdays.slice(firstDayOfWeek).concat(weekdays.slice(0, firstDayOfWeek));
  });

  // Reconstruct the two-dimensional week-by-week calendar grid whenever the month or selection changes.
  readonly weeks = computed(() => {
    this._activeDate(); // Create dependency on active date
    const viewMonth = this.viewMonth();
    const daysInMonth = this._dateAdapter.getNumDaysInMonth(viewMonth);
    const dateNames = this._dateAdapter.getDateNames();
    const weeks: CalendarCell[][] = [[]];

    for (let i = 0, cell = this._firstWeekOffset(); i < daysInMonth; i++, cell++) {
      if (cell == DAYS_PER_WEEK) {
        weeks.push([]);
        cell = 0;
      }
      const date = this._dateAdapter.createDate(
        this._dateAdapter.getYear(viewMonth),
        this._dateAdapter.getMonth(viewMonth),
        i + 1,
      );
      const ariaLabel = this._dateAdapter.format(date, this._dateFormats.display.dateA11yLabel);

      weeks[weeks.length - 1].push({
        displayName: dateNames[i],
        ariaLabel,
        date,
        selected: this._dateAdapter.compareDate(date, this._activeDate()) === 0,
      });
    }
    return weeks;
  });

  nextMonth(): void {
    this.viewMonth.set(this._dateAdapter.addCalendarMonths(this.viewMonth(), 1));
  }

  prevMonth(): void {
    this.viewMonth.set(this._dateAdapter.addCalendarMonths(this.viewMonth(), -1));
  }

  selectDate(cell: CalendarCell<D>, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const formatted = this._dateAdapter.format(cell.date, this._dateFormats.display.dateInput);
    this.selection.set(formatted);
    this._activeDate.set(cell.date);

    // Synchronously restore focus to the trigger input element before destroying popup to avoid drop
    this.comboboxInput()?.nativeElement.focus();
    this.popupExpanded.set(false);
  }

  // Parse and reconcile dynamic input typing to calendar state
  onInputInput(value: string): void {
    const parsedDate = this._dateAdapter.parse(value, this._dateFormats.display.dateInput);
    if (parsedDate && this._dateAdapter.isValid(parsedDate)) {
      this._activeDate.set(parsedDate);
      this.viewMonth.set(parsedDate);
    }
  }

  // Handle keyboard inputs on the trigger input field.
  onInputKeydown(event: KeyboardEvent) {
    // Pressing Enter parses the input text and updates the selected date.
    if (event.key === 'Enter') {
      const value = this.selection();
      const parsedDate = this._dateAdapter.parse(value, this._dateFormats.display.dateInput);
      if (parsedDate && this._dateAdapter.isValid(parsedDate)) {
        this._activeDate.set(parsedDate);
        this.viewMonth.set(parsedDate);
        this.popupExpanded.set(false);
      }
      // Pressing ArrowDown shifts focus into the active cell of the calendar grid.
    } else if (event.key === 'ArrowDown' && this.popupExpanded()) {
      setTimeout(() => {
        const tableEl = this.gridTable()?.nativeElement;
        if (tableEl) {
          const tabbable = tableEl.querySelector('[tabindex="0"]') as HTMLElement;
          (tabbable || tableEl).focus();
        }
      });
    }
  }

  // Safe W3C calendar grid boundaries keys navigation checks
  onGridKeydown(event: KeyboardEvent): void {
    const arrowUp = event.key === 'ArrowUp';
    const arrowDown = event.key === 'ArrowDown';
    const arrowLeft = event.key === 'ArrowLeft';
    const arrowRight = event.key === 'ArrowRight';
    const pageUp = event.key === 'PageUp';
    const pageDown = event.key === 'PageDown';
    const homeKey = event.key === 'Home';
    const endKey = event.key === 'End';

    if (
      !arrowUp &&
      !arrowDown &&
      !arrowLeft &&
      !arrowRight &&
      !pageUp &&
      !pageDown &&
      !homeKey &&
      !endKey
    ) {
      return;
    }

    // Extract the day number of the currently focused button cell
    const targetEl = event.target as HTMLElement;
    const dayAttr = targetEl.getAttribute('data-day');
    if (!dayAttr) return;

    const day = Number(dayAttr);
    const year = this._dateAdapter.getYear(this.viewMonth());
    const month = this._dateAdapter.getMonth(this.viewMonth());
    const viewMonthNumDays = this._dateAdapter.getNumDaysInMonth(this.viewMonth());

    // Reconstitute focused cell date Adapter entity
    const currentFocusedDate = this._dateAdapter.createDate(year, month, day);
    let targetDate: D | null = null;

    // W3C APG Standard calendar keyboard rules
    switch (event.key) {
      case 'ArrowLeft':
        // Day 1 boundary crossing: jump to the last day of the previous month
        if (day === 1) {
          targetDate = this._dateAdapter.addCalendarDays(currentFocusedDate, -1);
        }
        break;
      case 'ArrowRight':
        // Last day boundary crossing: jump to the first day of the next month
        if (day === viewMonthNumDays) {
          targetDate = this._dateAdapter.addCalendarDays(currentFocusedDate, 1);
        }
        break;
      case 'ArrowUp':
        // First week boundary crossing: jump back 7 days to the previous month
        if (day <= 7) {
          targetDate = this._dateAdapter.addCalendarDays(currentFocusedDate, -7);
        }
        break;
      case 'ArrowDown':
        // Last week boundary crossing: jump forward 7 days to the next month
        if (day > viewMonthNumDays - 7) {
          targetDate = this._dateAdapter.addCalendarDays(currentFocusedDate, 7);
        }
        break;
      case 'PageUp':
        // Shift back 12 months on Control-PageUp, otherwise shift back 1 month
        targetDate = this._dateAdapter.addCalendarMonths(
          currentFocusedDate,
          event.ctrlKey ? -12 : -1,
        );
        break;
      case 'PageDown':
        // Shift forward 12 months on Control-PageDown, otherwise shift forward 1 month
        targetDate = this._dateAdapter.addCalendarMonths(
          currentFocusedDate,
          event.ctrlKey ? 12 : 1,
        );
        break;
      case 'Home':
        // Jump to the 1st of the current month
        targetDate = this._dateAdapter.createDate(year, month, 1);
        break;
      case 'End':
        // Jump to the last day of the current month
        targetDate = this._dateAdapter.createDate(year, month, viewMonthNumDays);
        break;
    }

    if (targetDate) {
      // Mute downstream event listeners inside the grid parent to prevent roving races
      event.preventDefault();
      event.stopImmediatePropagation();
      this.navigateToDate(targetDate);
    }
  }

  navigateToDate(targetDate: D): void {
    const currentMonth = this._dateAdapter.getMonth(this.viewMonth());
    const currentYear = this._dateAdapter.getYear(this.viewMonth());
    const targetMonth = this._dateAdapter.getMonth(targetDate);
    const targetYear = this._dateAdapter.getYear(targetDate);

    const monthShift = currentMonth !== targetMonth || currentYear !== targetYear;

    if (monthShift) {
      // 1. Focus stable table container to stop focus drop to body (prevent overlay crash)
      this.gridTable()?.nativeElement.focus();

      // 2. Reset active grid state synchronously to avoid focus hijacking (Solution B)
      const gridBehavior = this.grid()?._pattern.gridBehavior;
      if (gridBehavior) {
        gridBehavior.focusBehavior.activeCell.set(undefined);
        gridBehavior.focusBehavior.activeCoords.set({row: -1, col: -1});
      }

      // 3. Set target state so the reactive effect knows what to grab post-render
      this.focusTargetDate.set(targetDate);

      // 4. Perform reactive month view transition
      this.viewMonth.set(targetDate);
    } else {
      // Same month traversal: just set the target and the constructor effect will fire immediately
      this.focusTargetDate.set(targetDate);
    }
  }

  handleWidgetKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.comboboxInput()?.nativeElement.focus();
      this.popupExpanded.set(false);
      event.preventDefault();
      event.stopPropagation();
    }
  }
}
