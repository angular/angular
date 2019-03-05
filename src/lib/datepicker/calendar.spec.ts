import {Directionality} from '@angular/cdk/bidi';
import {ENTER, RIGHT_ARROW, SPACE} from '@angular/cdk/keycodes';
import {
  dispatchFakeEvent,
  dispatchKeyboardEvent,
  dispatchMouseEvent,
  MockNgZone,
} from '@angular/cdk/testing';
import {Component, NgZone} from '@angular/core';
import {async, ComponentFixture, inject, TestBed} from '@angular/core/testing';
import {DateAdapter, MatNativeDateModule} from '@angular/material/core';
import {DEC, FEB, JAN, JUL, NOV} from '@angular/material/testing';
import {By} from '@angular/platform-browser';
import {MatCalendar} from './calendar';
import {MatDatepickerIntl} from './datepicker-intl';
import {MatDatepickerModule} from './datepicker-module';

describe('MatCalendar', () => {
  let zone: MockNgZone;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatNativeDateModule,
        MatDatepickerModule,
      ],
      declarations: [
        // Test components.
        StandardCalendar,
        CalendarWithMinMax,
        CalendarWithDateFilter,
        CalendarWithSelectableMinDate,
      ],
      providers: [
        MatDatepickerIntl,
        {provide: NgZone, useFactory: () => zone = new MockNgZone()},
        {provide: Directionality, useFactory: () => ({value: 'ltr'})},
      ],
    });

    TestBed.compileComponents();
  }));

  describe('standard calendar', () => {
    let fixture: ComponentFixture<StandardCalendar>;
    let testComponent: StandardCalendar;
    let calendarElement: HTMLElement;
    let periodButton: HTMLElement;
    let calendarInstance: MatCalendar<Date>;

    beforeEach(() => {
      fixture = TestBed.createComponent(StandardCalendar);
      fixture.detectChanges();

      let calendarDebugElement = fixture.debugElement.query(By.directive(MatCalendar));
      calendarElement = calendarDebugElement.nativeElement;
      periodButton = calendarElement.querySelector('.mat-calendar-period-button') as HTMLElement;

      calendarInstance = calendarDebugElement.componentInstance;
      testComponent = fixture.componentInstance;
    });

    it(`should update today's date`, inject([DateAdapter], (adapter: DateAdapter<Date>) => {
      let fakeToday = new Date(2018, 0, 1);
      spyOn(adapter, 'today').and.callFake(() => fakeToday);

      calendarInstance.activeDate = fakeToday;
      calendarInstance.updateTodaysDate();
      fixture.detectChanges();

      let todayCell = calendarElement.querySelector('.mat-calendar-body-today')!;
      expect(todayCell).not.toBeNull();
      expect(todayCell.innerHTML.trim()).toBe('1');

      fakeToday = new Date(2018, 0, 10);
      calendarInstance.updateTodaysDate();
      fixture.detectChanges();

      todayCell = calendarElement.querySelector('.mat-calendar-body-today')!;
      expect(todayCell).not.toBeNull();
      expect(todayCell.innerHTML.trim()).toBe('10');
    }));

    it('should be in month view with specified month active', () => {
      expect(calendarInstance.currentView).toBe('month');
      expect(calendarInstance.activeDate).toEqual(new Date(2017, JAN, 31));
    });

    it('should select date in month view', () => {
      let monthCells = calendarElement.querySelectorAll('.mat-calendar-body-cell');
      (monthCells[monthCells.length - 1] as HTMLElement).click();
      fixture.detectChanges();

      expect(calendarInstance.currentView).toBe('month');
      expect(testComponent.selected).toEqual(new Date(2017, JAN, 31));
    });

    it('should emit the selected month on cell clicked in year view', () => {
      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance.currentView).toBe('multi-year');
      expect(calendarInstance.activeDate).toEqual(new Date(2017, JAN, 31));

      (calendarElement.querySelector('.mat-calendar-body-active') as HTMLElement).click();

      fixture.detectChanges();

      expect(calendarInstance.currentView).toBe('year');

      (calendarElement.querySelector('.mat-calendar-body-active') as HTMLElement).click();

      const normalizedMonth: Date = fixture.componentInstance.selectedMonth;
      expect(normalizedMonth.getMonth()).toEqual(0);
    });

    it('should emit the selected year on cell clicked in multiyear view', () => {
      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance.currentView).toBe('multi-year');
      expect(calendarInstance.activeDate).toEqual(new Date(2017, JAN, 31));

      (calendarElement.querySelector('.mat-calendar-body-active') as HTMLElement).click();

      fixture.detectChanges();

      const normalizedYear: Date = fixture.componentInstance.selectedYear;
      expect(normalizedYear.getFullYear()).toEqual(2017);
    });

    it('should re-render when the i18n labels have changed',
      inject([MatDatepickerIntl], (intl: MatDatepickerIntl) => {
        const button = fixture.debugElement.nativeElement
            .querySelector('.mat-calendar-period-button');

        intl.switchToMultiYearViewLabel = 'Go to multi-year view?';
        intl.changes.next();
        fixture.detectChanges();

        expect(button.getAttribute('aria-label')).toBe('Go to multi-year view?');
      }));

    it('should set all buttons to be `type="button"`', () => {
      const invalidButtons = calendarElement.querySelectorAll('button:not([type="button"])');
      expect(invalidButtons.length).toBe(0);
    });

    it('should complete the stateChanges stream', () => {
      const spy = jasmine.createSpy('complete spy');
      const subscription = calendarInstance.stateChanges.subscribe(undefined, undefined, spy);

      fixture.destroy();

      expect(spy).toHaveBeenCalled();
      subscription.unsubscribe();
    });

    describe('a11y', () => {
      describe('calendar body', () => {
        let calendarBodyEl: HTMLElement;

        beforeEach(() => {
          calendarBodyEl = calendarElement.querySelector('.mat-calendar-content') as HTMLElement;
          expect(calendarBodyEl).not.toBeNull();

          dispatchFakeEvent(calendarBodyEl, 'focus');
          fixture.detectChanges();
        });

        it('should initially set start date active', () => {
          expect(calendarInstance.activeDate).toEqual(new Date(2017, JAN, 31));
        });

        it('should make the calendar body focusable', () => {
          expect(calendarBodyEl.getAttribute('tabindex')).toBe('-1');
        });

        it('should not move focus to the active cell on init', () => {
          const activeCell =
              calendarBodyEl.querySelector('.mat-calendar-body-active')! as HTMLElement;

          spyOn(activeCell, 'focus').and.callThrough();
          fixture.detectChanges();
          zone.simulateZoneExit();

          expect(activeCell.focus).not.toHaveBeenCalled();
        });

        it('should move focus to the active cell when the view changes', () => {
          calendarInstance.currentView = 'multi-year';
          fixture.detectChanges();

          const activeCell =
              calendarBodyEl.querySelector('.mat-calendar-body-active')! as HTMLElement;
          spyOn(activeCell, 'focus').and.callThrough();

          zone.simulateZoneExit();

          expect(activeCell.focus).toHaveBeenCalled();
        });

        describe('year view', () => {
          beforeEach(() => {
            dispatchMouseEvent(periodButton, 'click');
            fixture.detectChanges();

            expect(calendarInstance.currentView).toBe('multi-year');

            (calendarBodyEl.querySelector('.mat-calendar-body-active') as HTMLElement).click();
            fixture.detectChanges();

            expect(calendarInstance.currentView).toBe('year');
          });

          it('should return to month view on enter', () => {
            const tableBodyEl = calendarBodyEl.querySelector('.mat-calendar-body') as HTMLElement;

            dispatchKeyboardEvent(tableBodyEl, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();

            dispatchKeyboardEvent(tableBodyEl, 'keydown', ENTER);
            fixture.detectChanges();

            expect(calendarInstance.currentView).toBe('month');
            expect(calendarInstance.activeDate).toEqual(new Date(2017, FEB, 28));
            expect(testComponent.selected).toBeUndefined();
          });

          it('should return to month view on space', () => {
            const tableBodyEl = calendarBodyEl.querySelector('.mat-calendar-body') as HTMLElement;

            dispatchKeyboardEvent(tableBodyEl, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();

            dispatchKeyboardEvent(tableBodyEl, 'keydown', SPACE);
            fixture.detectChanges();

            expect(calendarInstance.currentView).toBe('month');
            expect(calendarInstance.activeDate).toEqual(new Date(2017, FEB, 28));
            expect(testComponent.selected).toBeUndefined();
          });
        });

        describe('multi-year view', () => {
          beforeEach(() => {
            dispatchMouseEvent(periodButton, 'click');
            fixture.detectChanges();

            expect(calendarInstance.currentView).toBe('multi-year');
          });

          it('should go to year view on enter', () => {
            const tableBodyEl = calendarBodyEl.querySelector('.mat-calendar-body') as HTMLElement;

            dispatchKeyboardEvent(tableBodyEl, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();

            dispatchKeyboardEvent(tableBodyEl, 'keydown', ENTER);
            fixture.detectChanges();

            expect(calendarInstance.currentView).toBe('year');
            expect(calendarInstance.activeDate).toEqual(new Date(2018, JAN, 31));
            expect(testComponent.selected).toBeUndefined();
          });

          it('should go to year view on space', () => {
            const tableBodyEl = calendarBodyEl.querySelector('.mat-calendar-body') as HTMLElement;

            dispatchKeyboardEvent(tableBodyEl, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();

            dispatchKeyboardEvent(tableBodyEl, 'keydown', SPACE);
            fixture.detectChanges();

            expect(calendarInstance.currentView).toBe('year');
            expect(calendarInstance.activeDate).toEqual(new Date(2018, JAN, 31));
            expect(testComponent.selected).toBeUndefined();
          });

        });

      });
    });

  });

  describe('calendar with min and max date', () => {
    let fixture: ComponentFixture<CalendarWithMinMax>;
    let testComponent: CalendarWithMinMax;
    let calendarElement: HTMLElement;
    let calendarInstance: MatCalendar<Date>;

    beforeEach(() => {
      fixture = TestBed.createComponent(CalendarWithMinMax);

      let calendarDebugElement = fixture.debugElement.query(By.directive(MatCalendar));
      calendarElement = calendarDebugElement.nativeElement;
      calendarInstance = calendarDebugElement.componentInstance;
      testComponent = fixture.componentInstance;
    });

    it('should clamp startAt value below min date', () => {
      testComponent.startAt = new Date(2000, JAN, 1);
      fixture.detectChanges();

      expect(calendarInstance.activeDate).toEqual(new Date(2016, JAN, 1));
    });

    it('should clamp startAt value above max date', () => {
      testComponent.startAt = new Date(2020, JAN, 1);
      fixture.detectChanges();

      expect(calendarInstance.activeDate).toEqual(new Date(2018, JAN, 1));
    });

    it('should not go back past min date', () => {
      testComponent.startAt = new Date(2016, FEB, 1);
      fixture.detectChanges();

      let prevButton =
          calendarElement.querySelector('.mat-calendar-previous-button') as HTMLButtonElement;

      expect(prevButton.disabled).toBe(false, 'previous button should not be disabled');
      expect(calendarInstance.activeDate).toEqual(new Date(2016, FEB, 1));

      prevButton.click();
      fixture.detectChanges();

      expect(prevButton.disabled).toBe(true, 'previous button should be disabled');
      expect(calendarInstance.activeDate).toEqual(new Date(2016, JAN, 1));

      prevButton.click();
      fixture.detectChanges();

      expect(calendarInstance.activeDate).toEqual(new Date(2016, JAN, 1));
    });

    it('should not go forward past max date', () => {
      testComponent.startAt = new Date(2017, DEC, 1);
      fixture.detectChanges();

      let nextButton =
          calendarElement.querySelector('.mat-calendar-next-button') as HTMLButtonElement;

      expect(nextButton.disabled).toBe(false, 'next button should not be disabled');
      expect(calendarInstance.activeDate).toEqual(new Date(2017, DEC, 1));

      nextButton.click();
      fixture.detectChanges();

      expect(nextButton.disabled).toBe(true, 'next button should be disabled');
      expect(calendarInstance.activeDate).toEqual(new Date(2018, JAN, 1));

      nextButton.click();
      fixture.detectChanges();

      expect(calendarInstance.activeDate).toEqual(new Date(2018, JAN, 1));
    });

    it('should re-render the month view when the minDate changes', () => {
      fixture.detectChanges();
      spyOn(calendarInstance.monthView, '_init').and.callThrough();

      testComponent.minDate = new Date(2017, NOV, 1);
      fixture.detectChanges();

      expect(calendarInstance.monthView._init).toHaveBeenCalled();
    });

    it('should re-render the month view when the maxDate changes', () => {
      fixture.detectChanges();
      spyOn(calendarInstance.monthView, '_init').and.callThrough();

      testComponent.maxDate = new Date(2017, DEC, 1);
      fixture.detectChanges();

      expect(calendarInstance.monthView._init).toHaveBeenCalled();
    });

    it('should re-render the year view when the minDate changes', () => {
      fixture.detectChanges();
      const periodButton =
          calendarElement.querySelector('.mat-calendar-period-button') as HTMLElement;
      periodButton.click();
      fixture.detectChanges();

      (calendarElement.querySelector('.mat-calendar-body-active') as HTMLElement).click();
      fixture.detectChanges();

      spyOn(calendarInstance.yearView, '_init').and.callThrough();

      testComponent.minDate = new Date(2017, NOV, 1);
      fixture.detectChanges();

      expect(calendarInstance.yearView._init).toHaveBeenCalled();
    });

    it('should re-render the year view when the maxDate changes', () => {
      fixture.detectChanges();
      const periodButton =
          calendarElement.querySelector('.mat-calendar-period-button') as HTMLElement;
      periodButton.click();
      fixture.detectChanges();

      (calendarElement.querySelector('.mat-calendar-body-active') as HTMLElement).click();
      fixture.detectChanges();

      spyOn(calendarInstance.yearView, '_init').and.callThrough();

      testComponent.maxDate = new Date(2017, DEC, 1);
      fixture.detectChanges();

      expect(calendarInstance.yearView._init).toHaveBeenCalled();
    });

    it('should re-render the multi-year view when the minDate changes', () => {
      fixture.detectChanges();
      const periodButton =
          calendarElement.querySelector('.mat-calendar-period-button') as HTMLElement;
      periodButton.click();
      fixture.detectChanges();

      spyOn(calendarInstance.multiYearView, '_init').and.callThrough();

      testComponent.minDate = new Date(2017, NOV, 1);
      fixture.detectChanges();

      expect(calendarInstance.multiYearView._init).toHaveBeenCalled();
    });

    it('should re-render the multi-year view when the maxDate changes', () => {
      fixture.detectChanges();
      const periodButton =
          calendarElement.querySelector('.mat-calendar-period-button') as HTMLElement;
      periodButton.click();
      fixture.detectChanges();

      spyOn(calendarInstance.multiYearView, '_init').and.callThrough();

      testComponent.maxDate = new Date(2017, DEC, 1);
      fixture.detectChanges();

      expect(calendarInstance.multiYearView._init).toHaveBeenCalled();
    });

    it('should update the minDate in the child view if it changed after an interaction', () => {
      fixture.destroy();

      const dynamicFixture = TestBed.createComponent(CalendarWithSelectableMinDate);
      dynamicFixture.detectChanges();

      const calendarDebugElement = dynamicFixture.debugElement.query(By.directive(MatCalendar));
      const disabledClass = 'mat-calendar-body-disabled';
      calendarElement = calendarDebugElement.nativeElement;
      calendarInstance = calendarDebugElement.componentInstance;

      let cells = Array.from(calendarElement.querySelectorAll('.mat-calendar-body-cell'));

      expect(cells.slice(0, 9).every(c => c.classList.contains(disabledClass)))
          .toBe(true, 'Expected dates up to the 10th to be disabled.');

      expect(cells.slice(9).every(c => c.classList.contains(disabledClass)))
          .toBe(false, 'Expected dates after the 10th to be enabled.');

      (cells[14] as HTMLElement).click();
      dynamicFixture.detectChanges();
      cells = Array.from(calendarElement.querySelectorAll('.mat-calendar-body-cell'));

      expect(cells.slice(0, 14).every(c => c.classList.contains(disabledClass)))
          .toBe(true, 'Expected dates up to the 14th to be disabled.');

      expect(cells.slice(14).every(c => c.classList.contains(disabledClass)))
          .toBe(false, 'Expected dates after the 14th to be enabled.');
    });

  });

  describe('calendar with date filter', () => {
    let fixture: ComponentFixture<CalendarWithDateFilter>;
    let testComponent: CalendarWithDateFilter;
    let calendarElement: HTMLElement;
    let calendarInstance: MatCalendar<Date>;

    beforeEach(() => {
      fixture = TestBed.createComponent(CalendarWithDateFilter);
      fixture.detectChanges();

      let calendarDebugElement = fixture.debugElement.query(By.directive(MatCalendar));
      calendarElement = calendarDebugElement.nativeElement;
      calendarInstance = calendarDebugElement.componentInstance;
      testComponent = fixture.componentInstance;
    });

    it('should disable and prevent selection of filtered dates', () => {
      let cells = calendarElement.querySelectorAll('.mat-calendar-body-cell');
      (cells[0] as HTMLElement).click();
      fixture.detectChanges();

      expect(testComponent.selected).toBeFalsy();

      (cells[1] as HTMLElement).click();
      fixture.detectChanges();

      expect(testComponent.selected).toEqual(new Date(2017, JAN, 2));
    });

    describe('a11y', () => {
      let tableBodyEl: HTMLElement;

      beforeEach(() => {
        tableBodyEl = calendarElement.querySelector('.mat-calendar-body') as HTMLElement;
        expect(tableBodyEl).not.toBeNull();

        dispatchFakeEvent(tableBodyEl, 'focus');
        fixture.detectChanges();
      });

      it('should not allow selection of disabled date in month view', () => {
        expect(calendarInstance.currentView).toBe('month');
        expect(calendarInstance.activeDate).toEqual(new Date(2017, JAN, 1));

        dispatchKeyboardEvent(tableBodyEl, 'keydown', ENTER);
        fixture.detectChanges();

        expect(testComponent.selected).toBeUndefined();
      });

      it('should allow entering month view at disabled month', () => {
        let periodButton =
            calendarElement.querySelector('.mat-calendar-period-button') as HTMLElement;
        dispatchMouseEvent(periodButton, 'click');
        fixture.detectChanges();

        (calendarElement.querySelector('.mat-calendar-body-active') as HTMLElement).click();
        fixture.detectChanges();

        calendarInstance.activeDate = new Date(2017, NOV, 1);
        fixture.detectChanges();

        expect(calendarInstance.currentView).toBe('year');

        tableBodyEl = calendarElement.querySelector('.mat-calendar-body') as HTMLElement;
        dispatchKeyboardEvent(tableBodyEl, 'keydown', ENTER);
        fixture.detectChanges();

        expect(calendarInstance.currentView).toBe('month');
        expect(testComponent.selected).toBeUndefined();
      });
    });

  });
});


@Component({
  template: `
    <mat-calendar
        [startAt]="startDate"
        [(selected)]="selected"
        (yearSelected)="selectedYear=$event"
        (monthSelected)="selectedMonth=$event">
    </mat-calendar>`
})
class StandardCalendar {
  selected: Date;
  selectedYear: Date;
  selectedMonth: Date;
  startDate = new Date(2017, JAN, 31);
}


@Component({
  template: `
    <mat-calendar [startAt]="startAt" [minDate]="minDate" [maxDate]="maxDate"></mat-calendar>
  `
})
class CalendarWithMinMax {
  startAt: Date;
  minDate = new Date(2016, JAN, 1);
  maxDate = new Date(2018, JAN, 1);
}


@Component({
  template: `
    <mat-calendar [startAt]="startDate" [(selected)]="selected" [dateFilter]="dateFilter">
    </mat-calendar>
  `
})
class CalendarWithDateFilter {
  selected: Date;
  startDate = new Date(2017, JAN, 1);

  dateFilter (date: Date) {
    return !(date.getDate() % 2) && date.getMonth() !== NOV;
  }
}


@Component({
  template: `
    <mat-calendar
      [startAt]="startAt"
      (selectedChange)="select($event)"
      [selected]="selected"
      [minDate]="selected">
    </mat-calendar>
  `
})
class CalendarWithSelectableMinDate {
  startAt = new Date(2018, JUL, 0);
  selected: Date;
  minDate: Date;

  constructor() {
    this.select(new Date(2018, JUL, 10));
  }

  select(value: Date) {
    this.minDate = this.selected = value;
  }
}
