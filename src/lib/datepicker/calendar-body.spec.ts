import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component} from '@angular/core';
import {MatCalendarBody, MatCalendarCell, MatCalendarCellCssClasses} from './calendar-body';
import {By} from '@angular/platform-browser';


describe('MatCalendarBody', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        MatCalendarBody,

        // Test components.
        StandardCalendarBody,
      ],
    });

    TestBed.compileComponents();
  }));

  describe('standard calendar body', () => {
    let fixture: ComponentFixture<StandardCalendarBody>;
    let testComponent: StandardCalendarBody;
    let calendarBodyNativeElement: Element;
    let rowEls: Element[];
    let labelEls: Element[];
    let cellEls: Element[];

    function refreshElementLists() {
      rowEls = Array.from(calendarBodyNativeElement.querySelectorAll('tr'));
      labelEls = Array.from(calendarBodyNativeElement.querySelectorAll('.mat-calendar-body-label'));
      cellEls = Array.from(calendarBodyNativeElement.querySelectorAll('.mat-calendar-body-cell'));
    }

    beforeEach(() => {
      fixture = TestBed.createComponent(StandardCalendarBody);
      fixture.detectChanges();

      const calendarBodyDebugElement = fixture.debugElement.query(By.directive(MatCalendarBody));
      calendarBodyNativeElement = calendarBodyDebugElement.nativeElement;
      testComponent = fixture.componentInstance;

      refreshElementLists();
    });

    it('creates body', () => {
      expect(rowEls.length).toBe(3);
      expect(labelEls.length).toBe(1);
      expect(cellEls.length).toBe(14);
    });

    it('highlights today', () => {
      const todayCell = calendarBodyNativeElement.querySelector('.mat-calendar-body-today')!;
      expect(todayCell).not.toBeNull();
      expect(todayCell.innerHTML.trim()).toBe('3');
    });

    it('highlights selected', () => {
      const selectedCell = calendarBodyNativeElement.querySelector('.mat-calendar-body-selected')!;
      expect(selectedCell).not.toBeNull();
      expect(selectedCell.innerHTML.trim()).toBe('4');
    });

    it('should set aria-selected correctly', () => {
      const selectedCells = cellEls.filter(c => c.getAttribute('aria-selected') === 'true');
      const deselectedCells = cellEls.filter(c => c.getAttribute('aria-selected') === 'false');

      expect(selectedCells.length).toBe(1, 'Expected one cell to be marked as selected.');
      expect(deselectedCells.length)
          .toBe(cellEls.length - 1, 'Expected remaining cells to be marked as deselected.');
    });

    it('places label in first row if space is available', () => {
      testComponent.rows[0] = testComponent.rows[0].slice(3);
      testComponent.rows = testComponent.rows.slice();
      fixture.detectChanges();
      refreshElementLists();

      expect(rowEls.length).toBe(2);
      expect(labelEls.length).toBe(1);
      expect(cellEls.length).toBe(11);
      expect(rowEls[0].firstElementChild!.classList)
          .toContain('mat-calendar-body-label', 'first cell should be the label');
      expect(labelEls[0].getAttribute('colspan')).toBe('3');
    });

    it('cell should be selected on click', () => {
      const todayElement =
          calendarBodyNativeElement.querySelector('.mat-calendar-body-today') as HTMLElement;
      todayElement.click();
      fixture.detectChanges();

      expect(todayElement.classList)
          .toContain('mat-calendar-body-selected', 'today should be selected');
    });

    it('should mark active date', () => {
      expect((cellEls[10] as HTMLElement).innerText.trim()).toBe('11');
      expect(cellEls[10].classList).toContain('mat-calendar-body-active');
    });

    it('should set a class on even dates', () => {
      expect((cellEls[0] as HTMLElement).innerText.trim()).toBe('1');
      expect((cellEls[1] as HTMLElement).innerText.trim()).toBe('2');
      expect(cellEls[0].classList).not.toContain('even');
      expect(cellEls[1].classList).toContain('even');
    });

  });

});


@Component({
  template: `<table mat-calendar-body
                    [label]="label"
                    [rows]="rows"
                    [todayValue]="todayValue"
                    [selectedValue]="selectedValue"
                    [labelMinRequiredCells]="labelMinRequiredCells"
                    [numCols]="numCols"
                    [activeCell]="10"
                    (selectedValueChange)="onSelect($event)">
             </table>`,
})
class StandardCalendarBody {
  label = 'Jan 2017';
  rows = [[1, 2, 3, 4, 5, 6, 7], [8, 9, 10, 11, 12, 13, 14]].map(row => {
    return row.map(cell => createCell(cell, cell % 2 === 0 ? 'even' : undefined));
  });
  todayValue = 3;
  selectedValue = 4;
  labelMinRequiredCells = 3;
  numCols = 7;

  onSelect(value: number) {
    this.selectedValue = value;
  }
}

function createCell(value: number, cellClasses?: MatCalendarCellCssClasses) {
  return new MatCalendarCell(value, `${value}`, `${value}-label`, true, cellClasses);
}
