import {Component} from '@angular/core';
import {
  ReactiveFormsModule,
  UntypedFormGroup,
  UntypedFormControl,
  Validators,
} from '@angular/forms';
import {HarnessLoader, parallel} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatStepperModule} from '@angular/material/stepper';
import {STEPPER_GLOBAL_OPTIONS} from '@angular/cdk/stepper';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatStepperHarness} from './stepper-harness';
import {MatStepperNextHarness, MatStepperPreviousHarness} from './stepper-button-harnesses';
import {StepperOrientation} from './step-harness-filters';

/** Shared tests to run on both the original and MDC-based steppers. */
export function runHarnessTests(
  stepperModule: typeof MatStepperModule,
  stepperHarness: typeof MatStepperHarness,
  stepperNextHarness: typeof MatStepperNextHarness,
  stepperPreviousHarness: typeof MatStepperPreviousHarness,
) {
  let fixture: ComponentFixture<StepperHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [stepperModule, NoopAnimationsModule, ReactiveFormsModule],
      declarations: [StepperHarnessTest],
      providers: [
        {
          provide: STEPPER_GLOBAL_OPTIONS,
          useValue: {showError: true}, // Required so the error state shows up in tests.
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StepperHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all stepper harnesses', async () => {
    const steppers = await loader.getAllHarnesses(stepperHarness);
    expect(steppers.length).toBe(3);
  });

  it('should filter steppers by their orientation', async () => {
    const [verticalSteppers, horizontalSteppers] = await parallel(() => [
      loader.getAllHarnesses(stepperHarness.with({orientation: StepperOrientation.VERTICAL})),
      loader.getAllHarnesses(stepperHarness.with({orientation: StepperOrientation.HORIZONTAL})),
    ]);

    expect(verticalSteppers.length).toBe(2);
    expect(horizontalSteppers.length).toBe(1);
  });

  it('should get the orientation of a stepper', async () => {
    const steppers = await loader.getAllHarnesses(stepperHarness);

    expect(await parallel(() => steppers.map(stepper => stepper.getOrientation()))).toEqual([
      StepperOrientation.VERTICAL,
      StepperOrientation.HORIZONTAL,
      StepperOrientation.VERTICAL,
    ]);
  });

  it('should get the steps of a stepper', async () => {
    const steppers = await loader.getAllHarnesses(stepperHarness);
    const steps = await parallel(() => steppers.map(stepper => stepper.getSteps()));
    expect(steps.map(current => current.length)).toEqual([4, 3, 2]);
  });

  it('should filter the steps of a stepper', async () => {
    const stepper = await loader.getHarness(stepperHarness.with({selector: '#one-stepper'}));
    const steps = await stepper.getSteps({label: /Two|Four/});
    expect(await parallel(() => steps.map(step => step.getLabel()))).toEqual(['Two', 'Four']);
  });

  it('should be able to select a particular step that matches a filter', async () => {
    const stepper = await loader.getHarness(stepperHarness.with({selector: '#one-stepper'}));
    const steps = await stepper.getSteps();

    expect(await parallel(() => steps.map(step => step.isSelected()))).toEqual([
      true,
      false,
      false,
      false,
    ]);

    await stepper.selectStep({label: 'Three'});

    expect(await parallel(() => steps.map(step => step.isSelected()))).toEqual([
      false,
      false,
      true,
      false,
    ]);
  });

  it('should be able to get the text-based label of a step', async () => {
    const stepper = await loader.getHarness(stepperHarness.with({selector: '#one-stepper'}));
    const steps = await stepper.getSteps();

    expect(await parallel(() => steps.map(step => step.getLabel()))).toEqual([
      'One',
      'Two',
      'Three',
      'Four',
    ]);
  });

  it('should be able to get the template-based label of a step', async () => {
    const stepper = await loader.getHarness(stepperHarness.with({selector: '#two-stepper'}));
    const steps = await stepper.getSteps();
    expect(
      await parallel(() => {
        return steps.map(step => step.getLabel());
      }),
    ).toEqual(['One', 'Two', 'Three']);
  });

  it('should be able to get the aria-label of a step', async () => {
    const stepper = await loader.getHarness(stepperHarness.with({selector: '#one-stepper'}));
    const steps = await stepper.getSteps();
    expect(await parallel(() => steps.map(step => step.getAriaLabel()))).toEqual([
      null,
      null,
      null,
      'Fourth step',
    ]);
  });

  it('should be able to get the aria-labelledby of a step', async () => {
    const stepper = await loader.getHarness(stepperHarness.with({selector: '#one-stepper'}));
    const steps = await stepper.getSteps();
    expect(await parallel(() => steps.map(step => step.getAriaLabelledby()))).toEqual([
      null,
      null,
      'some-label',
      null,
    ]);
  });

  it('should get the selected state of a step', async () => {
    const stepper = await loader.getHarness(stepperHarness.with({selector: '#one-stepper'}));
    const steps = await stepper.getSteps();

    expect(await parallel(() => steps.map(step => step.isSelected()))).toEqual([
      true,
      false,
      false,
      false,
    ]);
  });

  it('should be able to select a step', async () => {
    const stepper = await loader.getHarness(stepperHarness.with({selector: '#one-stepper'}));
    const steps = await stepper.getSteps();

    expect(await parallel(() => steps.map(step => step.isSelected()))).toEqual([
      true,
      false,
      false,
      false,
    ]);

    await steps[2].select();

    expect(await parallel(() => steps.map(step => step.isSelected()))).toEqual([
      false,
      false,
      true,
      false,
    ]);
  });

  it('should get whether a step is optional', async () => {
    const stepper = await loader.getHarness(stepperHarness.with({selector: '#two-stepper'}));
    const steps = await stepper.getSteps();
    expect(await parallel(() => steps.map(step => step.isOptional()))).toEqual([false, true, true]);
  });

  it('should be able to get harness loader for an element inside a tab', async () => {
    const stepper = await loader.getHarness(stepperHarness.with({selector: '#one-stepper'}));
    const [step] = await stepper.getSteps({label: 'Two'});
    const [nextButton, previousButton] = await parallel(() => [
      step.getHarness(stepperNextHarness),
      step.getHarness(stepperPreviousHarness),
    ]);

    expect(await nextButton.getText()).toBe('Next');
    expect(await previousButton.getText()).toBe('Previous');
  });

  it('should go forward when pressing the next button', async () => {
    const stepper = await loader.getHarness(stepperHarness.with({selector: '#one-stepper'}));
    const steps = await stepper.getSteps();
    const secondStep = steps[1];
    const nextButton = await secondStep.getHarness(stepperNextHarness);

    await secondStep.select();

    expect(await parallel(() => steps.map(step => step.isSelected()))).toEqual([
      false,
      true,
      false,
      false,
    ]);

    await nextButton.click();

    expect(await parallel(() => steps.map(step => step.isSelected()))).toEqual([
      false,
      false,
      true,
      false,
    ]);
  });

  it('should go backward when pressing the previous button', async () => {
    const stepper = await loader.getHarness(stepperHarness.with({selector: '#one-stepper'}));
    const steps = await stepper.getSteps();
    const secondStep = steps[1];
    const previousButton = await secondStep.getHarness(stepperPreviousHarness);

    await secondStep.select();

    expect(await parallel(() => steps.map(step => step.isSelected()))).toEqual([
      false,
      true,
      false,
      false,
    ]);

    await previousButton.click();

    expect(await parallel(() => steps.map(step => step.isSelected()))).toEqual([
      true,
      false,
      false,
      false,
    ]);
  });

  it('should get whether a step has errors', async () => {
    const stepper = await loader.getHarness(stepperHarness.with({selector: '#three-stepper'}));
    const steps = await stepper.getSteps();

    expect(await parallel(() => steps.map(step => step.hasErrors()))).toEqual([false, false]);

    await steps[1].select();

    expect(await parallel(() => steps.map(step => step.hasErrors()))).toEqual([true, false]);
  });

  it('should get whether a step has been completed', async () => {
    const stepper = await loader.getHarness(stepperHarness.with({selector: '#three-stepper'}));
    const steps = await stepper.getSteps();

    expect(await parallel(() => steps.map(step => step.isCompleted()))).toEqual([false, false]);

    fixture.componentInstance.oneGroup.setValue({oneCtrl: 'done'});
    await steps[1].select();

    expect(await parallel(() => steps.map(step => step.isCompleted()))).toEqual([true, false]);
  });
}

@Component({
  template: `
    <mat-stepper orientation="vertical" id="one-stepper">
      <mat-step label="One">
        <button matStepperNext>Next</button>
      </mat-step>
      <mat-step label="Two">
        <button matStepperPrevious>Previous</button>
        <button matStepperNext>Next</button>
      </mat-step>
      <mat-step label="Three" aria-labelledby="some-label">
        <button matStepperPrevious>Previous</button>
        <button matStepperNext>Next</button>
      </mat-step>
      <mat-step label="Four" aria-label="Fourth step">
        <button matStepperPrevious>Previous</button>
      </mat-step>
    </mat-stepper>

    <mat-stepper id="two-stepper">
      <mat-step>
        <ng-template matStepLabel>One</ng-template>
      </mat-step>
      <mat-step optional>
        <ng-template matStepLabel>Two</ng-template>
      </mat-step>
      <mat-step optional>
        <ng-template matStepLabel>Three</ng-template>
      </mat-step>
    </mat-stepper>

    <mat-stepper orientation="vertical" id="three-stepper">
      <mat-step [stepControl]="oneGroup" label="One">
        <form [formGroup]="oneGroup">
          <input formControlName="oneCtrl" required>
        </form>
      </mat-step>
      <mat-step [stepControl]="twoGroup" label="Two">
        <form [formGroup]="twoGroup">
          <input formControlName="twoCtrl" required>
        </form>
      </mat-step>
    </mat-stepper>
  `,
})
class StepperHarnessTest {
  oneGroup = new UntypedFormGroup({
    oneCtrl: new UntypedFormControl('', Validators.required),
  });

  twoGroup = new UntypedFormGroup({
    twoCtrl: new UntypedFormControl('', Validators.required),
  });
}
