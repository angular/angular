import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MatMonthView} from './month-view';
import {MatCalendarBody} from './calendar-body';
import {MatNativeDateModule} from '@angular/material/core';
import {JAN, MAR} from '@angular/material/core';

describe('MatMonthView', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatNativeDateModule,
      ],
      declarations: [
        MatCalendarBody,
        MatMonthView,

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

      let monthViewDebugElement = fixture.debugElement.query(By.directive(MatMonthView));
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
  });

  describe('month view with date filter', () => {
    let fixture: ComponentFixture<MonthViewWithDateFilter>;
    let testComponent: MonthViewWithDateFilter;
    let monthViewNativeElement: Element;

    beforeEach(() => {
      fixture = TestBed.createComponent(MonthViewWithDateFilter);
      fixture.detectChanges();

      let monthViewDebugElement = fixture.debugElement.query(By.directive(MatMonthView));
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
  template: `<mat-month-view [activeDate]="date" [(selected)]="selected"></mat-month-view>`,
})
class StandardMonthView {
  date = new Date(2017, JAN, 5);
  selected = new Date(2017, JAN, 10);
}


@Component({
  template: `<mat-month-view [activeDate]="activeDate" [dateFilter]="dateFilter"></mat-month-view>`
})
class MonthViewWithDateFilter {
  activeDate = new Date(2017, JAN, 1);
  dateFilter(date: Date) {
    return date.getDate() % 2 == 0;
  }
}
