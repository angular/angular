import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, ViewChild} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MatYearView} from './year-view';
import {MatCalendarBody} from './calendar-body';
import {MatNativeDateModule} from '@angular/material/core';
import {FEB, JAN, JUL, JUN, MAR} from '@angular/material/core';

describe('MatYearView', () => {
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

      let yearViewDebugElement = fixture.debugElement.query(By.directive(MatYearView));
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

    it('should mark active date', () => {
      let cellEls = yearViewNativeElement.querySelectorAll('.mat-calendar-body-cell');
      expect((cellEls[0] as HTMLElement).innerText.trim()).toBe('JAN');
      expect(cellEls[0].classList).toContain('mat-calendar-body-active');
    });

    it('should allow selection of month with less days than current active date', () => {
      testComponent.date = new Date(2017, JUL, 31);
      fixture.detectChanges();

      expect(testComponent.yearView._monthSelected(JUN));
      fixture.detectChanges();

      expect(testComponent.selected).toEqual(new Date(2017, JUN, 30));
    });
  });

  describe('year view with date filter', () => {
    let fixture: ComponentFixture<YearViewWithDateFilter>;
    let testComponent: YearViewWithDateFilter;
    let yearViewNativeElement: Element;

    beforeEach(() => {
      fixture = TestBed.createComponent(YearViewWithDateFilter);
      fixture.detectChanges();

      let yearViewDebugElement = fixture.debugElement.query(By.directive(MatYearView));
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
    <mat-year-view [activeDate]="date" [(selected)]="selected"></mat-year-view>`,
})
class StandardYearView {
  date = new Date(2017, JAN, 5);
  selected = new Date(2017, MAR, 10);

  @ViewChild(MatYearView) yearView: MatYearView<Date>;
}


@Component({
  template: `<mat-year-view [activeDate]="activeDate" [dateFilter]="dateFilter"></mat-year-view>`
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
