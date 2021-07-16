import {TestBed, ComponentFixture} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatStepperHarness, MatStepperNextHarness} from '@angular/material/stepper/testing';
import {HarnessLoader, parallel} from '@angular/cdk/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import {MatStepperModule} from '@angular/material/stepper';
import {StepperHarnessExample} from './stepper-harness-example';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {ReactiveFormsModule} from '@angular/forms';

describe('StepperHarnessExample', () => {
  let fixture: ComponentFixture<StepperHarnessExample>;
  let loader: HarnessLoader;

  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
      teardown: {destroyAfterEach: true}
    });
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatStepperModule, NoopAnimationsModule, ReactiveFormsModule],
      declarations: [StepperHarnessExample],
    }).compileComponents();
    fixture = TestBed.createComponent(StepperHarnessExample);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all stepper harnesses', async () => {
    const steppers = await loader.getAllHarnesses(MatStepperHarness);
    expect(steppers.length).toBe(1);
  });

  it('should get the steps of a stepper', async () => {
    const stepper = await loader.getHarness(MatStepperHarness);
    const steps = await stepper.getSteps();
    expect(steps.length).toEqual(3);
  });

  it('should be able to get the template-based label of a step', async () => {
    const stepper = await loader.getHarness(MatStepperHarness);
    const steps = await stepper.getSteps();
    expect(await parallel(() => {
      return steps.map(step => step.getLabel());
    })).toEqual(['One', 'Two', 'Three']);
  });

  it('should go forward when pressing the next button', async () => {
    const stepper = await loader.getHarness(MatStepperHarness);
    const steps = await stepper.getSteps();
    const secondStep = steps[1];
    const nextButton = await secondStep.getHarness(MatStepperNextHarness);

    await secondStep.select();

    expect(await parallel(() => steps.map(step => step.isSelected()))).toEqual([
      false,
      true,
      false
    ]);

    await nextButton.click();

    expect(await parallel(() => steps.map(step => step.isSelected()))).toEqual([
      false,
      false,
      true
    ]);
  });
});
