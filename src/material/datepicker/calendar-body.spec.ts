import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component} from '@angular/core';
import {MatCalendarBody, MatCalendarCell, MatCalendarUserEvent} from './calendar-body';
import {By} from '@angular/platform-browser';
import {dispatchMouseEvent, dispatchFakeEvent} from '../../cdk/testing/private';


describe('MatCalendarBody', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        MatCalendarBody,
        StandardCalendarBody,
        RangeCalendarBody,
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

      const calendarBodyDebugElement = fixture.debugElement.query(By.directive(MatCalendarBody))!;
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

    it('should have a focus indicator', () => {
      expect(cellEls.every(element => !!element.querySelector('.mat-focus-indicator')))
          .toBe(true);
    });

  });

  describe('range calendar body', () => {
    const startClass = 'mat-calendar-body-range-start';
    const inRangeClass = 'mat-calendar-body-in-range';
    const endClass = 'mat-calendar-body-range-end';
    const comparisonStartClass = 'mat-calendar-body-comparison-start';
    const inComparisonClass = 'mat-calendar-body-in-comparison-range';
    const comparisonEndClass = 'mat-calendar-body-comparison-end';
    const bridgeStart = 'mat-calendar-body-comparison-bridge-start';
    const bridgeEnd = 'mat-calendar-body-comparison-bridge-end';
    const previewStartClass = 'mat-calendar-body-preview-start';
    const inPreviewClass = 'mat-calendar-body-in-preview';
    const previewEndClass = 'mat-calendar-body-preview-end';
    let fixture: ComponentFixture<RangeCalendarBody>;
    let testComponent: RangeCalendarBody;
    let cells: HTMLElement[];

    beforeEach(() => {
      fixture = TestBed.createComponent(RangeCalendarBody);
      fixture.detectChanges();
      testComponent = fixture.componentInstance;
      cells = Array.from(fixture.nativeElement.querySelectorAll('.mat-calendar-body-cell'));
    });

    it('should render a range', () => {
      testComponent.startValue = 1;
      testComponent.endValue = 5;
      fixture.detectChanges();

      expect(cells[0].classList).toContain(startClass);
      expect(cells[1].classList).toContain(inRangeClass);
      expect(cells[2].classList).toContain(inRangeClass);
      expect(cells[3].classList).toContain(inRangeClass);
      expect(cells[4].classList).toContain(endClass);
    });

    it('should render a comparison range', () => {
      testComponent.comparisonStart = 1;
      testComponent.comparisonEnd = 5;
      fixture.detectChanges();

      expect(cells[0].classList).toContain(comparisonStartClass);
      expect(cells[1].classList).toContain(inComparisonClass);
      expect(cells[2].classList).toContain(inComparisonClass);
      expect(cells[3].classList).toContain(inComparisonClass);
      expect(cells[4].classList).toContain(comparisonEndClass);
    });

    it('should be able to render two completely overlapping ranges', () => {
      testComponent.startValue = testComponent.comparisonStart = 1;
      testComponent.endValue = testComponent.comparisonEnd = 5;
      fixture.detectChanges();

      expect(cells[0].classList).toContain(startClass);
      expect(cells[0].classList).toContain(comparisonStartClass);

      expect(cells[1].classList).toContain(inRangeClass);
      expect(cells[1].classList).toContain(inComparisonClass);

      expect(cells[2].classList).toContain(inRangeClass);
      expect(cells[2].classList).toContain(inComparisonClass);

      expect(cells[3].classList).toContain(inRangeClass);
      expect(cells[3].classList).toContain(inComparisonClass);

      expect(cells[4].classList).toContain(endClass);
      expect(cells[4].classList).toContain(comparisonEndClass);
    });

    it('should mark a cell as a start bridge if it is the end of the main range ' +
      'and the start of the comparison', () => {
      testComponent.startValue = 1;
      testComponent.endValue = 5;
      testComponent.comparisonStart = 5;
      testComponent.comparisonEnd = 10;
      fixture.detectChanges();

      expect(cells[4].classList).toContain(bridgeStart);
    });

    it('should not mark a cell as a start bridge if there is no end range value', () => {
      testComponent.startValue = 1;
      testComponent.endValue = null;
      testComponent.comparisonStart = 5;
      testComponent.comparisonEnd = 10;
      fixture.detectChanges();

      expect(cells.some(cell => cell.classList.contains(bridgeStart))).toBe(false);
    });

    it('should mark a cell as an end bridge if it is the start of the main range ' +
      'and the end of the comparison', () => {
      testComponent.comparisonStart = 1;
      testComponent.comparisonEnd = 5;
      testComponent.startValue = 5;
      testComponent.endValue = 10;
      fixture.detectChanges();

      expect(cells[4].classList).toContain(bridgeEnd);
    });

    it('should not mark a cell as an end bridge if there is no end range value', () => {
      testComponent.comparisonStart = 1;
      testComponent.comparisonEnd = 5;
      testComponent.startValue = 5;
      testComponent.endValue = null;
      fixture.detectChanges();

      expect(cells.some(cell => cell.classList.contains(bridgeEnd))).toBe(false);
    });

    it('should be able to show a main range inside a comparison range', () => {
      testComponent.comparisonStart = 1;
      testComponent.comparisonEnd = 5;
      testComponent.startValue = 2;
      testComponent.endValue = 4;
      fixture.detectChanges();

      expect(cells[0].classList).toContain(comparisonStartClass);

      expect(cells[1].classList).toContain(inComparisonClass);
      expect(cells[1].classList).toContain(startClass);

      expect(cells[2].classList).toContain(inComparisonClass);
      expect(cells[2].classList).toContain(inRangeClass);

      expect(cells[3].classList).toContain(inComparisonClass);
      expect(cells[3].classList).toContain(endClass);

      expect(cells[4].classList).toContain(comparisonEndClass);
    });

    it('should be able to show a comparison range inside a main range', () => {
      testComponent.startValue = 1;
      testComponent.endValue = 5;
      testComponent.comparisonStart = 2;
      testComponent.comparisonEnd = 4;
      fixture.detectChanges();

      expect(cells[0].classList).toContain(startClass);

      expect(cells[1].classList).toContain(inRangeClass);
      expect(cells[1].classList).toContain(comparisonStartClass);

      expect(cells[2].classList).toContain(inRangeClass);
      expect(cells[2].classList).toContain(inComparisonClass);

      expect(cells[3].classList).toContain(inRangeClass);
      expect(cells[3].classList).toContain(comparisonEndClass);

      expect(cells[4].classList).toContain(endClass);
    });

    it('should be able to show a range that is larger than the calendar', () => {
      testComponent.startValue = -10;
      testComponent.endValue = 100;
      fixture.detectChanges();

      expect(cells.every(cell => cell.classList.contains(inRangeClass))).toBe(true);
      expect(cells.some(cell => cell.classList.contains(startClass))).toBe(false);
      expect(cells.some(cell => cell.classList.contains(endClass))).toBe(false);
    });

    it('should be able to show a comparison range that is larger than the calendar', () => {
      testComponent.comparisonStart = -10;
      testComponent.comparisonEnd = 100;
      fixture.detectChanges();

      expect(cells.every(cell => cell.classList.contains(inComparisonClass))).toBe(true);
      expect(cells.some(cell => cell.classList.contains(comparisonStartClass))).toBe(false);
      expect(cells.some(cell => cell.classList.contains(comparisonEndClass))).toBe(false);
    });

    it('should be able to show a range that starts before the beginning of the calendar', () => {
      testComponent.startValue = -10;
      testComponent.endValue = 2;
      fixture.detectChanges();

      expect(cells.some(cell => cell.classList.contains(startClass))).toBe(false);
      expect(cells[0].classList).toContain(inRangeClass);
      expect(cells[1].classList).toContain(endClass);
    });

    it('should be able to show a comparison range that starts before the beginning of the calendar',
      () => {
        testComponent.comparisonStart = -10;
        testComponent.comparisonEnd = 2;
        fixture.detectChanges();

        expect(cells.some(cell => cell.classList.contains(comparisonStartClass))).toBe(false);
        expect(cells[0].classList).toContain(inComparisonClass);
        expect(cells[1].classList).toContain(comparisonEndClass);
      });

    it('should be able to show a range that ends after the end of the calendar', () => {
      testComponent.startValue = 27;
      testComponent.endValue = 50;
      fixture.detectChanges();

      expect(cells.some(cell => cell.classList.contains(endClass))).toBe(false);
      expect(cells[26].classList).toContain(startClass);
      expect(cells[27].classList).toContain(inRangeClass);
    });

    it('should be able to show a comparison range that ends after the end of the calendar', () => {
      testComponent.comparisonStart = 27;
      testComponent.comparisonEnd = 50;
      fixture.detectChanges();

      expect(cells.some(cell => cell.classList.contains(comparisonEndClass))).toBe(false);
      expect(cells[26].classList).toContain(comparisonStartClass);
      expect(cells[27].classList).toContain(inComparisonClass);
    });

    it('should be able to show a range that ends after the end of the calendar', () => {
      testComponent.startValue = 27;
      testComponent.endValue = 50;
      fixture.detectChanges();

      expect(cells.some(cell => cell.classList.contains(endClass))).toBe(false);
      expect(cells[26].classList).toContain(startClass);
      expect(cells[27].classList).toContain(inRangeClass);
    });

    it('should not to mark a date as both the start and end', () => {
      testComponent.startValue = 1;
      testComponent.endValue = 1;
      fixture.detectChanges();

      expect(cells[0].classList).not.toContain(startClass);
      expect(cells[0].classList).not.toContain(inRangeClass);
      expect(cells[0].classList).not.toContain(endClass);
    });

    it('should not mark a date as both the comparison start and end', () => {
      testComponent.comparisonStart = 1;
      testComponent.comparisonEnd = 1;
      fixture.detectChanges();

      expect(cells[0].classList).not.toContain(comparisonStartClass);
      expect(cells[0].classList).not.toContain(inComparisonClass);
      expect(cells[0].classList).not.toContain(comparisonEndClass);
    });

    it('should not mark a date as the range end if it comes before the start', () => {
      testComponent.startValue = 2;
      testComponent.endValue = 1;
      fixture.detectChanges();

      expect(cells[0].classList).not.toContain(endClass);
      expect(cells[0].classList).not.toContain(inRangeClass);
      expect(cells[1].classList).not.toContain(startClass);
    });

    it('should not mark a date as the comparison range end if it comes before the start', () => {
      testComponent.comparisonStart = 2;
      testComponent.comparisonEnd = 1;
      fixture.detectChanges();

      expect(cells[0].classList).not.toContain(comparisonEndClass);
      expect(cells[0].classList).not.toContain(inComparisonClass);
      expect(cells[1].classList).not.toContain(comparisonStartClass);
    });

    it('should not show a range if there is no start', () => {
      testComponent.startValue = null;
      testComponent.endValue = 10;
      fixture.detectChanges();

      expect(cells.some(cell => cell.classList.contains(inRangeClass))).toBe(false);
      expect(cells.some(cell => cell.classList.contains(endClass))).toBe(false);
    });

    it('should not show a comparison range if there is no start', () => {
      testComponent.comparisonStart = null;
      testComponent.comparisonEnd = 10;
      fixture.detectChanges();

      expect(cells.some(cell => cell.classList.contains(inComparisonClass))).toBe(false);
      expect(cells.some(cell => cell.classList.contains(comparisonEndClass))).toBe(false);
    });

    it('should not show a comparison range if there is no end', () => {
      testComponent.comparisonStart = 10;
      testComponent.comparisonEnd = null;
      fixture.detectChanges();

      expect(cells.some(cell => cell.classList.contains(inComparisonClass))).toBe(false);
      expect(cells.some(cell => cell.classList.contains(comparisonEndClass))).toBe(false);
    });

    it('should preview the selected range after the user clicks on a start and hovers away', () => {
      cells[2].click();
      fixture.detectChanges();

      dispatchMouseEvent(cells[5], 'mouseenter');
      fixture.detectChanges();

      expect(cells[2].classList).toContain(previewStartClass);
      expect(cells[3].classList).toContain(inPreviewClass);
      expect(cells[4].classList).toContain(inPreviewClass);
      expect(cells[5].classList).toContain(previewEndClass);

      // Go a few cells ahead.
      dispatchMouseEvent(cells[7], 'mouseenter');
      fixture.detectChanges();

      expect(cells[5].classList).not.toContain(previewEndClass);
      expect(cells[5].classList).toContain(inPreviewClass);
      expect(cells[6].classList).toContain(inPreviewClass);
      expect(cells[7].classList).toContain(previewEndClass);

      // Go back a few cells.
      dispatchMouseEvent(cells[4], 'mouseenter');
      fixture.detectChanges();

      expect(cells[5].classList).not.toContain(inPreviewClass);
      expect(cells[6].classList).not.toContain(inPreviewClass);
      expect(cells[7].classList).not.toContain(previewEndClass);
      expect(cells[3].classList).toContain(inPreviewClass);
      expect(cells[4].classList).toContain(previewEndClass);
    });

    it('should preview the selected range after the user selects a start and moves focus away',
      () => {
        cells[2].click();
        fixture.detectChanges();

        dispatchFakeEvent(cells[5], 'focus');
        fixture.detectChanges();

        expect(cells[2].classList).toContain(previewStartClass);
        expect(cells[3].classList).toContain(inPreviewClass);
        expect(cells[4].classList).toContain(inPreviewClass);
        expect(cells[5].classList).toContain(previewEndClass);

        // Go a few cells ahead.
        dispatchFakeEvent(cells[7], 'focus');
        fixture.detectChanges();

        expect(cells[5].classList).not.toContain(previewEndClass);
        expect(cells[5].classList).toContain(inPreviewClass);
        expect(cells[6].classList).toContain(inPreviewClass);
        expect(cells[7].classList).toContain(previewEndClass);

        // Go back a few cells.
        dispatchFakeEvent(cells[4], 'focus');
        fixture.detectChanges();

        expect(cells[5].classList).not.toContain(inPreviewClass);
        expect(cells[6].classList).not.toContain(inPreviewClass);
        expect(cells[7].classList).not.toContain(previewEndClass);
        expect(cells[3].classList).toContain(inPreviewClass);
        expect(cells[4].classList).toContain(previewEndClass);
      });

    it('should not be able to extend the range before the start', () => {
      cells[5].click();
      fixture.detectChanges();

      dispatchMouseEvent(cells[2], 'mouseenter');
      fixture.detectChanges();

      expect(cells[5].classList).not.toContain(startClass);
      expect(cells[5].classList).not.toContain(previewStartClass);
      expect(cells.some(cell => cell.classList.contains(inPreviewClass))).toBe(false);
    });

    it('should be able to show a range, starting before the beginning of the calendar, ' +
      'while hovering', () => {
        fixture.componentInstance.startValue = -1;
        fixture.detectChanges();

        dispatchMouseEvent(cells[2], 'mouseenter');
        fixture.detectChanges();

        expect(cells.some(cell => cell.classList.contains(previewStartClass))).toBe(false);
        expect(cells[0].classList).toContain(inPreviewClass);
        expect(cells[1].classList).toContain(inPreviewClass);
        expect(cells[2].classList).toContain(previewEndClass);
      });

    it('should be able to show a range, starting before the beginning of the calendar, ' +
      'while moving focus', () => {
        fixture.componentInstance.startValue = -1;
        fixture.detectChanges();

        dispatchMouseEvent(cells[2], 'focus');
        fixture.detectChanges();

        expect(cells.some(cell => cell.classList.contains(previewStartClass))).toBe(false);
        expect(cells[0].classList).toContain(inPreviewClass);
        expect(cells[1].classList).toContain(inPreviewClass);
        expect(cells[2].classList).toContain(previewEndClass);
      });

    it('should remove the preview if the user moves their pointer away', () => {
      cells[2].click();
      fixture.detectChanges();

      dispatchMouseEvent(cells[4], 'mouseenter');
      fixture.detectChanges();

      expect(cells[2].classList).toContain(previewStartClass);
      expect(cells[3].classList).toContain(inPreviewClass);
      expect(cells[4].classList).toContain(previewEndClass);

      // Move the pointer away.
      dispatchMouseEvent(cells[4], 'mouseleave');
      fixture.detectChanges();

      expect(cells[2].classList).not.toContain(previewStartClass);
      expect(cells[3].classList).not.toContain(inPreviewClass);
      expect(cells[4].classList).not.toContain(previewEndClass);

      // Move the pointer back in to a different cell.
      dispatchMouseEvent(cells[5], 'mouseenter');
      fixture.detectChanges();

      expect(cells[2].classList).toContain(previewStartClass);
      expect(cells[3].classList).toContain(inPreviewClass);
      expect(cells[4].classList).toContain(inPreviewClass);
      expect(cells[5].classList).toContain(previewEndClass);
    });

    it('should remove the preview if the user moves their focus away', () => {
      cells[2].click();
      fixture.detectChanges();

      dispatchFakeEvent(cells[4], 'focus');
      fixture.detectChanges();

      expect(cells[2].classList).toContain(previewStartClass);
      expect(cells[3].classList).toContain(inPreviewClass);
      expect(cells[4].classList).toContain(previewEndClass);

      // Move the pointer away.
      dispatchFakeEvent(cells[4], 'blur');
      fixture.detectChanges();

      expect(cells[2].classList).not.toContain(previewStartClass);
      expect(cells[3].classList).not.toContain(inPreviewClass);
      expect(cells[4].classList).not.toContain(previewEndClass);

      // Move the pointer back in to a different cell.
      dispatchFakeEvent(cells[5], 'focus');
      fixture.detectChanges();

      expect(cells[2].classList).toContain(previewStartClass);
      expect(cells[3].classList).toContain(inPreviewClass);
      expect(cells[4].classList).toContain(inPreviewClass);
      expect(cells[5].classList).toContain(previewEndClass);
    });

    it('should mark a cell as being identical to the comparison range', () => {
      testComponent.comparisonStart = testComponent.comparisonEnd = 3;
      fixture.detectChanges();

      const comparisonIdenticalCells: NodeListOf<HTMLElement> =
          fixture.nativeElement.querySelectorAll('.mat-calendar-body-comparison-identical');

      expect(comparisonIdenticalCells.length).toBe(1);
      expect(cells[2].contains(comparisonIdenticalCells[0])).toBe(true);
      expect(cells.some(cell => {
        const classList = cell.classList;
        return classList.contains(startClass) || classList.contains(inRangeClass) ||
               classList.contains(endClass) || classList.contains(comparisonStartClass) ||
               classList.contains(inComparisonClass) || classList.contains(comparisonEndClass);
      })).toBe(false);
    });

  });

});


@Component({
  template: `
    <table mat-calendar-body
          [label]="label"
          [rows]="rows"
          [todayValue]="todayValue"
          [startValue]="selectedValue"
          [endValue]="selectedValue"
          [labelMinRequiredCells]="labelMinRequiredCells"
          [numCols]="numCols"
          [activeCell]="10"
          (selectedValueChange)="onSelect($event)">
    </table>`,
})
class StandardCalendarBody {
  label = 'Jan 2017';
  rows = createCalendarCells(2);
  todayValue = 3;
  selectedValue = 4;
  labelMinRequiredCells = 3;
  numCols = 7;

  onSelect(event: MatCalendarUserEvent<number>) {
    this.selectedValue = event.value;
  }
}

@Component({
  template: `
    <table mat-calendar-body
          [isRange]="true"
          [rows]="rows"
          [startValue]="startValue"
          [endValue]="endValue"
          [comparisonStart]="comparisonStart"
          [comparisonEnd]="comparisonEnd"
          [previewStart]="previewStart"
          [previewEnd]="previewEnd"
          (selectedValueChange)="onSelect($event)"
          (previewChange)="previewChanged($event)">
    </table>`,
})
class RangeCalendarBody {
  rows = createCalendarCells(4);
  startValue: number | null;
  endValue: number | null;
  comparisonStart: number | null;
  comparisonEnd: number | null;
  previewStart: number | null;
  previewEnd: number | null;

  onSelect(event: MatCalendarUserEvent<number>) {
    const value = event.value;
    if (!this.startValue) {
      this.startValue = value;
    } else if (!this.endValue) {
      this.endValue = value;
    } else {
      this.startValue = value;
      this.endValue = null;
    }
  }

  previewChanged(event: MatCalendarUserEvent<MatCalendarCell<Date> | null>) {
    this.previewStart = this.startValue;
    this.previewEnd = event.value?.compareValue || null;
  }
}

/**
 * Creates a 2d array of days, split into weeks.
 * @param weeks Number of weeks that should be generated.
 */
function createCalendarCells(weeks: number): MatCalendarCell[][] {
  const rows: number[][] = [];
  let dayCounter = 1;

  for (let i = 0; i < weeks; i++) {
    const row = [];

    while (row.length < 7) {
      row.push(dayCounter++);
    }

    rows.push(row);
  }

  return rows.map(row => row.map(cell => {
    return new MatCalendarCell(cell, `${cell}`, `${cell}-label`, true,
        cell % 2 === 0 ? 'even' : undefined);
  }));
}
