import {HarnessLoader, parallel} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component} from '@angular/core';
import {MatNativeDateModule} from '@angular/material/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatDatepickerInputHarness} from './datepicker-input-harness';
import {MatCalendarHarness} from './calendar-harness';

/** Shared tests to run on both the original and MDC-based datepicker inputs. */
export function runDatepickerInputHarnessTests(
  datepickerModule: typeof MatDatepickerModule,
  datepickerInputHarness: typeof MatDatepickerInputHarness,
  calendarHarness: typeof MatCalendarHarness,
) {
  let fixture: ComponentFixture<DatepickerInputHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, MatNativeDateModule, datepickerModule, FormsModule],
      declarations: [DatepickerInputHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(DatepickerInputHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all datepicker input harnesses', async () => {
    const inputs = await loader.getAllHarnesses(datepickerInputHarness);
    expect(inputs.length).toBe(2);
  });

  it('should filter inputs based on their value', async () => {
    fixture.componentInstance.date = new Date(2020, 0, 1, 12, 0, 0);
    const inputs = await loader.getAllHarnesses(datepickerInputHarness.with({value: /2020/}));
    expect(inputs.length).toBe(1);
  });

  it('should filter inputs based on their placeholder', async () => {
    const inputs = await loader.getAllHarnesses(
      datepickerInputHarness.with({
        placeholder: /^Type/,
      }),
    );

    expect(inputs.length).toBe(1);
  });

  it('should get whether the input has an associated calendar', async () => {
    const inputs = await loader.getAllHarnesses(datepickerInputHarness);
    expect(await parallel(() => inputs.map(input => input.hasCalendar()))).toEqual([true, false]);
  });

  it('should get whether the input is disabled', async () => {
    const input = await loader.getHarness(datepickerInputHarness.with({selector: '#basic'}));
    expect(await input.isDisabled()).toBe(false);

    fixture.componentInstance.disabled = true;
    expect(await input.isDisabled()).toBe(true);
  });

  it('should get whether the input is required', async () => {
    const input = await loader.getHarness(datepickerInputHarness.with({selector: '#basic'}));
    expect(await input.isRequired()).toBe(false);

    fixture.componentInstance.required = true;
    expect(await input.isRequired()).toBe(true);
  });

  it('should get the input value', async () => {
    const input = await loader.getHarness(datepickerInputHarness.with({selector: '#basic'}));
    fixture.componentInstance.date = new Date(2020, 0, 1, 12, 0, 0);

    expect(await input.getValue()).toBe('1/1/2020');
  });

  it('should set the input value', async () => {
    const input = await loader.getHarness(datepickerInputHarness.with({selector: '#basic'}));
    expect(await input.getValue()).toBeFalsy();

    await input.setValue('1/1/2020');
    expect(await input.getValue()).toBe('1/1/2020');
  });

  it('should get the input placeholder', async () => {
    const inputs = await loader.getAllHarnesses(datepickerInputHarness);
    expect(
      await parallel(() =>
        inputs.map(input => {
          return input.getPlaceholder();
        }),
      ),
    ).toEqual(['Type a date', '']);
  });

  it('should be able to change the input focused state', async () => {
    const input = await loader.getHarness(datepickerInputHarness.with({selector: '#basic'}));
    expect(await input.isFocused()).toBe(false);

    await input.focus();
    expect(await input.isFocused()).toBe(true);

    await input.blur();
    expect(await input.isFocused()).toBe(false);
  });

  it('should get the minimum date of the input', async () => {
    const inputs = await loader.getAllHarnesses(datepickerInputHarness);
    fixture.componentInstance.minDate = new Date(2020, 0, 1, 12, 0, 0);
    expect(await parallel(() => inputs.map(input => input.getMin()))).toEqual(['2020-01-01', null]);
  });

  it('should get the maximum date of the input', async () => {
    const inputs = await loader.getAllHarnesses(datepickerInputHarness);
    fixture.componentInstance.maxDate = new Date(2020, 0, 1, 12, 0, 0);
    expect(await parallel(() => inputs.map(input => input.getMax()))).toEqual(['2020-01-01', null]);
  });

  it('should be able to open and close a calendar in popup mode', async () => {
    const input = await loader.getHarness(datepickerInputHarness.with({selector: '#basic'}));
    expect(await input.isCalendarOpen()).toBe(false);

    await input.openCalendar();
    expect(await input.isCalendarOpen()).toBe(true);

    await input.closeCalendar();
    expect(await input.isCalendarOpen()).toBe(false);
  });

  it('should be able to open and close a calendar in touch mode', async () => {
    fixture.componentInstance.touchUi = true;
    const input = await loader.getHarness(datepickerInputHarness.with({selector: '#basic'}));
    expect(await input.isCalendarOpen()).toBe(false);

    await input.openCalendar();
    expect(await input.isCalendarOpen()).toBe(true);

    await input.closeCalendar();
    expect(await input.isCalendarOpen()).toBe(false);
  });

  it('should be able to get the harness for the associated calendar', async () => {
    const input = await loader.getHarness(datepickerInputHarness.with({selector: '#basic'}));
    await input.openCalendar();
    expect(await input.getCalendar()).toBeInstanceOf(calendarHarness);
  });

  it('should emit the `dateChange` event when the value is changed', async () => {
    const input = await loader.getHarness(datepickerInputHarness.with({selector: '#basic'}));
    expect(fixture.componentInstance.dateChangeCount).toBe(0);

    await input.setValue('1/1/2020');
    expect(fixture.componentInstance.dateChangeCount).toBe(1);
  });
}

@Component({
  template: `
    <input
      id="basic"
      matInput
      [matDatepicker]="picker"
      (dateChange)="dateChangeCount = dateChangeCount + 1"
      [(ngModel)]="date"
      [min]="minDate"
      [max]="maxDate"
      [disabled]="disabled"
      [required]="required"
      placeholder="Type a date">
    <mat-datepicker #picker [touchUi]="touchUi"></mat-datepicker>
    <input id="no-datepicker" matDatepicker>
  `,
})
class DatepickerInputHarnessTest {
  date: Date | null = null;
  minDate: Date | null = null;
  maxDate: Date | null = null;
  touchUi = false;
  disabled = false;
  required = false;
  dateChangeCount = 0;
}
