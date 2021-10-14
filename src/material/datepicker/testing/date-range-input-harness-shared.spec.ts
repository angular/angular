import {HarnessLoader, parallel} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component} from '@angular/core';
import {MatNativeDateModule} from '@angular/material/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatCalendarHarness} from './calendar-harness';
import {
  MatDateRangeInputHarness,
  MatStartDateHarness,
  MatEndDateHarness,
} from './date-range-input-harness';

/** Shared tests to run on both the original and MDC-based date range inputs. */
export function runDateRangeInputHarnessTests(
  datepickerModule: typeof MatDatepickerModule,
  dateRangeInputHarness: typeof MatDateRangeInputHarness,
  startInputHarness: typeof MatStartDateHarness,
  endInputHarness: typeof MatEndDateHarness,
  calendarHarness: typeof MatCalendarHarness,
) {
  let fixture: ComponentFixture<DateRangeInputHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, MatNativeDateModule, datepickerModule, FormsModule],
      declarations: [DateRangeInputHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(DateRangeInputHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all date range input harnesses', async () => {
    const inputs = await loader.getAllHarnesses(dateRangeInputHarness);
    expect(inputs.length).toBe(2);
  });

  it('should get whether the input is disabled', async () => {
    const input = await loader.getHarness(dateRangeInputHarness.with({selector: '[basic]'}));
    expect(await input.isDisabled()).toBe(false);

    fixture.componentInstance.disabled = true;
    expect(await input.isDisabled()).toBe(true);
  });

  it('should get whether the input is required', async () => {
    const input = await loader.getHarness(dateRangeInputHarness.with({selector: '[basic]'}));
    expect(await input.isRequired()).toBe(false);

    fixture.componentInstance.required = true;
    expect(await input.isRequired()).toBe(true);
  });

  it('should get the input separator', async () => {
    const input = await loader.getHarness(dateRangeInputHarness.with({selector: '[basic]'}));
    expect(await input.getSeparator()).toBe('–');
  });

  it('should get the combined input value including the separator', async () => {
    const input = await loader.getHarness(dateRangeInputHarness.with({selector: '[basic]'}));

    fixture.componentInstance.startDate = new Date(2020, 0, 1, 12, 0, 0);
    fixture.componentInstance.endDate = new Date(2020, 1, 2, 12, 0, 0);

    expect(await input.getValue()).toBe('1/1/2020 – 2/2/2020');
  });

  it('should get harnesses for the inner inputs', async () => {
    const input = await loader.getHarness(dateRangeInputHarness.with({selector: '[basic]'}));
    const [start, end] = await parallel(() => [input.getStartInput(), input.getEndInput()]);
    expect(start).toBeInstanceOf(startInputHarness);
    expect(end).toBeInstanceOf(endInputHarness);
  });

  it('should be able to open and close a calendar in popup mode', async () => {
    const input = await loader.getHarness(dateRangeInputHarness.with({selector: '[basic]'}));
    expect(await input.isCalendarOpen()).toBe(false);

    await input.openCalendar();
    expect(await input.isCalendarOpen()).toBe(true);

    await input.closeCalendar();
    expect(await input.isCalendarOpen()).toBe(false);
  });

  it('should be able to open and close a calendar in touch mode', async () => {
    fixture.componentInstance.touchUi = true;
    const input = await loader.getHarness(dateRangeInputHarness.with({selector: '[basic]'}));
    expect(await input.isCalendarOpen()).toBe(false);

    await input.openCalendar();
    expect(await input.isCalendarOpen()).toBe(true);

    await input.closeCalendar();
    expect(await input.isCalendarOpen()).toBe(false);
  });

  it('should be able to get the harness for the associated calendar', async () => {
    const input = await loader.getHarness(dateRangeInputHarness.with({selector: '[basic]'}));
    await input.openCalendar();
    expect(await input.getCalendar()).toBeInstanceOf(calendarHarness);
  });

  it('should get whether the inner inputs are disabled', async () => {
    const input = await loader.getHarness(dateRangeInputHarness.with({selector: '[basic]'}));
    const [start, end] = await parallel(() => [input.getStartInput(), input.getEndInput()]);

    expect(await parallel(() => [start.isDisabled(), end.isDisabled()])).toEqual([false, false]);

    fixture.componentInstance.subInputsDisabled = true;
    expect(await parallel(() => [start.isDisabled(), end.isDisabled()])).toEqual([true, true]);
  });

  it('should get whether the inner inputs are required', async () => {
    const input = await loader.getHarness(dateRangeInputHarness.with({selector: '[basic]'}));
    const [start, end] = await parallel(() => [input.getStartInput(), input.getEndInput()]);

    expect(await parallel(() => [start.isRequired(), end.isRequired()])).toEqual([false, false]);

    fixture.componentInstance.subInputsRequired = true;
    expect(await parallel(() => [start.isRequired(), end.isRequired()])).toEqual([true, true]);
  });

  it('should get the values of the inner inputs', async () => {
    const input = await loader.getHarness(dateRangeInputHarness.with({selector: '[basic]'}));
    const [start, end] = await parallel(() => [input.getStartInput(), input.getEndInput()]);

    fixture.componentInstance.startDate = new Date(2020, 0, 1, 12, 0, 0);
    fixture.componentInstance.endDate = new Date(2020, 1, 2, 12, 0, 0);

    expect(
      await parallel(() => {
        return [start.getValue(), end.getValue()];
      }),
    ).toEqual(['1/1/2020', '2/2/2020']);
  });

  it('should set the values of the inner inputs', async () => {
    const input = await loader.getHarness(dateRangeInputHarness.with({selector: '[basic]'}));
    const [start, end] = await parallel(() => [input.getStartInput(), input.getEndInput()]);

    expect(await parallel(() => [start.getValue(), end.getValue()])).toEqual(['', '']);

    await parallel(() => [start.setValue('1/1/2020'), end.setValue('2/2/2020')]);

    expect(
      await parallel(() => {
        return [start.getValue(), end.getValue()];
      }),
    ).toEqual(['1/1/2020', '2/2/2020']);
  });

  it('should get the placeholders of the inner inputs', async () => {
    const input = await loader.getHarness(dateRangeInputHarness.with({selector: '[basic]'}));
    const [start, end] = await parallel(() => [input.getStartInput(), input.getEndInput()]);

    expect(await parallel(() => [start.getPlaceholder(), end.getPlaceholder()])).toEqual([
      'Start date',
      'End date',
    ]);
  });

  it('should be able to change the inner input focused state', async () => {
    const input = await loader.getHarness(dateRangeInputHarness.with({selector: '[basic]'}));
    const [start, end] = await parallel(() => [input.getStartInput(), input.getEndInput()]);

    expect(await start.isFocused()).toBe(false);
    await start.focus();
    expect(await start.isFocused()).toBe(true);
    await start.blur();
    expect(await start.isFocused()).toBe(false);

    expect(await end.isFocused()).toBe(false);
    await end.focus();
    expect(await end.isFocused()).toBe(true);
    await end.blur();
    expect(await end.isFocused()).toBe(false);
  });

  it('should get the minimum date of the inner inputs', async () => {
    const input = await loader.getHarness(dateRangeInputHarness.with({selector: '[basic]'}));
    const [start, end] = await parallel(() => [input.getStartInput(), input.getEndInput()]);

    expect(await parallel(() => [start.getMin(), end.getMin()])).toEqual([null, null]);

    fixture.componentInstance.minDate = new Date(2020, 0, 1, 12, 0, 0);
    expect(
      await parallel(() => {
        return [start.getMin(), end.getMin()];
      }),
    ).toEqual(['2020-01-01', '2020-01-01']);
  });

  it('should get the maximum date of the inner inputs', async () => {
    const input = await loader.getHarness(dateRangeInputHarness.with({selector: '[basic]'}));
    const [start, end] = await parallel(() => [input.getStartInput(), input.getEndInput()]);

    expect(await parallel(() => [start.getMax(), end.getMax()])).toEqual([null, null]);

    fixture.componentInstance.maxDate = new Date(2020, 0, 1, 12, 0, 0);

    expect(
      await parallel(() => {
        return [start.getMax(), end.getMax()];
      }),
    ).toEqual(['2020-01-01', '2020-01-01']);
  });

  it('should dispatch the dateChange event when the inner input values have changed', async () => {
    const input = await loader.getHarness(dateRangeInputHarness.with({selector: '[basic]'}));
    const [start, end] = await parallel(() => [input.getStartInput(), input.getEndInput()]);

    expect(fixture.componentInstance.startDateChangeCount).toBe(0);
    expect(fixture.componentInstance.endDateChangeCount).toBe(0);

    await parallel(() => [start.setValue('1/1/2020'), end.setValue('2/2/2020')]);

    expect(fixture.componentInstance.startDateChangeCount).toBe(1);
    expect(fixture.componentInstance.endDateChangeCount).toBe(1);
  });
}

@Component({
  template: `
    <mat-date-range-input
      basic
      [disabled]="disabled"
      [required]="required"
      [min]="minDate"
      [max]="maxDate"
      [rangePicker]="picker">
      <input
        matStartDate
        [(ngModel)]="startDate"
        (dateChange)="startDateChangeCount = startDateChangeCount + 1"
        [disabled]="subInputsDisabled"
        [required]="subInputsRequired"
        placeholder="Start date">
      <input
        matEndDate
        [(ngModel)]="endDate"
        (dateChange)="endDateChangeCount = endDateChangeCount + 1"
        [disabled]="subInputsDisabled"
        [required]="subInputsRequired"
        placeholder="End date">
    </mat-date-range-input>
    <mat-date-range-picker #picker [touchUi]="touchUi"></mat-date-range-picker>

    <mat-date-range-input no-range-picker>
      <input matStartDate>
      <input matEndDate>
    </mat-date-range-input>
  `,
})
class DateRangeInputHarnessTest {
  startDate: Date | null = null;
  endDate: Date | null = null;
  minDate: Date | null = null;
  maxDate: Date | null = null;
  touchUi = false;
  disabled = false;
  required = false;
  subInputsDisabled = false;
  subInputsRequired = false;
  startDateChangeCount = 0;
  endDateChangeCount = 0;
}
