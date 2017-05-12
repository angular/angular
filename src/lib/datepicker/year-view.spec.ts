import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MdYearView} from './year-view';
import {MdCalendarBody} from './calendar-body';
import {MdNativeDateModule} from '../core/datetime/index';


// When constructing a Date, the month is zero-based. This can be confusing, since people are
// used to seeing them one-based. So we create these aliases to make reading the tests easier.
const JAN = 0, FEB = 1, MAR = 2, APR = 3, MAY = 4, JUN = 5, JUL = 6, AUG = 7, SEP = 8, OCT = 9,
      NOV = 10, DEC = 11;


describe('MdYearView', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MdNativeDateModule,
      ],
      declarations: [
        MdCalendarBody,
        MdYearView,

        // Test components.
        StandardYearView,
        YearViewWithDateFilter,
      ],
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

      let yearViewDebugElement = fixture.debugElement.query(By.directive(MdYearView));
      yearViewNativeElement = yearViewDebugElement.nativeElement;
      testComponent = fixture.componentInstance;
    });

    it('has correct year label', () => {
      let labelEl = yearViewNativeElement.querySelector('.mat-calendar-body-label');
      expect(labelEl.innerHTML.trim()).toBe('2017');
    });

    it('has 12 months', () => {
      let cellEls = yearViewNativeElement.querySelectorAll('.mat-calendar-body-cell');
      expect(cellEls.length).toBe(12);
    });

    it('shows selected month if in same year', () => {
      let selectedEl = yearViewNativeElement.querySelector('.mat-calendar-body-selected');
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

      let selectedEl = yearViewNativeElement.querySelector('.mat-calendar-body-selected');
      expect(selectedEl.innerHTML.trim()).toBe('DEC');
    });

    it('should mark active date', () => {
      let cellEls = yearViewNativeElement.querySelectorAll('.mat-calendar-body-cell');
      expect((cellEls[0] as HTMLElement).innerText.trim()).toBe('JAN');
      expect(cellEls[0].classList).toContain('mat-calendar-body-active');
    });
  });

  describe('year view with date filter', () => {
    let fixture: ComponentFixture<YearViewWithDateFilter>;
    let testComponent: YearViewWithDateFilter;
    let yearViewNativeElement: Element;

    beforeEach(() => {
      fixture = TestBed.createComponent(YearViewWithDateFilter);
      fixture.detectChanges();

      let yearViewDebugElement = fixture.debugElement.query(By.directive(MdYearView));
      yearViewNativeElement = yearViewDebugElement.nativeElement;
      testComponent = fixture.componentInstance;
    });

    it('should disabled months with no enabled days', () => {
      let cells = yearViewNativeElement.querySelectorAll('.mat-calendar-body-cell');
      expect(cells[0].classList).not.toContain('mat-calendar-body-disabled');
      expect(cells[1].classList).toContain('mat-calendar-body-disabled');
    });
  });
});


@Component({
  template: `
    <md-year-view [activeDate]="date" [(selected)]="selected"></md-year-view>`,
})
class StandardYearView {
  date = new Date(2017, JAN, 5);
  selected = new Date(2017, MAR, 10);
}


@Component({
  template: `<md-year-view [activeDate]="activeDate" [dateFilter]="dateFilter"></md-year-view>`
})
class YearViewWithDateFilter {
  activeDate = new Date(2017, JAN, 1);
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
