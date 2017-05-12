import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MdMonthView} from './month-view';
import {MdCalendarBody} from './calendar-body';
import {MdNativeDateModule} from '../core/datetime/index';


// When constructing a Date, the month is zero-based. This can be confusing, since people are
// used to seeing them one-based. So we create these aliases to make reading the tests easier.
const JAN = 0, FEB = 1, MAR = 2, APR = 3, MAY = 4, JUN = 5, JUL = 6, AUG = 7, SEP = 8, OCT = 9,
      NOV = 10, DEC = 11;


describe('MdMonthView', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MdNativeDateModule,
      ],
      declarations: [
        MdCalendarBody,
        MdMonthView,

        // Test components.
        StandardMonthView,
        MonthViewWithDateFilter,
      ],
    });

    TestBed.compileComponents();
  }));

  describe('standard month view', () => {
    let fixture: ComponentFixture<StandardMonthView>;
    let testComponent: StandardMonthView;
    let monthViewNativeElement: Element;

    beforeEach(() => {
      fixture = TestBed.createComponent(StandardMonthView);
      fixture.detectChanges();

      let monthViewDebugElement = fixture.debugElement.query(By.directive(MdMonthView));
      monthViewNativeElement = monthViewDebugElement.nativeElement;
      testComponent = fixture.componentInstance;
    });

    it('has correct month label', () => {
      let labelEl = monthViewNativeElement.querySelector('.mat-calendar-body-label');
      expect(labelEl.innerHTML.trim()).toBe('JAN');
    });

    it('has 31 days', () => {
      let cellEls = monthViewNativeElement.querySelectorAll('.mat-calendar-body-cell');
      expect(cellEls.length).toBe(31);
    });

    it('shows selected date if in same month', () => {
      let selectedEl = monthViewNativeElement.querySelector('.mat-calendar-body-selected');
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

      let selectedEl = monthViewNativeElement.querySelector('.mat-calendar-body-selected');
      expect(selectedEl.innerHTML.trim()).toBe('31');
    });

    it('should mark active date', () => {
      let cellEls = monthViewNativeElement.querySelectorAll('.mat-calendar-body-cell');
      expect((cellEls[4] as HTMLElement).innerText.trim()).toBe('5');
      expect(cellEls[4].classList).toContain('mat-calendar-body-active');
    });
  });

  describe('month view with date filter', () => {
    let fixture: ComponentFixture<MonthViewWithDateFilter>;
    let testComponent: MonthViewWithDateFilter;
    let monthViewNativeElement: Element;

    beforeEach(() => {
      fixture = TestBed.createComponent(MonthViewWithDateFilter);
      fixture.detectChanges();

      let monthViewDebugElement = fixture.debugElement.query(By.directive(MdMonthView));
      monthViewNativeElement = monthViewDebugElement.nativeElement;
      testComponent = fixture.componentInstance;
    });

    it('should disable filtered dates', () => {
      let cells = monthViewNativeElement.querySelectorAll('.mat-calendar-body-cell');
      expect(cells[0].classList).toContain('mat-calendar-body-disabled');
      expect(cells[1].classList).not.toContain('mat-calendar-body-disabled');
    });
  });
});


@Component({
  template: `<md-month-view [activeDate]="date" [(selected)]="selected"></md-month-view>`,
})
class StandardMonthView {
  date = new Date(2017, JAN, 5);
  selected = new Date(2017, JAN, 10);
}


@Component({
  template: `<md-month-view [activeDate]="activeDate" [dateFilter]="dateFilter"></md-month-view>`
})
class MonthViewWithDateFilter {
  activeDate = new Date(2017, JAN, 1);
  dateFilter(date: Date) {
    return date.getDate() % 2 == 0;
  }
}
