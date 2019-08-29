import {HarnessLoader} from '@angular/cdk-experimental/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk-experimental/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {MatRadioModule} from '@angular/material/radio';
import {MatRadioButtonHarness, MatRadioGroupHarness} from './radio-harness';

let fixture: ComponentFixture<MultipleRadioButtonsHarnessTest>;
let loader: HarnessLoader;
let radioButtonHarness: typeof MatRadioButtonHarness;
let radioGroupHarness: typeof MatRadioGroupHarness;

describe('standard radio harnesses', () => {
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
      radioGroupHarness = MatRadioGroupHarness;
    });

    describe('MatRadioButtonHarness', () => runRadioButtonTests());
    describe('MatRadioGroupHarness', () => runRadioGroupTests());
  });

  describe(
      'MDC-based',
      () => {
          // TODO: run tests for MDC based radio-button once implemented.
      });
});

/** Shared tests to run on both the original and MDC-based radio-group's. */
function runRadioGroupTests() {
  it('should load all radio-group harnesses', async () => {
    const groups = await loader.getAllHarnesses(radioGroupHarness);
    expect(groups.length).toBe(3);
  });

  it('should load radio-group with exact id', async () => {
    const groups = await loader.getAllHarnesses(radioGroupHarness.with({selector: '#my-group-2'}));
    expect(groups.length).toBe(1);
  });

  it('should load radio-group by name', async () => {
    let groups = await loader.getAllHarnesses(radioGroupHarness.with({name: 'my-group-2-name'}));
    expect(groups.length).toBe(1);
    expect(await groups[0].getId()).toBe('my-group-2');

    groups = await loader.getAllHarnesses(radioGroupHarness.with({name: 'my-group-1-name'}));
    expect(groups.length).toBe(1);
    expect(await groups[0].getId()).toBe('my-group-1');
  });

  it('should throw when finding radio-group with specific name that has mismatched ' +
         'radio-button names',
     async () => {
       fixture.componentInstance.thirdGroupButtonName = 'other-name';
       fixture.detectChanges();

       let errorMessage: string|null = null;
       try {
         await loader.getAllHarnesses(radioGroupHarness.with({name: 'third-group-name'}));
       } catch (e) {
         errorMessage = e.toString();
       }

       expect(errorMessage)
           .toMatch(
               /locator found a radio-group with name "third-group-name".*have mismatching names/);
     });

  it('should get name of radio-group', async () => {
    const groups = await loader.getAllHarnesses(radioGroupHarness);
    expect(groups.length).toBe(3);
    expect(await groups[0].getName()).toBe('my-group-1-name');
    expect(await groups[1].getName()).toBe('my-group-2-name');
    expect(await groups[2].getName()).toBe('third-group-name');

    fixture.componentInstance.secondGroupId = 'new-group';
    fixture.detectChanges();

    expect(await groups[1].getName()).toBe('new-group-name');

    fixture.componentInstance.thirdGroupButtonName = 'other-button-name';
    fixture.detectChanges();

    let errorMessage: string|null = null;
    try {
      await groups[2].getName();
    } catch (e) {
      errorMessage = e.toString();
    }

    expect(errorMessage).toMatch(/Radio buttons in radio-group have mismatching names./);
  });

  it('should get id of radio-group', async () => {
    const groups = await loader.getAllHarnesses(radioGroupHarness);
    expect(groups.length).toBe(3);
    expect(await groups[0].getId()).toBe('my-group-1');
    expect(await groups[1].getId()).toBe('my-group-2');
    expect(await groups[2].getId()).toBe('');

    fixture.componentInstance.secondGroupId = 'new-group-name';
    fixture.detectChanges();

    expect(await groups[1].getId()).toBe('new-group-name');
  });

  it('should get selected value of radio-group', async () => {
    const [firstGroup, secondGroup] = await loader.getAllHarnesses(radioGroupHarness);
    expect(await firstGroup.getSelectedValue()).toBe('opt2');
    expect(await secondGroup.getSelectedValue()).toBe(null);
  });

  it('should get radio-button harnesses of radio-group', async () => {
    const groups = await loader.getAllHarnesses(radioGroupHarness);
    expect(groups.length).toBe(3);

    expect((await groups[0].getRadioButtons()).length).toBe(3);
    expect((await groups[1].getRadioButtons()).length).toBe(1);
    expect((await groups[2].getRadioButtons()).length).toBe(2);
  });

  it('should get selected radio-button harnesses of radio-group', async () => {
    const groups = await loader.getAllHarnesses(radioGroupHarness);
    expect(groups.length).toBe(3);

    const groupOneSelected = await groups[0].getSelectedRadioButton();
    const groupTwoSelected = await groups[1].getSelectedRadioButton();
    const groupThreeSelected = await groups[2].getSelectedRadioButton();

    expect(groupOneSelected).not.toBeNull();
    expect(groupTwoSelected).toBeNull();
    expect(groupThreeSelected).toBeNull();
    expect(await groupOneSelected!.getId()).toBe('opt2-group-one');
  });
}

/** Shared tests to run on both the original and MDC-based radio-button's. */
function runRadioButtonTests() {
  it('should load all radio-button harnesses', async () => {
    const radios = await loader.getAllHarnesses(radioButtonHarness);
    expect(radios.length).toBe(9);
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
    const radios = await loader.getAllHarnesses(radioButtonHarness.with({selector: '#opt3'}));
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

  it('should get value', async () => {
    const [firstRadio, secondRadio, thirdRadio] = await loader.getAllHarnesses(radioButtonHarness);
    expect(await firstRadio.getValue()).toBe('opt1');
    expect(await secondRadio.getValue()).toBe('opt2');
    expect(await thirdRadio.getValue()).toBe('opt3');
  });

  it('should get disabled state', async () => {
    const [firstRadio] = await loader.getAllHarnesses(radioButtonHarness);
    expect(await firstRadio.isDisabled()).toBe(false);

    fixture.componentInstance.disableAll = true;
    fixture.detectChanges();

    expect(await firstRadio.isDisabled()).toBe(true);
  });

  it('should focus radio-button', async () => {
    const radioButton = await loader.getHarness(radioButtonHarness.with({selector: '#opt2'}));
    expect(getActiveElementTagName()).not.toBe('input');
    await radioButton.focus();
    expect(getActiveElementTagName()).toBe('input');
  });

  it('should blur radio-button', async () => {
    const radioButton = await loader.getHarness(radioButtonHarness.with({selector: '#opt2'}));
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

    const radioButton = await loader.getHarness(radioButtonHarness.with({selector: '#opt3'}));
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
    const radioButton =
        await loader.getHarness(radioButtonHarness.with({selector: '#required-radio'}));
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

    <mat-radio-group id="my-group-1" name="my-group-1-name">
      <mat-radio-button *ngFor="let value of values"
                        [checked]="value === 'opt2'"
                        [value]="value"
                        [id]="value + '-group-one'">
        {{value}}
      </mat-radio-button>
    </mat-radio-group>


    <mat-radio-group [id]="secondGroupId" [name]="secondGroupId + '-name'">
      <mat-radio-button id="required-radio" required [value]="true">
        Accept terms of conditions
      </mat-radio-button>
    </mat-radio-group>

    <mat-radio-group [name]="thirdGroupName">
      <mat-radio-button [value]="true">First</mat-radio-button>
      <mat-radio-button [value]="false" [name]="thirdGroupButtonName"></mat-radio-button>
    </mat-radio-group>
  `
})
class MultipleRadioButtonsHarnessTest {
  values = ['opt1', 'opt2', 'opt3'];
  disableAll = false;
  secondGroupId = 'my-group-2';
  thirdGroupName: string = 'third-group-name';
  thirdGroupButtonName: string|undefined = undefined;
}
