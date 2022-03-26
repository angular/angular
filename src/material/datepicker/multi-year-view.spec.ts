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
import {dispatchFakeEvent, dispatchKeyboardEvent} from '../../cdk/testing/private';
import {Component, ViewChild} from '@angular/core';
import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';
import {MatNativeDateModule} from '@angular/material/core';
import {JAN, MAR} from '../testing';
import {By} from '@angular/platform-browser';
import {MatCalendarBody} from './calendar-body';
import {MatMultiYearView, yearsPerPage, yearsPerRow} from './multi-year-view';

describe('MatMultiYearView', () => {
  let dir: {value: Direction};

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatNativeDateModule],
      declarations: [
        MatCalendarBody,
        MatMultiYearView,

        // Test components.
        StandardMultiYearView,
        MultiYearViewWithDateFilter,
        MultiYearViewWithMinMaxDate,
        MultiYearViewWithDateClass,
      ],
      providers: [{provide: Directionality, useFactory: () => (dir = {value: 'ltr'})}],
    });

    TestBed.compileComponents();
  }));

  describe('standard multi-year view', () => {
    let fixture: ComponentFixture<StandardMultiYearView>;
    let testComponent: StandardMultiYearView;
    let multiYearViewNativeElement: Element;

    beforeEach(() => {
      fixture = TestBed.createComponent(StandardMultiYearView);
      fixture.detectChanges();

      let multiYearViewDebugElement = fixture.debugElement.query(By.directive(MatMultiYearView))!;
      multiYearViewNativeElement = multiYearViewDebugElement.nativeElement;
      testComponent = fixture.componentInstance;
    });

    it('has correct number of years', () => {
      let cellEls = multiYearViewNativeElement.querySelectorAll('.mat-calendar-body-cell')!;
      expect(cellEls.length).toBe(yearsPerPage);
    });

    it('shows selected year if in same range', () => {
      let selectedEl = multiYearViewNativeElement.querySelector('.mat-calendar-body-selected')!;
      expect(selectedEl.innerHTML.trim()).toBe('2020');
    });

    it('does not show selected year if in different range', () => {
      testComponent.selected = new Date(2040, JAN, 10);
      fixture.detectChanges();

      let selectedEl = multiYearViewNativeElement.querySelector('.mat-calendar-body-selected');
      expect(selectedEl).toBeNull();
    });

    it('fires selected change event on cell clicked', () => {
      let cellEls = multiYearViewNativeElement.querySelectorAll('.mat-calendar-body-cell');
      (cellEls[cellEls.length - 1] as HTMLElement).click();
      fixture.detectChanges();

      let selectedEl = multiYearViewNativeElement.querySelector('.mat-calendar-body-selected')!;
      expect(selectedEl.innerHTML.trim()).toBe('2039');
    });

    it('should emit the selected year on cell clicked', () => {
      let cellEls = multiYearViewNativeElement.querySelectorAll('.mat-calendar-body-cell');

      (cellEls[1] as HTMLElement).click();
      fixture.detectChanges();

      const normalizedYear: Date = fixture.componentInstance.selectedYear;
      expect(normalizedYear.getFullYear()).toEqual(2017);
    });

    it('should mark active date', () => {
      let cellEls = multiYearViewNativeElement.querySelectorAll('.mat-calendar-body-cell');
      expect((cellEls[1] as HTMLElement).innerText.trim()).toBe('2017');
      expect(cellEls[1].classList).toContain('mat-calendar-body-active');
    });

    describe('a11y', () => {
      it('should set the correct role on the internal table node', () => {
        const table = multiYearViewNativeElement.querySelector('table')!;
        expect(table.getAttribute('role')).toBe('grid');
      });

      describe('calendar body', () => {
        let calendarBodyEl: HTMLElement;
        let calendarInstance: StandardMultiYearView;

        beforeEach(() => {
          calendarInstance = fixture.componentInstance;
          calendarBodyEl = fixture.debugElement.nativeElement.querySelector(
            '.mat-calendar-body',
          ) as HTMLElement;
          expect(calendarBodyEl).not.toBeNull();
          dir.value = 'ltr';
          fixture.componentInstance.date = new Date(2017, JAN, 3);
          dispatchFakeEvent(calendarBodyEl, 'focus');
          fixture.detectChanges();
        });

        it('should decrement year on left arrow press', () => {
          dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2016, JAN, 3));

          dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2015, JAN, 3));
        });

        it('should increment year on right arrow press', () => {
          dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2018, JAN, 3));

          dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2019, JAN, 3));
        });

        it('should go up a row on up arrow press', () => {
          dispatchKeyboardEvent(calendarBodyEl, 'keydown', UP_ARROW);
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2017 - yearsPerRow, JAN, 3));

          dispatchKeyboardEvent(calendarBodyEl, 'keydown', UP_ARROW);
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2017 - yearsPerRow * 2, JAN, 3));
        });

        it('should go down a row on down arrow press', () => {
          dispatchKeyboardEvent(calendarBodyEl, 'keydown', DOWN_ARROW);
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2017 + yearsPerRow, JAN, 3));

          dispatchKeyboardEvent(calendarBodyEl, 'keydown', DOWN_ARROW);
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2017 + yearsPerRow * 2, JAN, 3));
        });

        it('should go to first year in current range on home press', () => {
          dispatchKeyboardEvent(calendarBodyEl, 'keydown', HOME);
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2016, JAN, 3));

          dispatchKeyboardEvent(calendarBodyEl, 'keydown', HOME);
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2016, JAN, 3));
        });

        it('should go to last year in current range on end press', () => {
          dispatchKeyboardEvent(calendarBodyEl, 'keydown', END);
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2039, JAN, 3));

          dispatchKeyboardEvent(calendarBodyEl, 'keydown', END);
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2039, JAN, 3));
        });

        it('should go to same index in previous year range page up press', () => {
          dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_UP);
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2017 - yearsPerPage, JAN, 3));

          dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_UP);
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2017 - yearsPerPage * 2, JAN, 3));
        });

        it('should go to same index in next year range on page down press', () => {
          dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_DOWN);
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2017 + yearsPerPage, JAN, 3));

          dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_DOWN);
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2017 + yearsPerPage * 2, JAN, 3));
        });

        it('should go to the year that is focused', () => {
          fixture.componentInstance.date = new Date(2017, MAR, 5);
          fixture.detectChanges();
          expect(calendarInstance.date).toEqual(new Date(2017, MAR, 5));

          const year2022Cell = fixture.debugElement.nativeElement.querySelector(
            '[data-mat-row="1"][data-mat-col="2"] button',
          ) as HTMLElement;

          dispatchFakeEvent(year2022Cell, 'focus');
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2022, MAR, 5));
        });

        it('should not call `.focus()` when the active date is focused', () => {
          const year2017Cell = fixture.debugElement.nativeElement.querySelector(
            '[data-mat-row="0"][data-mat-col="1"] button',
          ) as HTMLElement;
          const focusSpy = (year2017Cell.focus = jasmine.createSpy('cellFocused'));

          dispatchFakeEvent(year2017Cell, 'focus');
          fixture.detectChanges();

          expect(calendarInstance.date).toEqual(new Date(2017, JAN, 3));
          expect(focusSpy).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('multi year view with date filter', () => {
    it('should disable years with no enabled days', () => {
      const fixture = TestBed.createComponent(MultiYearViewWithDateFilter);
      fixture.detectChanges();

      const cells = fixture.nativeElement.querySelectorAll('.mat-calendar-body-cell');
      expect(cells[0].classList).not.toContain('mat-calendar-body-disabled');
      expect(cells[1].classList).toContain('mat-calendar-body-disabled');
    });

    it('should not call the date filter function if the date is before the min date', () => {
      const fixture = TestBed.createComponent(MultiYearViewWithDateFilter);
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
      const fixture = TestBed.createComponent(MultiYearViewWithDateFilter);
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

  describe('multi year view with minDate only', () => {
    let fixture: ComponentFixture<MultiYearViewWithMinMaxDate>;
    let testComponent: MultiYearViewWithMinMaxDate;
    let multiYearViewNativeElement: Element;

    beforeEach(() => {
      fixture = TestBed.createComponent(MultiYearViewWithMinMaxDate);

      const multiYearViewDebugElement = fixture.debugElement.query(By.directive(MatMultiYearView))!;
      multiYearViewNativeElement = multiYearViewDebugElement.nativeElement;
      testComponent = fixture.componentInstance;
    });

    it('should begin first page with minDate', () => {
      testComponent.minDate = new Date(2014, JAN, 1);
      testComponent.maxDate = null;
      fixture.detectChanges();

      const cells = multiYearViewNativeElement.querySelectorAll('.mat-calendar-body-cell');
      expect((cells[0] as HTMLElement).innerText.trim()).toBe('2014');
    });
  });

  describe('multi year view with maxDate only', () => {
    let fixture: ComponentFixture<MultiYearViewWithMinMaxDate>;
    let testComponent: MultiYearViewWithMinMaxDate;
    let multiYearViewNativeElement: Element;

    beforeEach(() => {
      fixture = TestBed.createComponent(MultiYearViewWithMinMaxDate);

      const multiYearViewDebugElement = fixture.debugElement.query(By.directive(MatMultiYearView))!;
      multiYearViewNativeElement = multiYearViewDebugElement.nativeElement;
      testComponent = fixture.componentInstance;
    });

    it('should end last page with maxDate', () => {
      testComponent.minDate = null;
      testComponent.maxDate = new Date(2020, JAN, 1);
      fixture.detectChanges();

      const cells = multiYearViewNativeElement.querySelectorAll('.mat-calendar-body-cell');
      expect((cells[cells.length - 1] as HTMLElement).innerText.trim()).toBe('2020');
    });
  });

  describe('multi year view with minDate and maxDate', () => {
    let fixture: ComponentFixture<MultiYearViewWithMinMaxDate>;
    let testComponent: MultiYearViewWithMinMaxDate;
    let multiYearViewNativeElement: Element;

    beforeEach(() => {
      fixture = TestBed.createComponent(MultiYearViewWithMinMaxDate);

      const multiYearViewDebugElement = fixture.debugElement.query(By.directive(MatMultiYearView))!;
      multiYearViewNativeElement = multiYearViewDebugElement.nativeElement;
      testComponent = fixture.componentInstance;
    });

    it('should end last page with maxDate', () => {
      testComponent.minDate = new Date(2006, JAN, 1);
      testComponent.maxDate = new Date(2020, JAN, 1);
      fixture.detectChanges();

      const cells = multiYearViewNativeElement.querySelectorAll('.mat-calendar-body-cell');
      expect((cells[cells.length - 1] as HTMLElement).innerText.trim()).toBe('2020');
    });

    it('should disable dates before minDate', () => {
      testComponent.minDate = new Date(2006, JAN, 1);
      testComponent.maxDate = new Date(2020, JAN, 1);
      fixture.detectChanges();

      const cells = multiYearViewNativeElement.querySelectorAll('.mat-calendar-body-cell');
      expect(cells[0].classList).toContain('mat-calendar-body-disabled');
      expect(cells[8].classList).toContain('mat-calendar-body-disabled');
      expect(cells[9].classList).not.toContain('mat-calendar-body-disabled');
    });
  });

  describe('multi-year view with custom date classes', () => {
    let fixture: ComponentFixture<MultiYearViewWithDateClass>;
    let multiYearViewNativeElement: Element;
    let dateClassSpy: jasmine.Spy;

    beforeEach(() => {
      fixture = TestBed.createComponent(MultiYearViewWithDateClass);
      dateClassSpy = spyOn(fixture.componentInstance, 'dateClass').and.callThrough();
      fixture.detectChanges();

      let multiYearViewDebugElement = fixture.debugElement.query(By.directive(MatMultiYearView))!;
      multiYearViewNativeElement = multiYearViewDebugElement.nativeElement;
    });

    it('should be able to add a custom class to some dates', () => {
      let cells = multiYearViewNativeElement.querySelectorAll('.mat-calendar-body-cell');
      expect(cells[0].classList).toContain('even');
      expect(cells[1].classList).not.toContain('even');
    });

    it('should call dateClass with the correct view name', () => {
      expect(dateClassSpy).toHaveBeenCalledWith(jasmine.any(Date), 'multi-year');
    });
  });
});

@Component({
  template: `
    <mat-multi-year-view [(activeDate)]="date" [(selected)]="selected"
                         (yearSelected)="selectedYear=$event"></mat-multi-year-view>`,
})
class StandardMultiYearView {
  date = new Date(2017, JAN, 1);
  selected = new Date(2020, JAN, 1);
  selectedYear: Date;

  @ViewChild(MatMultiYearView) multiYearView: MatMultiYearView<Date>;
}

@Component({
  template: `
    <mat-multi-year-view
      [(activeDate)]="activeDate"
      [dateFilter]="dateFilter"
      [minDate]="minDate"
      [maxDate]="maxDate"></mat-multi-year-view>
    `,
})
class MultiYearViewWithDateFilter {
  activeDate = new Date(2017, JAN, 1);
  minDate: Date | null = null;
  maxDate: Date | null = null;
  dateFilter(date: Date) {
    return date.getFullYear() !== 2017;
  }
}

@Component({
  template: `
    <mat-multi-year-view [(activeDate)]="activeDate" [minDate]="minDate" [maxDate]="maxDate">
    </mat-multi-year-view>
    `,
})
class MultiYearViewWithMinMaxDate {
  activeDate = new Date(2019, JAN, 1);
  minDate: Date | null;
  maxDate: Date | null;
}

@Component({
  template: `
    <mat-multi-year-view [activeDate]="activeDate" [dateClass]="dateClass"></mat-multi-year-view>
  `,
})
class MultiYearViewWithDateClass {
  activeDate = new Date(2017, JAN, 1);
  dateClass(date: Date) {
    return date.getFullYear() % 2 == 0 ? 'even' : undefined;
  }
}
