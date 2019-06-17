import {Directionality} from '@angular/cdk/bidi';
import {Component} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {MatNativeDateModule} from '@angular/material/core';
import {DEC, FEB, JAN} from '@angular/material/testing';
import {By} from '@angular/platform-browser';
import {MatCalendar} from './calendar';
import {MatDatepickerIntl} from './datepicker-intl';
import {MatDatepickerModule} from './datepicker-module';
import {yearsPerPage} from './multi-year-view';

describe('MatCalendarHeader', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatNativeDateModule,
        MatDatepickerModule,
      ],
      declarations: [
        // Test components.
        StandardCalendar,
        CalendarWithMinMaxDate,
      ],
      providers: [
        MatDatepickerIntl,
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
      expect(calendarInstance.currentView).toBe('month');
      expect(calendarInstance.activeDate).toEqual(new Date(2017, JAN, 31));
    });

    it('should toggle view when period clicked', () => {
      expect(calendarInstance.currentView).toBe('month');

      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance.currentView).toBe('multi-year');

      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance.currentView).toBe('month');
    });

    it('should go to next and previous month', () => {
      expect(calendarInstance.activeDate).toEqual(new Date(2017, JAN, 31));

      nextButton.click();
      fixture.detectChanges();

      expect(calendarInstance.activeDate).toEqual(new Date(2017, FEB, 28));

      prevButton.click();
      fixture.detectChanges();

      expect(calendarInstance.activeDate).toEqual(new Date(2017, JAN, 28));
    });

    it('should go to previous and next year', () => {
      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance.currentView).toBe('multi-year');
      expect(calendarInstance.activeDate).toEqual(new Date(2017, JAN, 31));

      (calendarElement.querySelector('.mat-calendar-body-active') as HTMLElement).click();
      fixture.detectChanges();

      expect(calendarInstance.currentView).toBe('year');

      nextButton.click();
      fixture.detectChanges();

      expect(calendarInstance.activeDate).toEqual(new Date(2018, JAN, 31));

      prevButton.click();
      fixture.detectChanges();

      expect(calendarInstance.activeDate).toEqual(new Date(2017, JAN, 31));
    });

    it('should go to previous and next multi-year range', () => {
      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance.currentView).toBe('multi-year');
      expect(calendarInstance.activeDate).toEqual(new Date(2017, JAN, 31));

      nextButton.click();
      fixture.detectChanges();

      expect(calendarInstance.activeDate).toEqual(new Date(2017 + yearsPerPage, JAN, 31));

      prevButton.click();
      fixture.detectChanges();

      expect(calendarInstance.activeDate).toEqual(new Date(2017, JAN, 31));
    });

    it('should go back to month view after selecting year and month', () => {
      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance.currentView).toBe('multi-year');
      expect(calendarInstance.activeDate).toEqual(new Date(2017, JAN, 31));

      let yearCells = calendarElement.querySelectorAll('.mat-calendar-body-cell');
      (yearCells[0] as HTMLElement).click();
      fixture.detectChanges();

      expect(calendarInstance.currentView).toBe('year');
      expect(calendarInstance.activeDate).toEqual(new Date(2016, JAN, 31));

      let monthCells = calendarElement.querySelectorAll('.mat-calendar-body-cell');
      (monthCells[monthCells.length - 1] as HTMLElement).click();
      fixture.detectChanges();

      expect(calendarInstance.currentView).toBe('month');
      expect(calendarInstance.activeDate).toEqual(new Date(2016, DEC, 31));
      expect(testComponent.selected).toBeFalsy('no date should be selected yet');
    });
  });

  describe('calendar with minDate only', () => {
    let fixture: ComponentFixture<CalendarWithMinMaxDate>;
    let testComponent: CalendarWithMinMaxDate;
    let calendarElement: HTMLElement;
    let periodButton: HTMLButtonElement;
    let prevButton: HTMLButtonElement;
    let nextButton: HTMLButtonElement;
    let calendarInstance: MatCalendar<Date>;

    beforeEach(() => {
      fixture = TestBed.createComponent(CalendarWithMinMaxDate);
      fixture.detectChanges();

      let calendarDebugElement = fixture.debugElement.query(By.directive(MatCalendar));
      calendarElement = calendarDebugElement.nativeElement;
      periodButton =
        calendarElement.querySelector('.mat-calendar-period-button') as HTMLButtonElement;
      prevButton =
        calendarElement.querySelector('.mat-calendar-previous-button') as HTMLButtonElement;
      nextButton =
        calendarElement.querySelector('.mat-calendar-next-button') as HTMLButtonElement;
      calendarInstance = calendarDebugElement.componentInstance;
      testComponent = fixture.componentInstance;
    });

    it('should start the first page with minDate', () => {
      testComponent.minDate = new Date(2010, JAN, 1);
      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance.currentView).toBe('multi-year');
      expect(periodButton.innerText.trim()).toEqual('2010 \u2013 2033');
    });


    it('should disable the page before the one showing minDate', () => {
      testComponent.minDate = new Date(2010, JAN, 1);
      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance.currentView).toBe('multi-year');
      expect(prevButton.disabled).toBe(true);
    });

    it('should enable the page after the one showing minDate', () => {
      testComponent.minDate = new Date(2010, JAN, 1);
      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance.currentView).toBe('multi-year');
      expect(nextButton.disabled).toBe(false);
    });
  });

  describe('calendar with maxDate only', () => {
    let fixture: ComponentFixture<CalendarWithMinMaxDate>;
    let testComponent: CalendarWithMinMaxDate;
    let calendarElement: HTMLElement;
    let periodButton: HTMLButtonElement;
    let prevButton: HTMLButtonElement;
    let nextButton: HTMLButtonElement;
    let calendarInstance: MatCalendar<Date>;

    beforeEach(() => {
      fixture = TestBed.createComponent(CalendarWithMinMaxDate);
      fixture.detectChanges();

      let calendarDebugElement = fixture.debugElement.query(By.directive(MatCalendar));
      calendarElement = calendarDebugElement.nativeElement;
      periodButton =
        calendarElement.querySelector('.mat-calendar-period-button') as HTMLButtonElement;
      prevButton =
        calendarElement.querySelector('.mat-calendar-previous-button') as HTMLButtonElement;
      nextButton =
        calendarElement.querySelector('.mat-calendar-next-button') as HTMLButtonElement;
      calendarInstance = calendarDebugElement.componentInstance;
      testComponent = fixture.componentInstance;
    });

    it('should end the last page with maxDate', () => {
      testComponent.maxDate = new Date(2020, JAN, 1);
      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance.currentView).toBe('multi-year');
      expect(periodButton.innerText.trim()).toEqual('1997 \u2013 2020');
    });

    it('should disable the page after the one showing maxDate', () => {
      testComponent.maxDate = new Date(2020, JAN, 1);
      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance.currentView).toBe('multi-year');
      expect(nextButton.disabled).toBe(true);
    });

    it('should enable the page before the one showing maxDate', () => {
      testComponent.maxDate = new Date(2020, JAN, 1);
      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance.currentView).toBe('multi-year');
      expect(prevButton.disabled).toBe(false);
    });
  });

  describe('calendar with minDate and maxDate', () => {
    let fixture: ComponentFixture<CalendarWithMinMaxDate>;
    let testComponent: CalendarWithMinMaxDate;
    let calendarElement: HTMLElement;
    let periodButton: HTMLButtonElement;
    let prevButton: HTMLButtonElement;
    let nextButton: HTMLButtonElement;
    let calendarInstance: MatCalendar<Date>;

    beforeEach(() => {
      fixture = TestBed.createComponent(CalendarWithMinMaxDate);
      fixture.detectChanges();

      let calendarDebugElement = fixture.debugElement.query(By.directive(MatCalendar));
      calendarElement = calendarDebugElement.nativeElement;
      periodButton =
        calendarElement.querySelector('.mat-calendar-period-button') as HTMLButtonElement;
      prevButton =
        calendarElement.querySelector('.mat-calendar-previous-button') as HTMLButtonElement;
      nextButton =
        calendarElement.querySelector('.mat-calendar-next-button') as HTMLButtonElement;
      calendarInstance = calendarDebugElement.componentInstance;
      testComponent = fixture.componentInstance;
    });

    it('should end the last page with maxDate', () => {
      testComponent.minDate = new Date(1993, JAN, 1);
      testComponent.maxDate = new Date(2020, JAN, 1);
      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance.currentView).toBe('multi-year');
      expect(periodButton.innerText.trim()).toEqual('1997 \u2013 2020');
    });

    it('should disable the page after the one showing maxDate', () => {
      testComponent.minDate = new Date(1993, JAN, 1);
      testComponent.maxDate = new Date(2020, JAN, 1);
      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance.currentView).toBe('multi-year');
      expect(nextButton.disabled).toBe(true);
    });

    it('should disable the page before the one showing minDate', () => {
      testComponent.minDate = new Date(1993, JAN, 1);
      testComponent.maxDate = new Date(2020, JAN, 1);
      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance.currentView).toBe('multi-year');

      prevButton.click();
      fixture.detectChanges();

      expect(calendarInstance.activeDate).toEqual(new Date(2018 - yearsPerPage, JAN, 1));
      expect(prevButton.disabled).toBe(true);
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
    <mat-calendar
      [startAt]="startAt"
      [minDate]="minDate"
      [maxDate]="maxDate">
    </mat-calendar>
  `
})
class CalendarWithMinMaxDate {
  startAt = new Date(2018, JAN, 1);
  minDate: Date | null;
  maxDate: Date | null;
}
