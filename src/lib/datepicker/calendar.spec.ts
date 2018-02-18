import {
  ENTER,
  RIGHT_ARROW,
} from '@angular/cdk/keycodes';
import {dispatchFakeEvent, dispatchKeyboardEvent, dispatchMouseEvent} from '@angular/cdk/testing';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed, async, inject} from '@angular/core/testing';
import {DEC, FEB, JAN, MatNativeDateModule, NOV} from '@angular/material/core';
import {By} from '@angular/platform-browser';
import {Direction, Directionality} from '@angular/cdk/bidi';
import {MatButtonModule} from '../button/index';
import {MatCalendar} from './calendar';
import {MatCalendarBody} from './calendar-body';
import {MatDatepickerIntl} from './datepicker-intl';
import {MatMonthView} from './month-view';
import {MatMultiYearView, yearsPerPage} from './multi-year-view';
import {MatYearView} from './year-view';


describe('MatCalendar', () => {
  let dir: {value: Direction};

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatButtonModule,
        MatNativeDateModule,
      ],
      declarations: [
        MatCalendar,
        MatCalendarBody,
        MatMonthView,
        MatYearView,
        MatMultiYearView,

        // Test components.
        StandardCalendar,
        CalendarWithMinMax,
        CalendarWithDateFilter,
      ],
      providers: [
        MatDatepickerIntl,
        {provide: Directionality, useFactory: () => dir = {value: 'ltr'}}
      ],
    });

    TestBed.compileComponents();
  }));

  describe('standard calendar', () => {
    let fixture: ComponentFixture<StandardCalendar>;
    let testComponent: StandardCalendar;
    let calendarElement: HTMLElement;
    let periodButton: HTMLElement;
    let prevButton: HTMLElement;
    let nextButton: HTMLElement;
    let calendarInstance: MatCalendar<Date>;

    beforeEach(() => {
      fixture = TestBed.createComponent(StandardCalendar);
      fixture.detectChanges();

      let calendarDebugElement = fixture.debugElement.query(By.directive(MatCalendar));
      calendarElement = calendarDebugElement.nativeElement;
      periodButton = calendarElement.querySelector('.mat-calendar-period-button') as HTMLElement;
      prevButton = calendarElement.querySelector('.mat-calendar-previous-button') as HTMLElement;
      nextButton = calendarElement.querySelector('.mat-calendar-next-button') as HTMLElement;

      calendarInstance = calendarDebugElement.componentInstance;
      testComponent = fixture.componentInstance;
    });

    it('should be in month view with specified month active', () => {
      expect(calendarInstance._currentView).toBe('month');
      expect(calendarInstance._activeDate).toEqual(new Date(2017, JAN, 31));
    });

    it('should toggle view when period clicked', () => {
      expect(calendarInstance._currentView).toBe('month');

      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance._currentView).toBe('multi-year');

      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance._currentView).toBe('month');
    });

    it('should go to next and previous month', () => {
      expect(calendarInstance._activeDate).toEqual(new Date(2017, JAN, 31));

      nextButton.click();
      fixture.detectChanges();

      expect(calendarInstance._activeDate).toEqual(new Date(2017, FEB, 28));

      prevButton.click();
      fixture.detectChanges();

      expect(calendarInstance._activeDate).toEqual(new Date(2017, JAN, 28));
    });

    it('should go to previous and next year', () => {
      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance._currentView).toBe('multi-year');
      expect(calendarInstance._activeDate).toEqual(new Date(2017, JAN, 31));

      (calendarElement.querySelector('.mat-calendar-body-active') as HTMLElement).click();
      fixture.detectChanges();

      expect(calendarInstance._currentView).toBe('year');

      nextButton.click();
      fixture.detectChanges();

      expect(calendarInstance._activeDate).toEqual(new Date(2018, JAN, 31));

      prevButton.click();
      fixture.detectChanges();

      expect(calendarInstance._activeDate).toEqual(new Date(2017, JAN, 31));
    });

    it('should go to previous and next multi-year range', () => {
      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance._currentView).toBe('multi-year');
      expect(calendarInstance._activeDate).toEqual(new Date(2017, JAN, 31));

      nextButton.click();
      fixture.detectChanges();

      expect(calendarInstance._activeDate).toEqual(new Date(2017 + yearsPerPage, JAN, 31));

      prevButton.click();
      fixture.detectChanges();

      expect(calendarInstance._activeDate).toEqual(new Date(2017, JAN, 31));
    });

    it('should go back to month view after selecting year and month', () => {
      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance._currentView).toBe('multi-year');
      expect(calendarInstance._activeDate).toEqual(new Date(2017, JAN, 31));

      let yearCells = calendarElement.querySelectorAll('.mat-calendar-body-cell');
      (yearCells[0] as HTMLElement).click();
      fixture.detectChanges();

      expect(calendarInstance._currentView).toBe('year');
      expect(calendarInstance._activeDate).toEqual(new Date(2016, JAN, 31));

      let monthCells = calendarElement.querySelectorAll('.mat-calendar-body-cell');
      (monthCells[monthCells.length - 1] as HTMLElement).click();
      fixture.detectChanges();

      expect(calendarInstance._currentView).toBe('month');
      expect(calendarInstance._activeDate).toEqual(new Date(2016, DEC, 31));
      expect(testComponent.selected).toBeFalsy('no date should be selected yet');
    });

    it('should select date in month view', () => {
      let monthCells = calendarElement.querySelectorAll('.mat-calendar-body-cell');
      (monthCells[monthCells.length - 1] as HTMLElement).click();
      fixture.detectChanges();

      expect(calendarInstance._currentView).toBe('month');
      expect(testComponent.selected).toEqual(new Date(2017, JAN, 31));
    });

    it('should emit the selected month on cell clicked in year view', () => {
      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance._currentView).toBe('multi-year');
      expect(calendarInstance._activeDate).toEqual(new Date(2017, JAN, 31));

      (calendarElement.querySelector('.mat-calendar-body-active') as HTMLElement).click();

      fixture.detectChanges();

      expect(calendarInstance._currentView).toBe('year');

      (calendarElement.querySelector('.mat-calendar-body-active') as HTMLElement).click();

      const normalizedMonth: Date = fixture.componentInstance.selectedMonth;
      expect(normalizedMonth.getMonth()).toEqual(0);
    });

    it('should emit the selected year on cell clicked in multiyear view', () => {
      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance._currentView).toBe('multi-year');
      expect(calendarInstance._activeDate).toEqual(new Date(2017, JAN, 31));

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
      })
    );


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
          expect(calendarInstance._activeDate).toEqual(new Date(2017, JAN, 31));
        });

        it('should make the calendar body focusable', () => {
          expect(calendarBodyEl.getAttribute('tabindex')).toBe('-1');
        });

        describe('year view', () => {
          beforeEach(() => {
            dispatchMouseEvent(periodButton, 'click');
            fixture.detectChanges();

            expect(calendarInstance._currentView).toBe('multi-year');

            (calendarBodyEl.querySelector('.mat-calendar-body-active') as HTMLElement).click();
            fixture.detectChanges();

            expect(calendarInstance._currentView).toBe('year');
          });

          it('should return to month view on enter', () => {
            const tableBodyEl = calendarBodyEl.querySelector('.mat-calendar-body') as HTMLElement;

            dispatchKeyboardEvent(tableBodyEl, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();

            dispatchKeyboardEvent(tableBodyEl, 'keydown', ENTER);
            fixture.detectChanges();

            expect(calendarInstance._currentView).toBe('month');
            expect(calendarInstance._activeDate).toEqual(new Date(2017, FEB, 28));
            expect(testComponent.selected).toBeUndefined();
          });
        });

        describe('multi-year view', () => {
          beforeEach(() => {
            dispatchMouseEvent(periodButton, 'click');
            fixture.detectChanges();

            expect(calendarInstance._currentView).toBe('multi-year');
          });

          it('should go to year view on enter', () => {
            const tableBodyEl = calendarBodyEl.querySelector('.mat-calendar-body') as HTMLElement;

            dispatchKeyboardEvent(tableBodyEl, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();

            dispatchKeyboardEvent(tableBodyEl, 'keydown', ENTER);
            fixture.detectChanges();

            expect(calendarInstance._currentView).toBe('year');
            expect(calendarInstance._activeDate).toEqual(new Date(2018, JAN, 31));
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

      expect(calendarInstance._activeDate).toEqual(new Date(2016, JAN, 1));
    });

    it('should clamp startAt value above max date', () => {
      testComponent.startAt = new Date(2020, JAN, 1);
      fixture.detectChanges();

      expect(calendarInstance._activeDate).toEqual(new Date(2018, JAN, 1));
    });

    it('should not go back past min date', () => {
      testComponent.startAt = new Date(2016, FEB, 1);
      fixture.detectChanges();

      let prevButton =
          calendarElement.querySelector('.mat-calendar-previous-button') as HTMLButtonElement;

      expect(prevButton.disabled).toBe(false, 'previous button should not be disabled');
      expect(calendarInstance._activeDate).toEqual(new Date(2016, FEB, 1));

      prevButton.click();
      fixture.detectChanges();

      expect(prevButton.disabled).toBe(true, 'previous button should be disabled');
      expect(calendarInstance._activeDate).toEqual(new Date(2016, JAN, 1));

      prevButton.click();
      fixture.detectChanges();

      expect(calendarInstance._activeDate).toEqual(new Date(2016, JAN, 1));
    });

    it('should not go forward past max date', () => {
      testComponent.startAt = new Date(2017, DEC, 1);
      fixture.detectChanges();

      let nextButton =
          calendarElement.querySelector('.mat-calendar-next-button') as HTMLButtonElement;

      expect(nextButton.disabled).toBe(false, 'next button should not be disabled');
      expect(calendarInstance._activeDate).toEqual(new Date(2017, DEC, 1));

      nextButton.click();
      fixture.detectChanges();

      expect(nextButton.disabled).toBe(true, 'next button should be disabled');
      expect(calendarInstance._activeDate).toEqual(new Date(2018, JAN, 1));

      nextButton.click();
      fixture.detectChanges();

      expect(calendarInstance._activeDate).toEqual(new Date(2018, JAN, 1));
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
        expect(calendarInstance._currentView).toBe('month');
        expect(calendarInstance._activeDate).toEqual(new Date(2017, JAN, 1));

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

        calendarInstance._activeDate = new Date(2017, NOV, 1);
        fixture.detectChanges();

        expect(calendarInstance._currentView).toBe('year');

        tableBodyEl = calendarElement.querySelector('.mat-calendar-body') as HTMLElement;
        dispatchKeyboardEvent(tableBodyEl, 'keydown', ENTER);
        fixture.detectChanges();

        expect(calendarInstance._currentView).toBe('month');
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
