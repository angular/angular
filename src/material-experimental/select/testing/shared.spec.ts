import {OverlayContainer} from '@angular/cdk/overlay';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, inject, TestBed} from '@angular/core/testing';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatSelectHarness} from './select-harness';

/** Shared tests to run on both the original and MDC-based select. */
export function runHarnessTests(
    selectModule: typeof MatSelectModule, selectHarness: typeof MatSelectHarness) {
  let fixture: ComponentFixture<SelectHarnessTest>;
  let loader: HarnessLoader;
  let overlayContainer: OverlayContainer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        selectModule,
        MatFormFieldModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
      ],
      declarations: [SelectHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
    inject([OverlayContainer], (oc: OverlayContainer) => {
      overlayContainer = oc;
    })();
  });

  afterEach(() => {
    // Angular won't call this for us so we need to do it ourselves to avoid leaks.
    overlayContainer.ngOnDestroy();
    overlayContainer = null!;
  });

  it('should load all select harnesses', async () => {
    const selects = await loader.getAllHarnesses(selectHarness);
    expect(selects.length).toBe(4);
  });

  it('should be able to check whether a select is in multi-selection mode', async () => {
    const singleSelection = await loader.getHarness(selectHarness.with({selector: '#single-selection'}));
    const multipleSelection =
        await loader.getHarness(selectHarness.with({selector: '#multiple-selection'}));

    expect(await singleSelection.isMultiple()).toBe(false);
    expect(await multipleSelection.isMultiple()).toBe(true);
  });

  it('should get disabled state', async () => {
    const singleSelection = await loader.getHarness(selectHarness.with({selector: '#single-selection'}));
    const multipleSelection =
        await loader.getHarness(selectHarness.with({selector: '#multiple-selection'}));

    expect(await singleSelection.isDisabled()).toBe(false);
    expect(await multipleSelection.isDisabled()).toBe(false);

    fixture.componentInstance.isDisabled = true;
    fixture.detectChanges();

    expect(await singleSelection.isDisabled()).toBe(true);
    expect(await multipleSelection.isDisabled()).toBe(false);
  });

  it('should get required state', async () => {
    const singleSelection = await loader.getHarness(selectHarness.with({selector: '#single-selection'}));
    const multipleSelection =
        await loader.getHarness(selectHarness.with({selector: '#multiple-selection'}));

    expect(await singleSelection.isRequired()).toBe(false);
    expect(await multipleSelection.isRequired()).toBe(false);

    fixture.componentInstance.isRequired = true;
    fixture.detectChanges();

    expect(await singleSelection.isRequired()).toBe(true);
    expect(await multipleSelection.isRequired()).toBe(false);
  });

  it('should get valid state', async () => {
    const singleSelection = await loader.getHarness(selectHarness.with({selector: '#single-selection'}));
    const withFormControl = await loader.getHarness(selectHarness.with({selector: '#with-form-control'}));

    expect(await singleSelection.isValid()).toBe(true);
    expect(await withFormControl.isValid()).toBe(false);
  });

  it('should focus and blur a select', async () => {
    const select = await loader.getHarness(selectHarness.with({selector: '#single-selection'}));
    expect(getActiveElementId()).not.toBe('single-selection');
    await select.focus();
    expect(getActiveElementId()).toBe('single-selection');
    await select.blur();
    expect(getActiveElementId()).not.toBe('single-selection');
  });

  it('should be able to open and close a single-selection select', async () => {
    const select = await loader.getHarness(selectHarness.with({selector: '#single-selection'}));

    expect(await select.isOpen()).toBe(false);

    await select.open();
    expect(await select.isOpen()).toBe(true);

    await select.close();
    expect(await select.isOpen()).toBe(false);
  });

  it('should be able to open and close a multi-selection select', async () => {
    const select = await loader.getHarness(selectHarness.with({selector: '#multiple-selection'}));

    expect(await select.isOpen()).toBe(false);

    await select.open();
    expect(await select.isOpen()).toBe(true);

    await select.close();
    expect(await select.isOpen()).toBe(false);
  });

  it('should be able to get the select panel', async () => {
    const select = await loader.getHarness(selectHarness.with({selector: '#single-selection'}));
    await select.open();
    expect(await select.getPanel()).toBeTruthy();
  });

  it('should be able to get the select options', async () => {
    const select = await loader.getHarness(selectHarness.with({selector: '#single-selection'}));
    await select.open();
    const options = await select.getOptions();

    expect(options.length).toBe(11);
    expect(await options[5].text()).toBe('New York');
  });

  it('should be able to get the select panel groups', async () => {
    const select = await loader.getHarness(selectHarness.with({selector: '#grouped'}));
    await select.open();
    const groups = await select.getOptionGroups();
    const options = await select.getOptions();

    expect(groups.length).toBe(3);
    expect(options.length).toBe(11);
  });

  it('should be able to get the value text from a single-selection select', async () => {
    const select = await loader.getHarness(selectHarness.with({selector: '#single-selection'}));
    await select.open();
    const options = await select.getOptions();

    await options[3].click();

    expect(await select.getValueText()).toBe('Kansas');
  });

  it('should be able to get the value text from a multi-selection select', async () => {
    const select = await loader.getHarness(selectHarness.with({selector: '#multiple-selection'}));
    await select.open();
    const options = await select.getOptions();

    await options[3].click();
    await options[5].click();

    expect(await select.getValueText()).toBe('Kansas, New York');
  });

  it('should be able to get whether a single-selection select is empty', async () => {
    const select = await loader.getHarness(selectHarness.with({selector: '#single-selection'}));

    expect(await select.isEmpty()).toBe(true);

    await select.open();
    const options = await select.getOptions();
    await options[3].click();

    expect(await select.isEmpty()).toBe(false);
  });

  it('should be able to get whether a multi-selection select is empty', async () => {
    const select = await loader.getHarness(selectHarness.with({selector: '#multiple-selection'}));

    expect(await select.isEmpty()).toBe(true);

    await select.open();
    const options = await select.getOptions();
    await options[3].click();
    await options[5].click();

    expect(await select.isEmpty()).toBe(false);
  });

  it('should be able to click an option', async () => {
    const control = fixture.componentInstance.formControl;
    const select = await loader.getHarness(selectHarness.with({selector: '#with-form-control'}));

    expect(control.value).toBeFalsy();

    await select.open();
    await (await select.getOptions())[1].click();

    expect(control.value).toBe('CA');
  });

}

function getActiveElementId() {
  return document.activeElement ? document.activeElement.id : '';
}

@Component({
  template: `
    <mat-form-field>
      <mat-select [disabled]="isDisabled" [required]="isRequired" id="single-selection">
        <mat-option *ngFor="let state of states" [value]="state.code">{{ state.name }}</mat-option>
      </mat-select>
    </mat-form-field>

    <mat-form-field>
      <mat-select multiple id="multiple-selection">
        <mat-option *ngFor="let state of states" [value]="state.code">{{ state.name }}</mat-option>
      </mat-select>
    </mat-form-field>

    <mat-form-field>
      <mat-select id="grouped">
        <mat-optgroup *ngFor="let group of stateGroups" [label]="group.name">
          <mat-option
            *ngFor="let state of group.states"
            [value]="state.code">{{ state.name }}</mat-option>
        </mat-optgroup>
      </mat-select>
    </mat-form-field>

    <mat-form-field>
      <mat-select [formControl]="formControl" id="with-form-control">
        <mat-option *ngFor="let state of states" [value]="state.code">{{ state.name }}</mat-option>
      </mat-select>
    </mat-form-field>
  `
})
class SelectHarnessTest {
  formControl = new FormControl(undefined, [Validators.required]);
  isDisabled = false;
  isRequired = false;
  states = [
    {code: 'AL', name: 'Alabama'},
    {code: 'CA', name: 'California'},
    {code: 'FL', name: 'Florida'},
    {code: 'KS', name: 'Kansas'},
    {code: 'MA', name: 'Massachusetts'},
    {code: 'NY', name: 'New York'},
    {code: 'OR', name: 'Oregon'},
    {code: 'PA', name: 'Pennsylvania'},
    {code: 'TN', name: 'Tennessee'},
    {code: 'VA', name: 'Virginia'},
    {code: 'WY', name: 'Wyoming'},
  ];

  stateGroups = [
    {
      name: 'One',
      states: this.states.slice(0, 3)
    },
    {
      name: 'Two',
      states: this.states.slice(3, 7)
    },
    {
      name: 'Three',
      states: this.states.slice(7)
    }
  ];
}

