import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatLegacySlideToggleModule} from '@angular/material/legacy-slide-toggle';
import {MatLegacySlideToggleHarness} from '@angular/material/legacy-slide-toggle/testing/slide-toggle-harness';

/** Shared tests to run on both the original and MDC-based slide-toggles. */
export function runHarnessTests(
  slideToggleModule: typeof MatLegacySlideToggleModule,
  slideToggleHarness: typeof MatLegacySlideToggleHarness,
) {
  let fixture: ComponentFixture<SlideToggleHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [slideToggleModule, ReactiveFormsModule],
      declarations: [SlideToggleHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(SlideToggleHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all slide-toggle harnesses', async () => {
    const slideToggles = await loader.getAllHarnesses(slideToggleHarness);
    expect(slideToggles.length).toBe(2);
  });

  it('should load slide-toggle with exact label', async () => {
    const slideToggles = await loader.getAllHarnesses(slideToggleHarness.with({label: 'First'}));
    expect(slideToggles.length).toBe(1);
    expect(await slideToggles[0].getLabelText()).toBe('First');
  });

  it('should load slide-toggle with disabled=true predicate', async () => {
    const slideToggles = await loader.getAllHarnesses(slideToggleHarness.with({disabled: true}));
    expect(slideToggles.length).toBe(1);
    expect(await slideToggles[0].isDisabled()).toBe(true);
  });

  it('should load slide-toggle with disabled=false predicate', async () => {
    const slideToggles = await loader.getAllHarnesses(slideToggleHarness.with({disabled: false}));
    expect(slideToggles.length).toBe(1);
    expect(await slideToggles[0].isDisabled()).toBe(false);
  });

  it('should load slide-toggle with regex label match', async () => {
    const slideToggles = await loader.getAllHarnesses(slideToggleHarness.with({label: /^s/i}));
    expect(slideToggles.length).toBe(1);
    expect(await slideToggles[0].getLabelText()).toBe('Second');
  });

  it('should load slide-toggle with name', async () => {
    const slideToggles = await loader.getAllHarnesses(
      slideToggleHarness.with({name: 'first-name'}),
    );
    expect(slideToggles.length).toBe(1);
    expect(await slideToggles[0].getLabelText()).toBe('First');
  });

  it('should get checked state', async () => {
    const [checkedToggle, uncheckedToggle] = await loader.getAllHarnesses(slideToggleHarness);
    expect(await checkedToggle.isChecked()).toBe(true);
    expect(await uncheckedToggle.isChecked()).toBe(false);
  });

  it('should get disabled state', async () => {
    const [enabledToggle, disabledToggle] = await loader.getAllHarnesses(slideToggleHarness);
    expect(await enabledToggle.isDisabled()).toBe(false);
    expect(await disabledToggle.isDisabled()).toBe(true);
  });

  it('should get required state', async () => {
    const [requiredToggle, optionalToggle] = await loader.getAllHarnesses(slideToggleHarness);
    expect(await requiredToggle.isRequired()).toBe(true);
    expect(await optionalToggle.isRequired()).toBe(false);
  });

  it('should get valid state', async () => {
    const [requiredToggle, optionalToggle] = await loader.getAllHarnesses(slideToggleHarness);
    expect(await optionalToggle.isValid())
      .withContext('Expected optional toggle to be valid')
      .toBe(true);
    expect(await requiredToggle.isValid())
      .withContext('Expected required checked toggle to be valid')
      .toBe(true);
    await requiredToggle.uncheck();
    expect(await requiredToggle.isValid())
      .withContext('Expected required unchecked toggle to be invalid')
      .toBe(false);
  });

  it('should get name', async () => {
    const slideToggle = await loader.getHarness(slideToggleHarness.with({label: 'First'}));
    expect(await slideToggle.getName()).toBe('first-name');
  });

  it('should get aria-label', async () => {
    const slideToggle = await loader.getHarness(slideToggleHarness.with({label: 'First'}));
    expect(await slideToggle.getAriaLabel()).toBe('First slide-toggle');
  });

  it('should get aria-labelledby', async () => {
    const slideToggle = await loader.getHarness(slideToggleHarness.with({label: 'Second'}));
    expect(await slideToggle.getAriaLabelledby()).toBe('second-label');
  });

  it('should get label text', async () => {
    const [firstToggle, secondToggle] = await loader.getAllHarnesses(slideToggleHarness);
    expect(await firstToggle.getLabelText()).toBe('First');
    expect(await secondToggle.getLabelText()).toBe('Second');
  });

  it('should focus slide-toggle', async () => {
    const slideToggle = await loader.getHarness(slideToggleHarness.with({label: 'First'}));
    expect(await slideToggle.isFocused()).toBe(false);
    await slideToggle.focus();
    expect(await slideToggle.isFocused()).toBe(true);
  });

  it('should blur slide-toggle', async () => {
    const slideToggle = await loader.getHarness(slideToggleHarness.with({label: 'First'}));
    await slideToggle.focus();
    expect(await slideToggle.isFocused()).toBe(true);
    await slideToggle.blur();
    expect(await slideToggle.isFocused()).toBe(false);
  });

  it('should toggle slide-toggle', async () => {
    fixture.componentInstance.disabled = false;
    const [checkedToggle, uncheckedToggle] = await loader.getAllHarnesses(slideToggleHarness);
    await checkedToggle.toggle();
    await uncheckedToggle.toggle();
    expect(await checkedToggle.isChecked()).toBe(false);
    expect(await uncheckedToggle.isChecked()).toBe(true);
  });

  it('should check slide-toggle', async () => {
    fixture.componentInstance.disabled = false;
    const [checkedToggle, uncheckedToggle] = await loader.getAllHarnesses(slideToggleHarness);
    await checkedToggle.check();
    await uncheckedToggle.check();
    expect(await checkedToggle.isChecked()).toBe(true);
    expect(await uncheckedToggle.isChecked()).toBe(true);
  });

  it('should uncheck slide-toggle', async () => {
    fixture.componentInstance.disabled = false;
    const [checkedToggle, uncheckedToggle] = await loader.getAllHarnesses(slideToggleHarness);
    await checkedToggle.uncheck();
    await uncheckedToggle.uncheck();
    expect(await checkedToggle.isChecked()).toBe(false);
    expect(await uncheckedToggle.isChecked()).toBe(false);
  });

  it('should not toggle disabled slide-toggle', async () => {
    const disabledToggle = await loader.getHarness(slideToggleHarness.with({label: 'Second'}));
    expect(await disabledToggle.isChecked()).toBe(false);
    await disabledToggle.toggle();
    expect(await disabledToggle.isChecked()).toBe(false);
  });
}

@Component({
  template: `
      <mat-slide-toggle
          [formControl]="ctrl"
          required
          name="first-name"
          aria-label="First slide-toggle">
        First
      </mat-slide-toggle>
      <mat-slide-toggle [disabled]="disabled" aria-labelledby="second-label">
        Second
      </mat-slide-toggle>
      <span id="second-label">Second slide-toggle</span>
  `,
})
class SlideToggleHarnessTest {
  ctrl = new FormControl(true);
  disabled = true;
}
