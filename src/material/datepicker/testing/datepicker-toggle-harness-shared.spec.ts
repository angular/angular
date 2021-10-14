import {HarnessLoader, parallel} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component} from '@angular/core';
import {MatNativeDateModule} from '@angular/material/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatDatepickerToggleHarness} from './datepicker-toggle-harness';
import {MatCalendarHarness} from './calendar-harness';

/** Shared tests to run on both the original and MDC-based datepicker toggles. */
export function runDatepickerToggleHarnessTests(
  datepickerModule: typeof MatDatepickerModule,
  datepickerToggleHarness: typeof MatDatepickerToggleHarness,
  calendarHarness: typeof MatCalendarHarness,
) {
  let fixture: ComponentFixture<DatepickerToggleHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, MatNativeDateModule, datepickerModule],
      declarations: [DatepickerToggleHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(DatepickerToggleHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all toggle harnesses', async () => {
    const toggles = await loader.getAllHarnesses(datepickerToggleHarness);
    expect(toggles.length).toBe(2);
  });

  it('should get whether the toggle is disabled', async () => {
    const toggle = await loader.getHarness(datepickerToggleHarness.with({selector: '#basic'}));
    expect(await toggle.isDisabled()).toBe(false);

    fixture.componentInstance.disabled = true;
    expect(await toggle.isDisabled()).toBe(true);
  });

  it('should get whether the toggle has a calendar associated with it', async () => {
    const toggles = await loader.getAllHarnesses(datepickerToggleHarness);
    expect(
      await parallel(() => {
        return toggles.map(toggle => toggle.hasCalendar());
      }),
    ).toEqual([true, false]);
  });

  it('should be able to open and close a calendar in popup mode', async () => {
    const toggle = await loader.getHarness(datepickerToggleHarness.with({selector: '#basic'}));
    expect(await toggle.isCalendarOpen()).toBe(false);

    await toggle.openCalendar();
    expect(await toggle.isCalendarOpen()).toBe(true);

    await toggle.closeCalendar();
    expect(await toggle.isCalendarOpen()).toBe(false);
  });

  it('should be able to open and close a calendar in touch mode', async () => {
    fixture.componentInstance.touchUi = true;
    const toggle = await loader.getHarness(datepickerToggleHarness.with({selector: '#basic'}));
    expect(await toggle.isCalendarOpen()).toBe(false);

    await toggle.openCalendar();
    expect(await toggle.isCalendarOpen()).toBe(true);

    await toggle.closeCalendar();
    expect(await toggle.isCalendarOpen()).toBe(false);
  });

  it('should be able to get the harness for the associated calendar', async () => {
    const toggle = await loader.getHarness(datepickerToggleHarness.with({selector: '#basic'}));
    await toggle.openCalendar();
    expect(await toggle.getCalendar()).toBeInstanceOf(calendarHarness);
  });
}

@Component({
  template: `
    <input [matDatepicker]="picker">
    <mat-datepicker-toggle id="basic" [for]="picker" [disabled]="disabled"></mat-datepicker-toggle>
    <mat-datepicker #picker [touchUi]="touchUi"></mat-datepicker>

    <mat-datepicker-toggle id="no-calendar"></mat-datepicker-toggle>
  `,
})
class DatepickerToggleHarnessTest {
  touchUi = false;
  disabled = false;
}
