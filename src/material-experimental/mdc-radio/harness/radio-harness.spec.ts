import {HarnessLoader} from '@angular/cdk-experimental/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk-experimental/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {MatRadioModule} from '@angular/material/radio';
import {MatRadioButtonHarness} from './radio-harness';

let fixture: ComponentFixture<MultipleRadioButtonsHarnessTest>;
let loader: HarnessLoader;
let radioButtonHarness: typeof MatRadioButtonHarness;

describe('MatRadioButtonHarness', () => {
  describe('non-MDC-based', () => {
    beforeEach(async () => {
      await TestBed
          .configureTestingModule({
            imports: [MatRadioModule, ReactiveFormsModule],
            declarations: [MultipleRadioButtonsHarnessTest],
          })
          .compileComponents();

      fixture = TestBed.createComponent(MultipleRadioButtonsHarnessTest);
      fixture.detectChanges();
      loader = TestbedHarnessEnvironment.loader(fixture);
      radioButtonHarness = MatRadioButtonHarness;
    });

    runTests();
  });

  describe(
      'MDC-based',
      () => {
          // TODO: run tests for MDC based radio-button once implemented.
      });
});

/** Shared tests to run on both the original and MDC-based radio-button's. */
function runTests() {
  it('should load all radio-button harnesses', async () => {
    const radios = await loader.getAllHarnesses(radioButtonHarness);
    expect(radios.length).toBe(4);
  });

  it('should load radio-button with exact label', async () => {
    const radios = await loader.getAllHarnesses(radioButtonHarness.with({label: 'Option #2'}));
    expect(radios.length).toBe(1);
    expect(await radios[0].getId()).toBe('opt2');
    expect(await radios[0].getLabelText()).toBe('Option #2');
  });

  it('should load radio-button with regex label match', async () => {
    const radios = await loader.getAllHarnesses(radioButtonHarness.with({label: /#3$/i}));
    expect(radios.length).toBe(1);
    expect(await radios[0].getId()).toBe('opt3');
    expect(await radios[0].getLabelText()).toBe('Option #3');
  });

  it('should load radio-button with id', async () => {
    const radios = await loader.getAllHarnesses(radioButtonHarness.with({id: 'opt3'}));
    expect(radios.length).toBe(1);
    expect(await radios[0].getId()).toBe('opt3');
    expect(await radios[0].getLabelText()).toBe('Option #3');
  });

  it('should load radio-buttons with same name', async () => {
    const radios = await loader.getAllHarnesses(radioButtonHarness.with({name: 'group1'}));
    expect(radios.length).toBe(2);

    expect(await radios[0].getId()).toBe('opt1');
    expect(await radios[1].getId()).toBe('opt2');
  });

  it('should get checked state', async () => {
    const [uncheckedRadio, checkedRadio] = await loader.getAllHarnesses(radioButtonHarness);
    expect(await uncheckedRadio.isChecked()).toBe(false);
    expect(await checkedRadio.isChecked()).toBe(true);
  });

  it('should get label text', async () => {
    const [firstRadio, secondRadio, thirdRadio] = await loader.getAllHarnesses(radioButtonHarness);
    expect(await firstRadio.getLabelText()).toBe('Option #1');
    expect(await secondRadio.getLabelText()).toBe('Option #2');
    expect(await thirdRadio.getLabelText()).toBe('Option #3');
  });

  it('should get disabled state', async () => {
    const [firstRadio] = await loader.getAllHarnesses(radioButtonHarness);
    expect(await firstRadio.isDisabled()).toBe(false);

    fixture.componentInstance.disableAll = true;
    fixture.detectChanges();

    expect(await firstRadio.isDisabled()).toBe(true);
  });

  it('should focus radio-button', async () => {
    const radioButton = await loader.getHarness(radioButtonHarness.with({id: 'opt2'}));
    expect(getActiveElementTagName()).not.toBe('input');
    await radioButton.focus();
    expect(getActiveElementTagName()).toBe('input');
  });

  it('should blur radio-button', async () => {
    const radioButton = await loader.getHarness(radioButtonHarness.with({id: 'opt2'}));
    await radioButton.focus();
    expect(getActiveElementTagName()).toBe('input');
    await radioButton.blur();
    expect(getActiveElementTagName()).not.toBe('input');
  });

  it('should check radio-button', async () => {
    const [uncheckedRadio, checkedRadio] = await loader.getAllHarnesses(radioButtonHarness);
    await uncheckedRadio.check();
    expect(await uncheckedRadio.isChecked()).toBe(true);
    // Checked radio state should change since the two radio's
    // have the same name and only one can be selected.
    expect(await checkedRadio.isChecked()).toBe(false);
  });

  it('should not be able to check disabled radio-button', async () => {
    fixture.componentInstance.disableAll = true;
    fixture.detectChanges();

    const radioButton = await loader.getHarness(radioButtonHarness.with({id: 'opt3'}));
    expect(await radioButton.isChecked()).toBe(false);
    await radioButton.check();
    expect(await radioButton.isChecked()).toBe(false);

    fixture.componentInstance.disableAll = false;
    fixture.detectChanges();

    expect(await radioButton.isChecked()).toBe(false);
    await radioButton.check();
    expect(await radioButton.isChecked()).toBe(true);
  });

  it('should get required state', async () => {
    const radioButton = await loader.getHarness(radioButtonHarness.with({id: 'required-radio'}));
    expect(await radioButton.isRequired()).toBe(true);
  });
}
function getActiveElementTagName() {
  return document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
}

@Component({
  template: `
    <mat-radio-button *ngFor="let value of values, let i = index"
                      [name]="value === 'opt3' ? 'group2' : 'group1'"
                      [disabled]="disableAll"
                      [checked]="value === 'opt2'"
                      [id]="value"
                      [required]="value === 'opt2'"
                      [value]="value">
      Option #{{i + 1}}
    </mat-radio-button>

    <mat-radio-button id="required-radio" required name="acceptsTerms">
      Accept terms of conditions
    </mat-radio-button>
  `
})
class MultipleRadioButtonsHarnessTest {
  values = ['opt1', 'opt2', 'opt3'];
  disableAll = false;
}
