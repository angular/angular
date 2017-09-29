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
import {dispatchFakeEvent, dispatchKeyboardEvent, dispatchMouseEvent} from '@angular/cdk/testing';
import {Component} from '@angular/core';
import {async, ComponentFixture, inject, TestBed} from '@angular/core/testing';
import {
  AUG,
  DEC,
  FEB,
  JAN,
  JUL,
  JUN,
  MAR,
  MAY,
  MatNativeDateModule,
  NOV,
  SEP,
} from '@angular/material/core';
import {By} from '@angular/platform-browser';
import {MatButtonModule} from '../button/index';
import {MatCalendar} from './calendar';
import {MatCalendarBody} from './calendar-body';
import {MatDatepickerIntl} from './datepicker-intl';
import {MatMonthView} from './month-view';
import {MatYearView} from './year-view';


describe('MatCalendar', () => {
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

        // Test components.
        StandardCalendar,
        CalendarWithMinMax,
        CalendarWithDateFilter,
      ],
      providers: [
        MatDatepickerIntl,
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
      expect(calendarInstance._monthView).toBe(true, 'should be in month view');
      expect(calendarInstance._activeDate).toEqual(new Date(2017, JAN, 31));
    });

    it('should toggle view when period clicked', () => {
      expect(calendarInstance._monthView).toBe(true, 'should be in month view');

      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance._monthView).toBe(false, 'should be in year view');

      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance._monthView).toBe(true, 'should be in month view');
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

      expect(calendarInstance._monthView).toBe(false, 'should be in year view');
      expect(calendarInstance._activeDate).toEqual(new Date(2017, JAN, 31));

      nextButton.click();
      fixture.detectChanges();

      expect(calendarInstance._activeDate).toEqual(new Date(2018, JAN, 31));

      prevButton.click();
      fixture.detectChanges();

      expect(calendarInstance._activeDate).toEqual(new Date(2017, JAN, 31));
    });

    it('should go back to month view after selecting month in year view', () => {
      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance._monthView).toBe(false, 'should be in year view');
      expect(calendarInstance._activeDate).toEqual(new Date(2017, JAN, 31));

      let monthCells = calendarElement.querySelectorAll('.mat-calendar-body-cell');
      (monthCells[monthCells.length - 1] as HTMLElement).click();
      fixture.detectChanges();

      expect(calendarInstance._monthView).toBe(true, 'should be in month view');
      expect(calendarInstance._activeDate).toEqual(new Date(2017, DEC, 31));
      expect(testComponent.selected).toBeFalsy('no date should be selected yet');
    });

    it('should select date in month view', () => {
      let monthCells = calendarElement.querySelectorAll('.mat-calendar-body-cell');
      (monthCells[monthCells.length - 1] as HTMLElement).click();
      fixture.detectChanges();

      expect(calendarInstance._monthView).toBe(true, 'should be in month view');
      expect(testComponent.selected).toEqual(new Date(2017, JAN, 31));
    });

    it('should re-render when the i18n labels have changed',
      inject([MatDatepickerIntl], (intl: MatDatepickerIntl) => {
        const button = fixture.debugElement.nativeElement
            .querySelector('.mat-calendar-period-button');

        intl.switchToYearViewLabel = 'Go to year view?';
        intl.changes.next();
        fixture.detectChanges();

        expect(button.getAttribute('aria-label')).toBe('Go to year view?');
      }));

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

        describe('month view', () => {
          it('should decrement date on left arrow press', () => {
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new Date(2017, JAN, 30));

            calendarInstance._activeDate = new Date(2017, JAN, 1);
            fixture.detectChanges();

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new Date(2016, DEC, 31));
          });

          it('should increment date on right arrow press', () => {
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new Date(2017, FEB, 1));

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new Date(2017, FEB, 2));
          });

          it('should go up a row on up arrow press', () => {
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', UP_ARROW);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new Date(2017, JAN, 24));

            calendarInstance._activeDate = new Date(2017, JAN, 7);
            fixture.detectChanges();

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', UP_ARROW);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new Date(2016, DEC, 31));
          });

          it('should go down a row on down arrow press', () => {
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', DOWN_ARROW);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new Date(2017, FEB, 7));

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', DOWN_ARROW);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new Date(2017, FEB, 14));
          });

          it('should go to beginning of the month on home press', () => {
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', HOME);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new Date(2017, JAN, 1));

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', HOME);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new Date(2017, JAN, 1));
          });

          it('should go to end of the month on end press', () => {
            calendarInstance._activeDate = new Date(2017, JAN, 10);

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', END);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new Date(2017, JAN, 31));

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', END);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new Date(2017, JAN, 31));
          });

          it('should go back one month on page up press', () => {
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_UP);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new Date(2016, DEC, 31));

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_UP);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new Date(2016, NOV, 30));
          });

          it('should go forward one month on page down press', () => {
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_DOWN);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new Date(2017, FEB, 28));

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_DOWN);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new Date(2017, MAR, 28));
          });

          it('should select active date on enter', () => {
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
            fixture.detectChanges();

            expect(testComponent.selected).toBeUndefined();

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', ENTER);
            fixture.detectChanges();

            expect(testComponent.selected).toEqual(new Date(2017, JAN, 30));
          });
        });

        describe('year view', () => {
          beforeEach(() => {
            dispatchMouseEvent(periodButton, 'click');
            fixture.detectChanges();

            expect(calendarInstance._monthView).toBe(false);
          });

          it('should decrement month on left arrow press', () => {
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new Date(2016, DEC, 31));

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new Date(2016, NOV, 30));
          });

          it('should increment month on right arrow press', () => {
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new Date(2017, FEB, 28));

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new Date(2017, MAR, 28));
          });

          it('should go up a row on up arrow press', () => {
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', UP_ARROW);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new Date(2016, AUG, 31));

            calendarInstance._activeDate = new Date(2017, JUL, 1);
            fixture.detectChanges();

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', UP_ARROW);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new Date(2016, JUL, 1));

            calendarInstance._activeDate = new Date(2017, DEC, 10);
            fixture.detectChanges();

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', UP_ARROW);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new Date(2017, MAY, 10));
          });

          it('should go down a row on down arrow press', () => {
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', DOWN_ARROW);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new Date(2017, AUG, 31));

            calendarInstance._activeDate = new Date(2017, JUN, 1);
            fixture.detectChanges();

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', DOWN_ARROW);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new Date(2018, JUN, 1));

            calendarInstance._activeDate = new Date(2017, SEP, 30);
            fixture.detectChanges();

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', DOWN_ARROW);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new Date(2018, FEB, 28));
          });

          it('should go to first month of the year on home press', () => {
            calendarInstance._activeDate = new Date(2017, SEP, 30);
            fixture.detectChanges();

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', HOME);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new Date(2017, JAN, 30));

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', HOME);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new Date(2017, JAN, 30));
          });

          it('should go to last month of the year on end press', () => {
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', END);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new Date(2017, DEC, 31));

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', END);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new Date(2017, DEC, 31));
          });

          it('should go back one year on page up press', () => {
            calendarInstance._activeDate = new Date(2016, FEB, 29);
            fixture.detectChanges();

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_UP);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new Date(2015, FEB, 28));

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_UP);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new Date(2014, FEB, 28));
          });

          it('should go forward one year on page down press', () => {
            calendarInstance._activeDate = new Date(2016, FEB, 29);
            fixture.detectChanges();

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_DOWN);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new Date(2017, FEB, 28));

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_DOWN);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new Date(2018, FEB, 28));
          });

          it('should return to month view on enter', () => {
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', ENTER);
            fixture.detectChanges();

            expect(calendarInstance._monthView).toBe(true);
            expect(calendarInstance._activeDate).toEqual(new Date(2017, FEB, 28));
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

      spyOn(calendarInstance.yearView, '_init').and.callThrough();

      testComponent.maxDate = new Date(2017, DEC, 1);
      fixture.detectChanges();

      expect(calendarInstance.yearView._init).toHaveBeenCalled();
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
      let calendarBodyEl: HTMLElement;

      beforeEach(() => {
        calendarBodyEl = calendarElement.querySelector('.mat-calendar-content') as HTMLElement;
        expect(calendarBodyEl).not.toBeNull();

        dispatchFakeEvent(calendarBodyEl, 'focus');
        fixture.detectChanges();
      });

      it('should not allow selection of disabled date in month view', () => {
        expect(calendarInstance._monthView).toBe(true);
        expect(calendarInstance._activeDate).toEqual(new Date(2017, JAN, 1));

        dispatchKeyboardEvent(calendarBodyEl, 'keydown', ENTER);
        fixture.detectChanges();

        expect(testComponent.selected).toBeUndefined();
      });

      it('should allow entering month view at disabled month', () => {
        let periodButton =
            calendarElement.querySelector('.mat-calendar-period-button') as HTMLElement;
        dispatchMouseEvent(periodButton, 'click');
        fixture.detectChanges();

        calendarInstance._activeDate = new Date(2017, NOV, 1);
        fixture.detectChanges();

        expect(calendarInstance._monthView).toBe(false);

        dispatchKeyboardEvent(calendarBodyEl, 'keydown', ENTER);
        fixture.detectChanges();

        expect(calendarInstance._monthView).toBe(true);
        expect(testComponent.selected).toBeUndefined();
      });
    });
  });
});


@Component({
  template: `<mat-calendar [startAt]="startDate" [(selected)]="selected"></mat-calendar>`
})
class StandardCalendar {
  selected: Date;
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
    return date.getDate() % 2 == 0 && date.getMonth() != NOV;
  }
}
