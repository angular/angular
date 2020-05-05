import {Direction, Directionality} from '@angular/cdk/bidi';
import {
  DOWN_ARROW,
  END,
  HOME,
  LEFT_ARROW,
  PAGE_DOWN,
  PAGE_UP,
  RIGHT_ARROW,
  UP_ARROW,
} from '@angular/cdk/keycodes';
import {dispatchFakeEvent, dispatchKeyboardEvent} from '@angular/cdk/testing/private';
import {Component, ViewChild} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {MatNativeDateModule} from '@angular/material/core';
import {AUG, DEC, FEB, JAN, JUL, JUN, MAR, MAY, NOV, OCT, SEP} from '@angular/material/testing';
import {By} from '@angular/platform-browser';
import {MatCalendarBody} from './calendar-body';
import {MatYearView} from './year-view';

describe('MatYearView', () => {
  let dir: {value: Direction};

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatNativeDateModule,
      ],
      declarations: [
        MatCalendarBody,
        MatYearView,

        // Test components.
        StandardYearView,
        YearViewWithDateFilter,
      ],
      providers: [
        {provide: Directionality, useFactory: () => dir = {value: 'ltr'}}
      ]
    });

    TestBed.compileComponents();
  }));

  describe('standard year view', () => {
    let fixture: ComponentFixture<StandardYearView>;
    let testComponent: StandardYearView;
    let yearViewNativeElement: Element;

    beforeEach(() => {
      fixture = TestBed.createComponent(StandardYearView);
      fixture.detectChanges();

      let yearViewDebugElement = fixture.debugElement.query(By.directive(MatYearView))!;
      yearViewNativeElement = yearViewDebugElement.nativeElement;
      testComponent = fixture.componentInstance;
    });

    it('has correct year label', () => {
      let labelEl = yearViewNativeElement.querySelector('.mat-calendar-body-label')!;
      expect(labelEl.innerHTML.trim()).toBe('2017');
    });

    it('has 12 months', () => {
      let cellEls = yearViewNativeElement.querySelectorAll('.mat-calendar-body-cell')!;
      expect(cellEls.length).toBe(12);
    });

    it('shows selected month if in same year', () => {
      let selectedEl = yearViewNativeElement.querySelector('.mat-calendar-body-selected')!;
      expect(selectedEl.innerHTML.trim()).toBe('MAR');
    });

    it('does not show selected month if in different year', () => {
      testComponent.selected = new Date(2016, MAR, 10);
      fixture.detectChanges();

      let selectedEl = yearViewNativeElement.querySelector('.mat-calendar-body-selected');
      expect(selectedEl).toBeNull();
    });

    it('fires selected change event on cell clicked', () => {
      let cellEls = yearViewNativeElement.querySelectorAll('.mat-calendar-body-cell');
      (cellEls[cellEls.length - 1] as HTMLElement).click();
      fixture.detectChanges();

      let selectedEl = yearViewNativeElement.querySelector('.mat-calendar-body-selected')!;
      expect(selectedEl.innerHTML.trim()).toBe('DEC');
    });

    it('should emit the selected month on cell clicked', () => {
      let cellEls = yearViewNativeElement.querySelectorAll('.mat-calendar-body-cell');

      (cellEls[cellEls.length - 1] as HTMLElement).click();
      fixture.detectChanges();

      const normalizedMonth: Date = fixture.componentInstance.selectedMonth;
      expect(normalizedMonth.getMonth()).toEqual(11);
    });

    it('should mark active date', () => {
      let cellEls = yearViewNativeElement.querySelectorAll('.mat-calendar-body-cell');
      expect((cellEls[0] as HTMLElement).innerText.trim()).toBe('JAN');
      expect(cellEls[0].classList).toContain('mat-calendar-body-active');
    });

    it('should allow selection of month with less days than current active date', () => {
      testComponent.date = new Date(2017, JUL, 31);
      fixture.detectChanges();

      testComponent.yearView._monthSelected({value: JUN, event: null!});
      fixture.detectChanges();

      expect(testComponent.selected).toEqual(new Date(2017, JUN, 30));
    });

    describe('a11y', () => {
      it('should set the correct role on the internal table node', () => {
        const table = yearViewNativeElement.querySelector('table')!;
        expect(table.getAttribute('role')).toBe('presentation');
      });

      describe('calendar body', () => {
        let calendarBodyEl: HTMLElement;
        let calendarInstance: StandardYearView;

        beforeEach(() => {
          calendarInstance = fixture.componentInstance;
          calendarBodyEl =
            fixture.debugElement.nativeElement.querySelector('.mat-calendar-body') as HTMLElement;
          expect(calendarBodyEl).not.toBeNull();
          dir.value = 'ltr';
          fixture.componentInstance.date = new Date(2017, JAN, 5);
          dispatchFakeEvent(calendarBodyEl, 'focus');
          fixture.detectChanges();
        });

        it('should decrement month on left arrow press', () => {
          dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2016, DEC, 5));

          dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2016, NOV, 5));
        });

        it('should increment month on left arrow press in rtl', () => {
          dir.value = 'rtl';

          dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2017, FEB, 5));

          dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2017, MAR, 5));
        });

        it('should increment month on right arrow press', () => {
          dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2017, FEB, 5));

          dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2017, MAR, 5));
        });

        it('should decrement month on right arrow press in rtl', () => {
          dir.value = 'rtl';

          dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2016, DEC, 5));

          dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2016, NOV, 5));
        });

        it('should go up a row on up arrow press', () => {
          dispatchKeyboardEvent(calendarBodyEl, 'keydown', UP_ARROW);
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2016, SEP, 5));

          calendarInstance.date = new Date(2017, JUL, 1);
          fixture.detectChanges();

          dispatchKeyboardEvent(calendarBodyEl, 'keydown', UP_ARROW);
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2017, MAR, 1));

          calendarInstance.date = new Date(2017, DEC, 10);
          fixture.detectChanges();

          dispatchKeyboardEvent(calendarBodyEl, 'keydown', UP_ARROW);
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2017, AUG, 10));
        });

        it('should go down a row on down arrow press', () => {
          dispatchKeyboardEvent(calendarBodyEl, 'keydown', DOWN_ARROW);
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2017, MAY, 5));

          calendarInstance.date = new Date(2017, JUN, 1);
          fixture.detectChanges();

          dispatchKeyboardEvent(calendarBodyEl, 'keydown', DOWN_ARROW);
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2017, OCT, 1));

          calendarInstance.date = new Date(2017, SEP, 30);
          fixture.detectChanges();

          dispatchKeyboardEvent(calendarBodyEl, 'keydown', DOWN_ARROW);
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2018, JAN, 30));
        });

        it('should go to first month of the year on home press', () => {
          calendarInstance.date = new Date(2017, SEP, 30);
          fixture.detectChanges();

          dispatchKeyboardEvent(calendarBodyEl, 'keydown', HOME);
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2017, JAN, 30));

          dispatchKeyboardEvent(calendarBodyEl, 'keydown', HOME);
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2017, JAN, 30));
        });

        it('should go to last month of the year on end press', () => {
          calendarInstance.date = new Date(2017, OCT, 31);
          fixture.detectChanges();

          dispatchKeyboardEvent(calendarBodyEl, 'keydown', END);
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2017, DEC, 31));

          dispatchKeyboardEvent(calendarBodyEl, 'keydown', END);
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2017, DEC, 31));
        });

        it('should go back one year on page up press', () => {
          calendarInstance.date = new Date(2016, FEB, 29);
          fixture.detectChanges();

          dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_UP);
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2015, FEB, 28));

          dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_UP);
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2014, FEB, 28));
        });

        it('should go forward one year on page down press', () => {
          calendarInstance.date = new Date(2016, FEB, 29);
          fixture.detectChanges();

          dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_DOWN);
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2017, FEB, 28));

          dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_DOWN);
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2018, FEB, 28));
        });
      });
    });
  });

  describe('year view with date filter', () => {
    it('should disable months with no enabled days', () => {
      const fixture = TestBed.createComponent(YearViewWithDateFilter);
      fixture.detectChanges();

      const cells = fixture.nativeElement.querySelectorAll('.mat-calendar-body-cell');
      expect(cells[0].classList).not.toContain('mat-calendar-body-disabled');
      expect(cells[1].classList).toContain('mat-calendar-body-disabled');
    });

    it('should not call the date filter function if the date is before the min date', () => {
      const fixture = TestBed.createComponent(YearViewWithDateFilter);
      const activeDate = fixture.componentInstance.activeDate;
      const spy = spyOn(fixture.componentInstance, 'dateFilter').and.callThrough();
      fixture.componentInstance.minDate =
          new Date(activeDate.getFullYear() + 1, activeDate.getMonth(), activeDate.getDate());
      fixture.detectChanges();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should not call the date filter function if the date is after the max date', () => {
      const fixture = TestBed.createComponent(YearViewWithDateFilter);
      const activeDate = fixture.componentInstance.activeDate;
      const spy = spyOn(fixture.componentInstance, 'dateFilter').and.callThrough();
      fixture.componentInstance.maxDate =
          new Date(activeDate.getFullYear() - 1, activeDate.getMonth(), activeDate.getDate());
      fixture.detectChanges();

      expect(spy).not.toHaveBeenCalled();
    });

  });
});


@Component({
  template: `
    <mat-year-view [(activeDate)]="date" [(selected)]="selected"
                   (monthSelected)="selectedMonth=$event"></mat-year-view>`
})
class StandardYearView {
  date = new Date(2017, JAN, 5);
  selected = new Date(2017, MAR, 10);
  selectedMonth: Date;

  @ViewChild(MatYearView) yearView: MatYearView<Date>;
}


@Component({
  template: `
    <mat-year-view
      [activeDate]="activeDate"
      [dateFilter]="dateFilter"
      [minDate]="minDate"
      [maxDate]="maxDate"></mat-year-view>`
})
class YearViewWithDateFilter {
  activeDate = new Date(2017, JAN, 1);
  minDate: Date | null = null;
  maxDate: Date | null = null;
  dateFilter(date: Date) {
    if (date.getMonth() == JAN) {
      return date.getDate() == 10;
    }
    if (date.getMonth() == FEB) {
      return false;
    }
    return true;
  }
}
