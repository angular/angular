import {HarnessLoader, parallel} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {
  MatDatepickerModule,
  DateRange,
  MAT_DATE_RANGE_SELECTION_STRATEGY,
  DefaultMatCalendarRangeStrategy,
} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatCalendarHarness, CalendarView} from './calendar-harness';

/** Date at which the calendars are set. */
const calendarDate = new Date(2020, 7, 1);

/** Shared tests to run on both the original and MDC-based calendars. */
export function runCalendarHarnessTests(
  datepickerModule: typeof MatDatepickerModule,
  calendarHarness: typeof MatCalendarHarness,
) {
  let fixture: ComponentFixture<CalendarHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatNativeDateModule, datepickerModule],
      declarations: [CalendarHarnessTest],
      providers: [
        {
          // Usually it's the date range picker that provides the default range selection strategy,
          // but since we're testing the calendar on its own, we have to provide it manually.
          provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
          useClass: DefaultMatCalendarRangeStrategy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all calendar harnesses', async () => {
    const calendars = await loader.getAllHarnesses(calendarHarness);
    expect(calendars.length).toBe(2);
  });

  it('should go to a different view', async () => {
    const calendar = await loader.getHarness(calendarHarness.with({selector: '#single'}));
    expect(await calendar.getCurrentView()).toBe(CalendarView.MONTH);

    await calendar.changeView();
    expect(await calendar.getCurrentView()).toBe(CalendarView.MULTI_YEAR);
  });

  it('should get the current view label', async () => {
    const calendar = await loader.getHarness(calendarHarness.with({selector: '#single'}));
    expect(await calendar.getCurrentViewLabel()).toBe('AUG 2020');

    await calendar.changeView();
    expect(await calendar.getCurrentViewLabel()).toBe('2016 – 2039');
  });

  it('should go to the next page in the view', async () => {
    const calendar = await loader.getHarness(calendarHarness.with({selector: '#single'}));
    expect(await calendar.getCurrentViewLabel()).toBe('AUG 2020');

    await calendar.next();
    expect(await calendar.getCurrentViewLabel()).toBe('SEP 2020');
  });

  it('should go to the previous page in the view', async () => {
    const calendar = await loader.getHarness(calendarHarness.with({selector: '#single'}));
    expect(await calendar.getCurrentViewLabel()).toBe('AUG 2020');

    await calendar.previous();
    expect(await calendar.getCurrentViewLabel()).toBe('JUL 2020');
  });

  it('should get all of the date cells inside the calendar', async () => {
    const calendar = await loader.getHarness(calendarHarness.with({selector: '#single'}));
    expect((await calendar.getCells()).length).toBe(31);
  });

  it('should get the text of a calendar cell', async () => {
    const calendar = await loader.getHarness(calendarHarness.with({selector: '#single'}));
    const cells = await calendar.getCells();

    expect(await cells[0].getText()).toBe('1');
    expect(await cells[15].getText()).toBe('16');
    expect(await cells[30].getText()).toBe('31');
  });

  it('should be able to select a specific cell through the calendar', async () => {
    const calendar = await loader.getHarness(calendarHarness.with({selector: '#single'}));
    const targetCell = (await calendar.getCells({text: '16'}))[0];
    expect(await targetCell.isSelected()).toBe(false);

    await calendar.selectCell({text: '16'});
    expect(await targetCell.isSelected()).toBe(true);
  });

  it('should get the aria-label of a cell', async () => {
    const calendar = await loader.getHarness(calendarHarness.with({selector: '#single'}));
    const cells = await calendar.getCells();

    expect(await cells[0].getAriaLabel()).toBe('August 1, 2020');
    expect(await cells[15].getAriaLabel()).toBe('August 16, 2020');
    expect(await cells[30].getAriaLabel()).toBe('August 31, 2020');
  });

  it('should get the disabled state of a cell', async () => {
    fixture.componentInstance.minDate = new Date(
      calendarDate.getFullYear(),
      calendarDate.getMonth(),
      20,
    );

    const calendar = await loader.getHarness(calendarHarness.with({selector: '#single'}));
    const cells = await calendar.getCells();

    expect(await cells[0].isDisabled()).toBe(true);
    expect(await cells[15].isDisabled()).toBe(true);
    expect(await cells[30].isDisabled()).toBe(false);
  });

  it('should select a cell', async () => {
    const calendar = await loader.getHarness(calendarHarness.with({selector: '#single'}));
    const cell = (await calendar.getCells())[10];
    expect(await cell.isSelected()).toBe(false);

    await cell.select();
    expect(await cell.isSelected()).toBe(true);
  });

  it('should get whether a cell is active', async () => {
    const calendar = await loader.getHarness(calendarHarness.with({selector: '#single'}));
    const cells = await calendar.getCells();

    expect(await cells[0].isActive()).toBe(true);
    expect(await cells[15].isActive()).toBe(false);
  });

  it('should get the state of the cell within the main range', async () => {
    const calendar = await loader.getHarness(calendarHarness.with({selector: '#range'}));
    const allCells = await calendar.getCells();
    const [initialStartStates, initialInRangeStates, initialEndStates] = await parallel(() => [
      parallel(() => allCells.map(cell => cell.isRangeStart())),
      parallel(() => allCells.map(cell => cell.isInRange())),
      parallel(() => allCells.map(cell => cell.isRangeEnd())),
    ]);

    expect(initialStartStates.every(state => state === false)).toBe(true);
    expect(initialInRangeStates.every(state => state === false)).toBe(true);
    expect(initialEndStates.every(state => state === false)).toBe(true);

    await (await calendar.getCells({text: '5'}))[0].select();
    await (await calendar.getCells({text: '8'}))[0].select();

    expect(await allCells[4].isRangeStart()).toBe(true);
    expect(await allCells[4].isInRange()).toBe(true);
    expect(await allCells[4].isRangeEnd()).toBe(false);

    expect(await allCells[5].isRangeStart()).toBe(false);
    expect(await allCells[5].isInRange()).toBe(true);
    expect(await allCells[5].isRangeEnd()).toBe(false);

    expect(await allCells[6].isRangeStart()).toBe(false);
    expect(await allCells[6].isInRange()).toBe(true);
    expect(await allCells[6].isRangeEnd()).toBe(false);

    expect(await allCells[7].isRangeStart()).toBe(false);
    expect(await allCells[7].isInRange()).toBe(true);
    expect(await allCells[7].isRangeEnd()).toBe(true);
  });

  it('should get the state of the cell within the comparison range', async () => {
    const calendar = await loader.getHarness(calendarHarness.with({selector: '#range'}));
    const allCells = await calendar.getCells();
    const [initialStartStates, initialInRangeStates, initialEndStates] = await parallel(() => [
      parallel(() => allCells.map(cell => cell.isComparisonRangeStart())),
      parallel(() => allCells.map(cell => cell.isInComparisonRange())),
      parallel(() => allCells.map(cell => cell.isComparisonRangeEnd())),
    ]);

    expect(initialStartStates.every(state => state === false)).toBe(true);
    expect(initialInRangeStates.every(state => state === false)).toBe(true);
    expect(initialEndStates.every(state => state === false)).toBe(true);

    fixture.componentInstance.comparisonStart = new Date(
      calendarDate.getFullYear(),
      calendarDate.getMonth(),
      5,
    );
    fixture.componentInstance.comparisonEnd = new Date(
      calendarDate.getFullYear(),
      calendarDate.getMonth(),
      8,
    );

    expect(await allCells[4].isComparisonRangeStart()).toBe(true);
    expect(await allCells[4].isInComparisonRange()).toBe(true);
    expect(await allCells[4].isComparisonRangeEnd()).toBe(false);

    expect(await allCells[5].isComparisonRangeStart()).toBe(false);
    expect(await allCells[5].isInComparisonRange()).toBe(true);
    expect(await allCells[5].isComparisonRangeEnd()).toBe(false);

    expect(await allCells[6].isComparisonRangeStart()).toBe(false);
    expect(await allCells[6].isInComparisonRange()).toBe(true);
    expect(await allCells[6].isComparisonRangeEnd()).toBe(false);

    expect(await allCells[7].isComparisonRangeStart()).toBe(false);
    expect(await allCells[7].isInComparisonRange()).toBe(true);
    expect(await allCells[7].isComparisonRangeEnd()).toBe(true);
  });

  it('should get the state of the cell within the preview range', async () => {
    const calendar = await loader.getHarness(calendarHarness.with({selector: '#range'}));
    const allCells = await calendar.getCells();
    const [initialStartStates, initialInRangeStates, initialEndStates] = await parallel(() => [
      parallel(() => allCells.map(cell => cell.isPreviewRangeStart())),
      parallel(() => allCells.map(cell => cell.isInPreviewRange())),
      parallel(() => allCells.map(cell => cell.isPreviewRangeEnd())),
    ]);

    expect(initialStartStates.every(state => state === false)).toBe(true);
    expect(initialInRangeStates.every(state => state === false)).toBe(true);
    expect(initialEndStates.every(state => state === false)).toBe(true);

    await (await calendar.getCells({text: '5'}))[0].select();
    await (await calendar.getCells({text: '8'}))[0].hover();

    expect(await allCells[4].isPreviewRangeStart()).toBe(true);
    expect(await allCells[4].isInPreviewRange()).toBe(true);
    expect(await allCells[4].isPreviewRangeEnd()).toBe(false);

    expect(await allCells[5].isPreviewRangeStart()).toBe(false);
    expect(await allCells[5].isInPreviewRange()).toBe(true);
    expect(await allCells[5].isPreviewRangeEnd()).toBe(false);

    expect(await allCells[6].isPreviewRangeStart()).toBe(false);
    expect(await allCells[6].isInPreviewRange()).toBe(true);
    expect(await allCells[6].isPreviewRangeEnd()).toBe(false);

    expect(await allCells[7].isPreviewRangeStart()).toBe(false);
    expect(await allCells[7].isInPreviewRange()).toBe(true);
    expect(await allCells[7].isPreviewRangeEnd()).toBe(true);
  });

  it('should filter cells by their text', async () => {
    const calendar = await loader.getHarness(calendarHarness.with({selector: '#single'}));
    const cells = await calendar.getCells({text: /^3/});
    expect(await parallel(() => cells.map(cell => cell.getText()))).toEqual(['3', '30', '31']);
  });

  it('should filter cells by their selected state', async () => {
    const calendar = await loader.getHarness(calendarHarness.with({selector: '#single'}));
    const allCells = await calendar.getCells();

    await allCells[0].select();

    const selectedCells = await calendar.getCells({selected: true});
    expect(await parallel(() => selectedCells.map(cell => cell.getText()))).toEqual(['1']);
  });

  it('should filter cells by their active state', async () => {
    const calendar = await loader.getHarness(calendarHarness.with({selector: '#single'}));
    const cells = await calendar.getCells({active: true});
    expect(await parallel(() => cells.map(cell => cell.getText()))).toEqual(['1']);
  });

  it('should filter cells by their disabled state', async () => {
    fixture.componentInstance.minDate = new Date(
      calendarDate.getFullYear(),
      calendarDate.getMonth(),
      3,
    );

    const calendar = await loader.getHarness(calendarHarness.with({selector: '#single'}));
    const cells = await calendar.getCells({disabled: true});
    expect(await parallel(() => cells.map(cell => cell.getText()))).toEqual(['1', '2']);
  });

  it('should filter cells based on whether they are inside the comparison range', async () => {
    const calendar = await loader.getHarness(calendarHarness.with({selector: '#range'}));

    fixture.componentInstance.comparisonStart = new Date(
      calendarDate.getFullYear(),
      calendarDate.getMonth(),
      5,
    );
    fixture.componentInstance.comparisonEnd = new Date(
      calendarDate.getFullYear(),
      calendarDate.getMonth(),
      8,
    );

    const cells = await calendar.getCells({inComparisonRange: true});
    expect(await parallel(() => cells.map(cell => cell.getText()))).toEqual(['5', '6', '7', '8']);
  });

  it('should filter cells based on whether they are inside the preview range', async () => {
    const calendar = await loader.getHarness(calendarHarness.with({selector: '#range'}));

    await (await calendar.getCells({text: '5'}))[0].select();
    await (await calendar.getCells({text: '8'}))[0].hover();

    const cells = await calendar.getCells({inPreviewRange: true});
    expect(await parallel(() => cells.map(cell => cell.getText()))).toEqual(['5', '6', '7', '8']);
  });
}

@Component({
  template: `
    <mat-calendar
      id="single"
      [startAt]="startAt"
      [minDate]="minDate"
      [selected]="singleValue"
      (selectedChange)="singleValue = $event"></mat-calendar>

    <mat-calendar
      id="range"
      [startAt]="startAt"
      [minDate]="minDate"
      [selected]="rangeValue"
      [comparisonStart]="comparisonStart"
      [comparisonEnd]="comparisonEnd"
      (selectedChange)="rangeChanged($event)"></mat-calendar>
  `,
})
class CalendarHarnessTest {
  // Start the datepickers off at a specific date so tests
  // run consistently no matter what the current date is.
  readonly startAt = new Date(calendarDate);
  minDate: Date | null;
  singleValue: Date | null = null;
  rangeValue = new DateRange<Date>(null, null);
  comparisonStart: Date | null = null;
  comparisonEnd: Date | null = null;

  rangeChanged(selectedDate: Date) {
    let {start, end} = this.rangeValue;

    if (start == null || end != null) {
      start = selectedDate;
    } else if (end == null) {
      end = selectedDate;
    }

    this.rangeValue = new DateRange<Date>(start, end);
  }
}
