import {Component, ViewChild} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {JAN, MatNativeDateModule} from '@angular/material/core';
import {By} from '@angular/platform-browser';
import {MatCalendarBody} from './calendar-body';
import {MatMultiYearView, yearsPerPage} from './multi-year-view';
import {MatYearView} from './year-view';

describe('MatMultiYearView', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatNativeDateModule,
      ],
      declarations: [
        MatCalendarBody,
        MatMultiYearView,

        // Test components.
        StandardMultiYearView,
      ],
    });

    TestBed.compileComponents();
  });

  describe('standard multi-year view', () => {
    let fixture: ComponentFixture<StandardMultiYearView>;
    let testComponent: StandardMultiYearView;
    let multiYearViewNativeElement: Element;

    beforeEach(() => {
      fixture = TestBed.createComponent(StandardMultiYearView);
      fixture.detectChanges();

      let multiYearViewDebugElement = fixture.debugElement.query(By.directive(MatMultiYearView));
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

    it('should mark active date', () => {
      let cellEls = multiYearViewNativeElement.querySelectorAll('.mat-calendar-body-cell');
      expect((cellEls[1] as HTMLElement).innerText.trim()).toBe('2017');
      expect(cellEls[1].classList).toContain('mat-calendar-body-active');
    });
  });
});


@Component({
  template: `
    <mat-multi-year-view [activeDate]="date" [(selected)]="selected"></mat-multi-year-view>`,
})
class StandardMultiYearView {
  date = new Date(2017, JAN, 1);
  selected = new Date(2020, JAN, 1);

  @ViewChild(MatYearView) yearView: MatYearView<Date>;
}
