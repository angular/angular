import {Direction, Directionality} from '@angular/cdk/bidi';
import {
  DOWN_ARROW,
  END,
  ENTER,
  HOME,
  LEFT_ARROW,
  PAGE_DOWN,
  PAGE_UP,
  RIGHT_ARROW,
  SPACE,
  UP_ARROW,
  ESCAPE,
} from '@angular/cdk/keycodes';
import {
  dispatchFakeEvent,
  dispatchKeyboardEvent,
  dispatchMouseEvent,
  createKeyboardEvent,
  dispatchEvent,
} from '../../cdk/testing/private';
import {Component} from '@angular/core';
import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';
import {MAT_DATE_FORMATS, MatNativeDateModule} from '@angular/material/core';
import {DEC, FEB, JAN, MAR, NOV} from '../testing';
import {By} from '@angular/platform-browser';
import {MatCalendarBody} from './calendar-body';
import {MatMonthView} from './month-view';
import {DateRange} from './date-selection-model';
import {
  MAT_DATE_RANGE_SELECTION_STRATEGY,
  DefaultMatCalendarRangeStrategy,
} from './date-range-selection-strategy';

describe('MatMonthView', () => {
  describe('standard providers', () => {
    let dir: {value: Direction};

    beforeEach(
      waitForAsync(() => {
        TestBed.configureTestingModule({
          imports: [MatNativeDateModule],
          declarations: [
            MatCalendarBody,
            MatMonthView,

            // Test components.
            StandardMonthView,
            MonthViewWithDateFilter,
            MonthViewWithDateClass,
          ],
          providers: [
            {provide: Directionality, useFactory: () => (dir = {value: 'ltr'})},
            {provide: MAT_DATE_RANGE_SELECTION_STRATEGY, useClass: DefaultMatCalendarRangeStrategy},
          ],
        });

        TestBed.compileComponents();
      }),
    );

    describe('standard month view', () => {
      let fixture: ComponentFixture<StandardMonthView>;
      let testComponent: StandardMonthView;
      let monthViewNativeElement: Element;

      beforeEach(() => {
        fixture = TestBed.createComponent(StandardMonthView);
        fixture.detectChanges();

        let monthViewDebugElement = fixture.debugElement.query(By.directive(MatMonthView))!;
        monthViewNativeElement = monthViewDebugElement.nativeElement;
        testComponent = fixture.componentInstance;
      });

      it('has correct month label', () => {
        let labelEl = monthViewNativeElement.querySelector('.mat-calendar-body-label')!;
        expect(labelEl.innerHTML.trim()).toBe('JAN');
      });

      it('has 31 days', () => {
        let cellEls = monthViewNativeElement.querySelectorAll('.mat-calendar-body-cell')!;
        expect(cellEls.length).toBe(31);
      });

      it('shows selected date if in same month', () => {
        let selectedEl = monthViewNativeElement.querySelector('.mat-calendar-body-selected')!;
        expect(selectedEl.innerHTML.trim()).toBe('10');
      });

      it('does not show selected date if in different month', () => {
        testComponent.selected = new Date(2017, MAR, 10);
        fixture.detectChanges();

        let selectedEl = monthViewNativeElement.querySelector('.mat-calendar-body-selected');
        expect(selectedEl).toBeNull();
      });

      it('fires selected change event on cell clicked', () => {
        let cellEls = monthViewNativeElement.querySelectorAll('.mat-calendar-body-cell');
        (cellEls[cellEls.length - 1] as HTMLElement).click();
        fixture.detectChanges();

        let selectedEl = monthViewNativeElement.querySelector('.mat-calendar-body-selected')!;
        expect(selectedEl.innerHTML.trim()).toBe('31');
      });

      it('should mark active date', () => {
        let cellEls = monthViewNativeElement.querySelectorAll('.mat-calendar-body-cell');
        expect((cellEls[4] as HTMLElement).innerText.trim()).toBe('5');
        expect(cellEls[4].classList).toContain('mat-calendar-body-active');
      });

      describe('a11y', () => {
        it('should set the correct role on the internal table node', () => {
          const table = monthViewNativeElement.querySelector('table')!;
          expect(table.getAttribute('role')).toBe('grid');
        });

        it('should set the correct scope on the table headers', () => {
          const nonDividerHeaders = monthViewNativeElement.querySelectorAll(
            '.mat-calendar-table-header th:not(.mat-calendar-table-header-divider)',
          );
          const dividerHeader = monthViewNativeElement.querySelector(
            '.mat-calendar-table-header-divider',
          )!;

          expect(
            Array.from(nonDividerHeaders).every(header => {
              return header.getAttribute('scope') === 'col';
            }),
          ).toBe(true);
          expect(dividerHeader.hasAttribute('scope')).toBe(false);
        });

        describe('calendar body', () => {
          let calendarBodyEl: HTMLElement;
          let calendarInstance: StandardMonthView;

          beforeEach(() => {
            calendarInstance = fixture.componentInstance;
            calendarBodyEl = fixture.debugElement.nativeElement.querySelector(
              '.mat-calendar-body',
            ) as HTMLElement;
            expect(calendarBodyEl).not.toBeNull();
            dir.value = 'ltr';
            fixture.componentInstance.date = new Date(2017, JAN, 5);
            dispatchFakeEvent(calendarBodyEl, 'focus');
            fixture.detectChanges();
          });

          it('should decrement date on left arrow press', () => {
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
            fixture.detectChanges();
            expect(calendarInstance.date).toEqual(new Date(2017, JAN, 4));

            calendarInstance.date = new Date(2017, JAN, 1);
            fixture.detectChanges();

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
            fixture.detectChanges();

            expect(calendarInstance.date).toEqual(new Date(2016, DEC, 31));
          });

          it('should increment date on left arrow press in rtl', () => {
            dir.value = 'rtl';

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
            fixture.detectChanges();

            expect(calendarInstance.date).toEqual(new Date(2017, JAN, 6));

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
            fixture.detectChanges();

            expect(calendarInstance.date).toEqual(new Date(2017, JAN, 7));
          });

          it('should increment date on right arrow press', () => {
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();

            expect(calendarInstance.date).toEqual(new Date(2017, JAN, 6));

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();

            expect(calendarInstance.date).toEqual(new Date(2017, JAN, 7));
          });

          it('should decrement date on right arrow press in rtl', () => {
            dir.value = 'rtl';

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();

            expect(calendarInstance.date).toEqual(new Date(2017, JAN, 4));

            calendarInstance.date = new Date(2017, JAN, 1);
            fixture.detectChanges();

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();

            expect(calendarInstance.date).toEqual(new Date(2016, DEC, 31));
          });

          it('should go up a row on up arrow press', () => {
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', UP_ARROW);
            fixture.detectChanges();

            expect(calendarInstance.date).toEqual(new Date(2016, DEC, 29));

            calendarInstance.date = new Date(2017, JAN, 7);
            fixture.detectChanges();

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', UP_ARROW);
            fixture.detectChanges();

            expect(calendarInstance.date).toEqual(new Date(2016, DEC, 31));
          });

          it('should go down a row on down arrow press', () => {
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', DOWN_ARROW);
            fixture.detectChanges();

            expect(calendarInstance.date).toEqual(new Date(2017, JAN, 12));

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', DOWN_ARROW);
            fixture.detectChanges();

            expect(calendarInstance.date).toEqual(new Date(2017, JAN, 19));
          });

          it('should go to beginning of the month on home press', () => {
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', HOME);
            fixture.detectChanges();

            expect(calendarInstance.date).toEqual(new Date(2017, JAN, 1));

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', HOME);
            fixture.detectChanges();

            expect(calendarInstance.date).toEqual(new Date(2017, JAN, 1));
          });

          it('should go to end of the month on end press', () => {
            calendarInstance.date = new Date(2017, JAN, 10);

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', END);
            fixture.detectChanges();

            expect(calendarInstance.date).toEqual(new Date(2017, JAN, 31));

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', END);
            fixture.detectChanges();

            expect(calendarInstance.date).toEqual(new Date(2017, JAN, 31));
          });

          it('should go back one month on page up press', () => {
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_UP);
            fixture.detectChanges();

            expect(calendarInstance.date).toEqual(new Date(2016, DEC, 5));

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_UP);
            fixture.detectChanges();

            expect(calendarInstance.date).toEqual(new Date(2016, NOV, 5));
          });

          it('should go forward one month on page down press', () => {
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_DOWN);
            fixture.detectChanges();

            expect(calendarInstance.date).toEqual(new Date(2017, FEB, 5));

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_DOWN);
            fixture.detectChanges();

            expect(calendarInstance.date).toEqual(new Date(2017, MAR, 5));
          });

          it('should select active date on enter', () => {
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
            fixture.detectChanges();

            expect(testComponent.selected).toEqual(new Date(2017, JAN, 10));

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', ENTER);
            fixture.detectChanges();
            dispatchKeyboardEvent(calendarBodyEl, 'keyup', ENTER);
            fixture.detectChanges();

            expect(testComponent.selected).toEqual(new Date(2017, JAN, 4));
          });

          it('should select active date on space', () => {
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
            fixture.detectChanges();

            expect(testComponent.selected).toEqual(new Date(2017, JAN, 10));

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', SPACE);
            fixture.detectChanges();
            dispatchKeyboardEvent(calendarBodyEl, 'keyup', SPACE);
            fixture.detectChanges();

            expect(testComponent.selected).toEqual(new Date(2017, JAN, 4));
          });

          it('should cancel the current range selection when pressing escape', () => {
            const cellEls = monthViewNativeElement.querySelectorAll('.mat-calendar-body-cell');
            testComponent.selected = new DateRange(new Date(2017, JAN, 10), null);
            fixture.detectChanges();
            dispatchMouseEvent(cellEls[15], 'mouseenter');
            fixture.detectChanges();

            // Note that here we only care that _some_ kind of range is rendered. There are
            // plenty of tests in the calendar body which assert that everything is correct.
            expect(
              monthViewNativeElement.querySelectorAll('.mat-calendar-body-preview-start').length,
            ).toBeGreaterThan(0);
            expect(
              monthViewNativeElement.querySelectorAll('.mat-calendar-body-in-preview').length,
            ).toBeGreaterThan(0);
            expect(
              monthViewNativeElement.querySelectorAll('.mat-calendar-body-preview-end').length,
            ).toBeGreaterThan(0);

            const event = createKeyboardEvent('keydown', ESCAPE, 'Escape');
            spyOn(event, 'stopPropagation');
            dispatchEvent(calendarBodyEl, event);
            fixture.detectChanges();

            // Expect the range range to have been cleared.
            expect(
              monthViewNativeElement.querySelectorAll(
                [
                  '.mat-calendar-body-preview-start',
                  '.mat-calendar-body-in-preview',
                  '.mat-calendar-body-preview-end',
                ].join(','),
              ).length,
            ).toBe(0);
            expect(event.stopPropagation).toHaveBeenCalled();
            expect(event.defaultPrevented).toBe(true);
            expect(testComponent.selected).toBeFalsy();
          });

          it(
            'should not cancel the current range selection when pressing escape with a ' +
              'modifier key',
            () => {
              const cellEls = monthViewNativeElement.querySelectorAll('.mat-calendar-body-cell');
              testComponent.selected = new DateRange(new Date(2017, JAN, 10), null);
              fixture.detectChanges();
              dispatchMouseEvent(cellEls[15], 'mouseenter');
              fixture.detectChanges();

              const rangeStarts = monthViewNativeElement.querySelectorAll(
                '.mat-calendar-body-preview-start',
              ).length;
              const rangeMids = monthViewNativeElement.querySelectorAll(
                '.mat-calendar-body-in-preview',
              ).length;
              const rangeEnds = monthViewNativeElement.querySelectorAll(
                '.mat-calendar-body-preview-end',
              ).length;

              // Note that here we only care that _some_ kind of range is rendered. There are
              // plenty of tests in the calendar body which assert that everything is correct.
              expect(rangeStarts).toBeGreaterThan(0);
              expect(rangeMids).toBeGreaterThan(0);
              expect(rangeEnds).toBeGreaterThan(0);

              const event = createKeyboardEvent('keydown', ESCAPE, 'Escape', {alt: true});
              spyOn(event, 'stopPropagation');
              dispatchEvent(calendarBodyEl, event);
              fixture.detectChanges();

              expect(
                monthViewNativeElement.querySelectorAll('.mat-calendar-body-preview-start').length,
              ).toBe(rangeStarts);
              expect(
                monthViewNativeElement.querySelectorAll('.mat-calendar-body-in-preview').length,
              ).toBe(rangeMids);
              expect(
                monthViewNativeElement.querySelectorAll('.mat-calendar-body-preview-end').length,
              ).toBe(rangeEnds);
              expect(event.stopPropagation).not.toHaveBeenCalled();
              expect(event.defaultPrevented).toBe(false);
              expect(testComponent.selected).toBeTruthy();
            },
          );

          it('should clear the preview range when the user is done selecting', () => {
            const cellEls =
              monthViewNativeElement.querySelectorAll<HTMLElement>('.mat-calendar-body-cell');
            testComponent.selected = new DateRange(new Date(2017, JAN, 10), null);
            fixture.detectChanges();
            dispatchMouseEvent(cellEls[15], 'mouseenter');
            fixture.detectChanges();

            // Note that here we only care that _some_ kind of range is rendered. There are
            // plenty of tests in the calendar body which assert that everything is correct.
            expect(
              monthViewNativeElement.querySelectorAll('.mat-calendar-body-preview-start').length,
            ).toBeGreaterThan(0);
            expect(
              monthViewNativeElement.querySelectorAll('.mat-calendar-body-in-preview').length,
            ).toBeGreaterThan(0);
            expect(
              monthViewNativeElement.querySelectorAll('.mat-calendar-body-preview-end').length,
            ).toBeGreaterThan(0);

            cellEls[15].click();
            fixture.detectChanges();

            expect(
              monthViewNativeElement.querySelectorAll('.mat-calendar-body-preview-start').length,
            ).toBe(0);
            expect(
              monthViewNativeElement.querySelectorAll('.mat-calendar-body-in-preview').length,
            ).toBe(0);
            expect(
              monthViewNativeElement.querySelectorAll('.mat-calendar-body-preview-end').length,
            ).toBe(0);
          });

          it('should not clear the range when pressing escape while there is no preview', () => {
            const getRangeElements = () =>
              monthViewNativeElement.querySelectorAll(
                [
                  '.mat-calendar-body-range-start',
                  '.mat-calendar-body-in-range',
                  '.mat-calendar-body-range-end',
                ].join(','),
              );

            testComponent.selected = new DateRange(
              new Date(2017, JAN, 10),
              new Date(2017, JAN, 15),
            );
            fixture.detectChanges();

            expect(getRangeElements().length)
              .withContext('Expected range to be present on init.')
              .toBeGreaterThan(0);

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', ESCAPE);
            fixture.detectChanges();

            expect(getRangeElements().length)
              .withContext('Expected range to be present after pressing the escape key.')
              .toBeGreaterThan(0);
          });

          it(
            'should not fire the selected change event when clicking on an already-selected ' +
              'date while selecting a single date',
            () => {
              testComponent.selected = new Date(2017, JAN, 10);
              fixture.detectChanges();

              expect(fixture.componentInstance.selectedChangeSpy).not.toHaveBeenCalled();

              const selectedCell = monthViewNativeElement.querySelector(
                '.mat-calendar-body-selected',
              ) as HTMLElement;
              selectedCell.click();
              fixture.detectChanges();

              expect(fixture.componentInstance.selectedChangeSpy).not.toHaveBeenCalled();
            },
          );

          it(
            'should fire the selected change event when clicking on an already-selected ' +
              'date while selecting a range',
            () => {
              const selectedDate = new Date(2017, JAN, 10);
              testComponent.selected = new DateRange(selectedDate, null);
              fixture.detectChanges();

              expect(fixture.componentInstance.selectedChangeSpy).not.toHaveBeenCalled();

              const selectedCell = monthViewNativeElement.querySelector(
                '.mat-calendar-body-selected',
              ) as HTMLElement;
              selectedCell.click();
              fixture.detectChanges();

              expect(fixture.componentInstance.selectedChangeSpy).toHaveBeenCalledWith(
                selectedDate,
              );
            },
          );

          it(
            'should fire the _userSelection event with the correct value when clicking ' +
              'on a selected date',
            () => {
              const date = new Date(2017, JAN, 10);
              testComponent.selected = date;
              fixture.detectChanges();

              expect(fixture.componentInstance.userSelectionSpy).not.toHaveBeenCalled();

              const selectedCell = monthViewNativeElement.querySelector(
                '.mat-calendar-body-selected',
              ) as HTMLElement;
              selectedCell.click();
              fixture.detectChanges();

              expect(fixture.componentInstance.userSelectionSpy).toHaveBeenCalledWith(
                jasmine.objectContaining({value: date}),
              );
            },
          );

          it('should go to month that is focused', () => {
            const jan11Cell = fixture.debugElement.nativeElement.querySelector(
              '[data-mat-row="1"][data-mat-col="3"] button',
            ) as HTMLElement;

            dispatchFakeEvent(jan11Cell, 'focus');
            fixture.detectChanges();

            expect(calendarInstance.date).toEqual(new Date(2017, JAN, 11));
          });

          it('should not call `.focus()` when the active date is focused', () => {
            const jan5Cell = fixture.debugElement.nativeElement.querySelector(
              '[data-mat-row="0"][data-mat-col="4"] button',
            ) as HTMLElement;
            const focusSpy = (jan5Cell.focus = jasmine.createSpy('cellFocused'));

            dispatchFakeEvent(jan5Cell, 'focus');
            fixture.detectChanges();

            expect(calendarInstance.date).toEqual(new Date(2017, JAN, 5));
            expect(focusSpy).not.toHaveBeenCalled();
          });
        });
      });
    });

    describe('month view with date filter', () => {
      it('should disable filtered dates', () => {
        const fixture = TestBed.createComponent(MonthViewWithDateFilter);
        fixture.detectChanges();

        let cells = fixture.nativeElement.querySelectorAll('.mat-calendar-body-cell');
        expect(cells[0].classList).toContain('mat-calendar-body-disabled');
        expect(cells[1].classList).not.toContain('mat-calendar-body-disabled');
      });

      it('should not call the date filter function if the date is before the min date', () => {
        const fixture = TestBed.createComponent(MonthViewWithDateFilter);
        const activeDate = fixture.componentInstance.activeDate;
        const spy = spyOn(fixture.componentInstance, 'dateFilter').and.callThrough();
        fixture.componentInstance.minDate = new Date(
          activeDate.getFullYear() + 1,
          activeDate.getMonth(),
          activeDate.getDate(),
        );
        fixture.detectChanges();

        expect(spy).not.toHaveBeenCalled();
      });

      it('should not call the date filter function if the date is after the max date', () => {
        const fixture = TestBed.createComponent(MonthViewWithDateFilter);
        const activeDate = fixture.componentInstance.activeDate;
        const spy = spyOn(fixture.componentInstance, 'dateFilter').and.callThrough();
        fixture.componentInstance.maxDate = new Date(
          activeDate.getFullYear() - 1,
          activeDate.getMonth(),
          activeDate.getDate(),
        );
        fixture.detectChanges();

        expect(spy).not.toHaveBeenCalled();
      });
    });

    describe('month view with custom date classes', () => {
      let fixture: ComponentFixture<MonthViewWithDateClass>;
      let monthViewNativeElement: Element;
      let dateClassSpy: jasmine.Spy;

      beforeEach(() => {
        fixture = TestBed.createComponent(MonthViewWithDateClass);
        dateClassSpy = spyOn(fixture.componentInstance, 'dateClass').and.callThrough();
        fixture.detectChanges();

        let monthViewDebugElement = fixture.debugElement.query(By.directive(MatMonthView))!;
        monthViewNativeElement = monthViewDebugElement.nativeElement;
      });

      it('should be able to add a custom class to some dates', () => {
        let cells = monthViewNativeElement.querySelectorAll('.mat-calendar-body-cell');
        expect(cells[0].classList).not.toContain('even');
        expect(cells[1].classList).toContain('even');
      });

      it('should call dateClass with the correct view name', () => {
        expect(dateClassSpy).toHaveBeenCalledWith(jasmine.any(Date), 'month');
      });
    });
  });

  describe('month view with custom date formats', () => {
    let fixture: ComponentFixture<StandardMonthView>;
    let monthViewNativeElement: Element;

    beforeEach(
      waitForAsync(() => {
        TestBed.configureTestingModule({
          imports: [MatNativeDateModule],
          declarations: [
            MatCalendarBody,
            MatMonthView,

            // Test components.
            StandardMonthView,
            MonthViewWithDateFilter,
            MonthViewWithDateClass,
          ],
          providers: [
            {provide: Directionality, useFactory: () => ({value: 'ltr'})},
            {provide: MAT_DATE_RANGE_SELECTION_STRATEGY, useClass: DefaultMatCalendarRangeStrategy},
            {
              provide: MAT_DATE_FORMATS,
              useValue: {
                parse: {
                  dateInput: null,
                },
                display: {
                  dateInput: {year: 'numeric', month: 'numeric', day: 'numeric'},
                  monthLabel: {year: 'numeric', month: 'short'},
                  monthYearLabel: {year: 'numeric', month: 'short'},
                  dateA11yLabel: {year: 'numeric', month: 'long', day: 'numeric'},
                  monthYearA11yLabel: {year: 'numeric', month: 'long'},
                },
              },
            },
          ],
        });

        TestBed.compileComponents();

        fixture = TestBed.createComponent(StandardMonthView);
        fixture.detectChanges();

        let monthViewDebugElement = fixture.debugElement.query(By.directive(MatMonthView))!;
        monthViewNativeElement = monthViewDebugElement.nativeElement;
      }),
    );

    it('has correct month label', () => {
      let labelEl = monthViewNativeElement.querySelector('.mat-calendar-body-label')!;
      expect(labelEl.innerHTML.trim()).toBe('Jan 2017');
    });
  });
});

@Component({
  template: `
    <mat-month-view
      [(activeDate)]="date"
      [(selected)]="selected"
      (selectedChange)="selectedChangeSpy($event)"
      (_userSelection)="userSelectionSpy($event)"></mat-month-view>`,
})
class StandardMonthView {
  date = new Date(2017, JAN, 5);
  selected: Date | DateRange<Date> = new Date(2017, JAN, 10);
  selectedChangeSpy = jasmine.createSpy('selectedChange');
  userSelectionSpy = jasmine.createSpy('userSelection');
}

@Component({
  template: `
    <mat-month-view
      [activeDate]="activeDate"
      [dateFilter]="dateFilter"
      [minDate]="minDate"
      [maxDate]="maxDate"></mat-month-view>`,
})
class MonthViewWithDateFilter {
  activeDate = new Date(2017, JAN, 1);
  minDate: Date | null = null;
  maxDate: Date | null = null;
  dateFilter(date: Date) {
    return date.getDate() % 2 == 0;
  }
}

@Component({
  template: `<mat-month-view [activeDate]="activeDate" [dateClass]="dateClass"></mat-month-view>`,
})
class MonthViewWithDateClass {
  activeDate = new Date(2017, JAN, 1);
  dateClass(date: Date) {
    return date.getDate() % 2 == 0 ? 'even' : undefined;
  }
}
