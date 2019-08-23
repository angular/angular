import {HarnessLoader} from '@angular/cdk-experimental/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk-experimental/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

import {MatInputHarness} from './input-harness';

let fixture: ComponentFixture<InputHarnessTest>;
let loader: HarnessLoader;
let inputHarness: typeof MatInputHarness;

describe('MatInputHarness', () => {
  describe('non-MDC-based', () => {
    beforeEach(async () => {
      await TestBed
          .configureTestingModule({
            imports: [NoopAnimationsModule, MatInputModule, ReactiveFormsModule],
            declarations: [InputHarnessTest],
          })
          .compileComponents();

      fixture = TestBed.createComponent(InputHarnessTest);
      fixture.detectChanges();
      loader = TestbedHarnessEnvironment.loader(fixture);
      inputHarness = MatInputHarness;
    });

    runTests();
  });

  describe(
      'MDC-based',
      () => {
          // TODO: run tests for MDC based input once implemented.
      });
});

/** Shared tests to run on both the original and MDC-based input's. */
function runTests() {
  it('should load all input harnesses', async () => {
    const inputs = await loader.getAllHarnesses(inputHarness);
    expect(inputs.length).toBe(3);
  });

  it('should load input with specific id', async () => {
    const inputs = await loader.getAllHarnesses(inputHarness.with({id: 'myTextarea'}));
    expect(inputs.length).toBe(1);
  });

  it('should load input with specific name', async () => {
    const inputs = await loader.getAllHarnesses(inputHarness.with({name: 'favorite-food'}));
    expect(inputs.length).toBe(1);
  });

  it('should load input with specific value', async () => {
    const inputs = await loader.getAllHarnesses(inputHarness.with({value: 'Sushi'}));
    expect(inputs.length).toBe(1);
  });

  it('should be able to get id of input', async () => {
    const inputs = await loader.getAllHarnesses(inputHarness);
    expect(inputs.length).toBe(3);
    expect(await inputs[0].getId()).toMatch(/mat-input-\d+/);
    expect(await inputs[1].getId()).toMatch(/mat-input-\d+/);
    expect(await inputs[2].getId()).toBe('myTextarea');
  });

  it('should be able to get name of input', async () => {
    const inputs = await loader.getAllHarnesses(inputHarness);
    expect(inputs.length).toBe(3);
    expect(await inputs[0].getName()).toBe('favorite-food');
    expect(await inputs[1].getName()).toBe('');
    expect(await inputs[2].getName()).toBe('');
  });

  it('should be able to get value of input', async () => {
    const inputs = await loader.getAllHarnesses(inputHarness);
    expect(inputs.length).toBe(3);
    expect(await inputs[0].getValue()).toBe('Sushi');
    expect(await inputs[1].getValue()).toBe('');
    expect(await inputs[2].getValue()).toBe('');
  });

  it('should be able to set value of input', async () => {
    const inputs = await loader.getAllHarnesses(inputHarness);
    expect(inputs.length).toBe(3);
    expect(await inputs[0].getValue()).toBe('Sushi');
    expect(await inputs[1].getValue()).toBe('');

    await inputs[0].setValue('');
    await inputs[2].setValue('new-value');

    expect(await inputs[0].getValue()).toBe('');
    expect(await inputs[2].getValue()).toBe('new-value');
  });

  it('should be able to get disabled state', async () => {
    const inputs = await loader.getAllHarnesses(inputHarness);
    expect(inputs.length).toBe(3);

    expect(await inputs[0].isDisabled()).toBe(false);
    expect(await inputs[1].isDisabled()).toBe(false);
    expect(await inputs[2].isDisabled()).toBe(false);

    fixture.componentInstance.disabled = true;

    expect(await inputs[1].isDisabled()).toBe(true);
  });

  it('should be able to get readonly state', async () => {
    const inputs = await loader.getAllHarnesses(inputHarness);
    expect(inputs.length).toBe(3);

    expect(await inputs[0].isReadonly()).toBe(false);
    expect(await inputs[1].isReadonly()).toBe(false);
    expect(await inputs[2].isReadonly()).toBe(false);

    fixture.componentInstance.readonly = true;

    expect(await inputs[1].isReadonly()).toBe(true);
  });

  it('should be able to get required state', async () => {
    const inputs = await loader.getAllHarnesses(inputHarness);
    expect(inputs.length).toBe(3);

    expect(await inputs[0].isRequired()).toBe(false);
    expect(await inputs[1].isRequired()).toBe(false);
    expect(await inputs[2].isRequired()).toBe(false);

    fixture.componentInstance.required = true;

    expect(await inputs[1].isRequired()).toBe(true);
  });

  it('should be able to get placeholder of input', async () => {
    const inputs = await loader.getAllHarnesses(inputHarness);
    expect(inputs.length).toBe(3);
    expect(await inputs[0].getPlaceholder()).toBe('Favorite food');
    expect(await inputs[1].getPlaceholder()).toBe('');
    expect(await inputs[2].getPlaceholder()).toBe('Leave a comment');
  });

  it('should be able to get type of input', async () => {
    const inputs = await loader.getAllHarnesses(inputHarness);
    expect(inputs.length).toBe(3);
    expect(await inputs[0].getType()).toBe('text');
    expect(await inputs[1].getType()).toBe('number');
    expect(await inputs[2].getType()).toBe('textarea');

    fixture.componentInstance.inputType = 'text';

    expect(await inputs[1].getType()).toBe('text');
  });

  it('should be able to focus input', async () => {
    const input = await loader.getHarness(inputHarness.with({name: 'favorite-food'}));
    expect(getActiveElementTagName()).not.toBe('input');
    await input.focus();
    expect(getActiveElementTagName()).toBe('input');
  });

  it('should be able to blur input', async () => {
    const input = await loader.getHarness(inputHarness.with({name: 'favorite-food'}));
    expect(getActiveElementTagName()).not.toBe('input');
    await input.focus();
    expect(getActiveElementTagName()).toBe('input');
    await input.blur();
    expect(getActiveElementTagName()).not.toBe('input');
  });
}

function getActiveElementTagName() {
  return document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
}

@Component({
  template: `
    <mat-form-field>
      <input matInput placeholder="Favorite food" value="Sushi" name="favorite-food">
    </mat-form-field>

    <mat-form-field>
      <input matInput [type]="inputType"
                      [readonly]="readonly"
                      [disabled]="disabled"
                      [required]="required">
    </mat-form-field>

    <mat-form-field>
      <textarea id="myTextarea" matInput placeholder="Leave a comment"></textarea>
    </mat-form-field>
  `
})
class InputHarnessTest {
  inputType = 'number';
  readonly = false;
  disabled = false;
  required = false;
}
