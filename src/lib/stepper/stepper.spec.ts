import {Directionality} from '@angular/cdk/bidi';
import {ENTER, LEFT_ARROW, RIGHT_ARROW, SPACE} from '@angular/cdk/keycodes';
import {dispatchKeyboardEvent} from '@angular/cdk/testing';
import {Component, DebugElement} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatStepperModule} from './index';
import {MatHorizontalStepper, MatStep, MatStepper, MatVerticalStepper} from './stepper';
import {MatStepperNext, MatStepperPrevious} from './stepper-button';

const VALID_REGEX = /valid/;

describe('MatHorizontalStepper', () => {
  let dir = 'ltr';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatStepperModule, NoopAnimationsModule, ReactiveFormsModule],
      declarations: [
        SimpleMatHorizontalStepperApp,
        LinearMatHorizontalStepperApp
      ],
      providers: [
        {provide: Directionality, useFactory: () => ({value: dir})}
      ]
    });

    TestBed.compileComponents();
  }));

  describe('basic horizontal stepper', () => {
    let fixture: ComponentFixture<SimpleMatHorizontalStepperApp>;

    beforeEach(() => {
      fixture = TestBed.createComponent(SimpleMatHorizontalStepperApp);
      fixture.detectChanges();
    });

    it('should default to the first step', () => {
      let stepperComponent = fixture.debugElement
          .query(By.css('mat-horizontal-stepper')).componentInstance;
      expect(stepperComponent.selectedIndex).toBe(0);
    });

    it('should change selected index on header click', () => {
      let stepHeaders = fixture.debugElement.queryAll(By.css('.mat-horizontal-stepper-header'));
      assertSelectionChangeOnHeaderClick(fixture, stepHeaders);
    });

    it('should set the "tablist" role on stepper', () => {
      let stepperEl = fixture.debugElement.query(By.css('mat-horizontal-stepper')).nativeElement;
      expect(stepperEl.getAttribute('role')).toBe('tablist');
    });

    it('should set aria-expanded of content correctly', () => {
      let stepContents = fixture.debugElement.queryAll(By.css(`.mat-horizontal-stepper-content`));
      assertCorrectAriaExpandedAttribute(fixture, stepContents);
    });

    it('should display the correct label', () => {
      assertCorrectStepLabel(fixture);
    });

    it('should go to next available step when the next button is clicked', () => {
      assertNextStepperButtonClick(fixture);
    });

    it('should go to previous available step when the previous button is clicked', () => {
      assertPreviousStepperButtonClick(fixture);
    });

    it('should set the correct step position for animation', () => {
      assertCorrectStepAnimationDirection(fixture);
    });

    it('should support keyboard events to move and select focus', () => {
      let stepHeaders = fixture.debugElement.queryAll(By.css('.mat-horizontal-stepper-header'));
      assertCorrectKeyboardInteraction(fixture, stepHeaders);
    });

    it('should not set focus on header of selected step if header is not clicked', () => {
      assertStepHeaderFocusNotCalled(fixture);
    });

    it('should only be able to return to a previous step if it is editable', () => {
      assertEditableStepChange(fixture);
    });

    it('should set create icon if step is editable and completed', () => {
      assertCorrectStepIcon(fixture, true, 'edit');
    });

    it('should set done icon if step is not editable and is completed', () => {
      assertCorrectStepIcon(fixture, false, 'done');
    });
  });

  describe('RTL', () => {
    let fixture: ComponentFixture<SimpleMatHorizontalStepperApp>;

    beforeEach(() => {
      dir = 'rtl';
      fixture = TestBed.createComponent(SimpleMatHorizontalStepperApp);
      fixture.detectChanges();
    });

    it('should reverse arrow key focus in RTL mode', () => {
      let stepHeaders = fixture.debugElement.queryAll(By.css('.mat-horizontal-stepper-header'));
      assertArrowKeyInteractionInRtl(fixture, stepHeaders);
    });

    it('should reverse animation in RTL mode', () => {
      assertCorrectStepAnimationDirection(fixture, 'rtl');
    });
  });

  describe('linear horizontal stepper', () => {
    let fixture: ComponentFixture<LinearMatHorizontalStepperApp>;
    let testComponent: LinearMatHorizontalStepperApp;
    let stepperComponent: MatHorizontalStepper;

    beforeEach(() => {
      fixture = TestBed.createComponent(LinearMatHorizontalStepperApp);
      fixture.detectChanges();

      testComponent = fixture.componentInstance;
      stepperComponent = fixture.debugElement
          .query(By.css('mat-horizontal-stepper')).componentInstance;
    });

    it('should have true linear attribute', () => {
      expect(stepperComponent.linear).toBe(true);
    });

    it('should not move to next step if current step is not valid', () => {
      expect(testComponent.oneGroup.get('oneCtrl')!.value).toBe('');
      expect(testComponent.oneGroup.get('oneCtrl')!.valid).toBe(false);
      expect(testComponent.oneGroup.valid).toBe(false);
      expect(stepperComponent.selectedIndex).toBe(0);

      let stepHeaderEl = fixture.debugElement
          .queryAll(By.css('.mat-horizontal-stepper-header'))[1].nativeElement;
      assertLinearStepperValidity(stepHeaderEl, testComponent, fixture);
    });

    it('should not focus step header upon click if it is not able to be selected', () => {
      assertStepHeaderBlurred(fixture);
    });

    it('should be able to move to next step even when invalid if current step is optional', () => {
      assertOptionalStepValidity(testComponent, fixture);
    });
  });
});

describe('MatVerticalStepper', () => {
  let dir = 'ltr';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatStepperModule, NoopAnimationsModule, ReactiveFormsModule],
      declarations: [
        SimpleMatVerticalStepperApp,
        LinearMatVerticalStepperApp
      ],
      providers: [
        {provide: Directionality, useFactory: () => ({value: dir})}
      ]
    });

    TestBed.compileComponents();
  }));

  describe('basic vertical stepper', () => {
    let fixture: ComponentFixture<SimpleMatVerticalStepperApp>;

    beforeEach(() => {
      fixture = TestBed.createComponent(SimpleMatVerticalStepperApp);
      fixture.detectChanges();
    });

    it('should default to the first step', () => {
      let stepperComponent = fixture.debugElement
          .query(By.css('mat-vertical-stepper')).componentInstance;
      expect(stepperComponent.selectedIndex).toBe(0);
    });

    it('should change selected index on header click', () => {
      let stepHeaders = fixture.debugElement.queryAll(By.css('.mat-vertical-stepper-header'));
      assertSelectionChangeOnHeaderClick(fixture, stepHeaders);

    });

    it('should set the "tablist" role on stepper', () => {
      let stepperEl = fixture.debugElement.query(By.css('mat-vertical-stepper')).nativeElement;
      expect(stepperEl.getAttribute('role')).toBe('tablist');
    });

    it('should set aria-expanded of content correctly', () => {
      let stepContents = fixture.debugElement.queryAll(By.css(`.mat-vertical-stepper-content`));
      assertCorrectAriaExpandedAttribute(fixture, stepContents);
    });

    it('should display the correct label', () => {
      assertCorrectStepLabel(fixture);
    });

    it('should go to next available step when the next button is clicked', () => {
      assertNextStepperButtonClick(fixture);
    });

    it('should go to previous available step when the previous button is clicked', () => {
      assertPreviousStepperButtonClick(fixture);
    });

    it('should set the correct step position for animation', () => {
      assertCorrectStepAnimationDirection(fixture);
    });

    it('should support keyboard events to move and select focus', () => {
      let stepHeaders = fixture.debugElement.queryAll(By.css('.mat-vertical-stepper-header'));
      assertCorrectKeyboardInteraction(fixture, stepHeaders);
    });

    it('should not set focus on header of selected step if header is not clicked', () => {
      assertStepHeaderFocusNotCalled(fixture);
    });

    it('should only be able to return to a previous step if it is editable', () => {
      assertEditableStepChange(fixture);
    });

    it('should set create icon if step is editable and completed', () => {
      assertCorrectStepIcon(fixture, true, 'edit');
    });

    it('should set done icon if step is not editable and is completed', () => {
      assertCorrectStepIcon(fixture, false, 'done');
    });
  });

  describe('RTL', () => {
    let fixture: ComponentFixture<SimpleMatVerticalStepperApp>;

    beforeEach(() => {
      dir = 'rtl';
      fixture = TestBed.createComponent(SimpleMatVerticalStepperApp);
      fixture.detectChanges();
    });

    it('should reverse arrow key focus in RTL mode', () => {
      let stepHeaders = fixture.debugElement.queryAll(By.css('.mat-vertical-stepper-header'));
      assertArrowKeyInteractionInRtl(fixture, stepHeaders);
    });

    it('should reverse animation in RTL mode', () => {
      assertCorrectStepAnimationDirection(fixture, 'rtl');
    });
  });

  describe('linear vertical stepper', () => {
    let fixture: ComponentFixture<LinearMatVerticalStepperApp>;
    let testComponent: LinearMatVerticalStepperApp;
    let stepperComponent: MatVerticalStepper;

    beforeEach(() => {
      fixture = TestBed.createComponent(LinearMatVerticalStepperApp);
      fixture.detectChanges();

      testComponent = fixture.componentInstance;
      stepperComponent = fixture.debugElement
          .query(By.css('mat-vertical-stepper')).componentInstance;
    });

    it('should have true linear attribute', () => {
      expect(stepperComponent.linear).toBe(true);
    });

    it('should not move to next step if current step is not valid', () => {
      expect(testComponent.oneGroup.get('oneCtrl')!.value).toBe('');
      expect(testComponent.oneGroup.get('oneCtrl')!.valid).toBe(false);
      expect(testComponent.oneGroup.valid).toBe(false);
      expect(stepperComponent.selectedIndex).toBe(0);

      let stepHeaderEl = fixture.debugElement
          .queryAll(By.css('.mat-vertical-stepper-header'))[1].nativeElement;

      assertLinearStepperValidity(stepHeaderEl, testComponent, fixture);
    });

    it('should not focus step header upon click if it is not able to be selected', () => {
      assertStepHeaderBlurred(fixture);
    });

    it('should be able to move to next step even when invalid if current step is optional', () => {
      assertOptionalStepValidity(testComponent, fixture);
    });
  });
});

/** Asserts that `selectedIndex` updates correctly when header of another step is clicked. */
function assertSelectionChangeOnHeaderClick(fixture: ComponentFixture<any>,
                                            stepHeaders: DebugElement[]) {
  let stepperComponent = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;

  expect(stepperComponent.selectedIndex).toBe(0);
  expect(stepperComponent.selected instanceof MatStep).toBe(true);

  // select the second step
  let stepHeaderEl = stepHeaders[1].nativeElement;
  stepHeaderEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(1);
  expect(stepperComponent.selected instanceof MatStep).toBe(true);

  // select the third step
  stepHeaderEl = stepHeaders[2].nativeElement;
  stepHeaderEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(2);
  expect(stepperComponent.selected instanceof MatStep).toBe(true);
}

/** Asserts that 'aria-expanded' attribute is correct for expanded content of step. */
function assertCorrectAriaExpandedAttribute(fixture: ComponentFixture<any>,
                                            stepContents: DebugElement[]) {
  let stepperComponent = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;
  let firstStepContentEl = stepContents[0].nativeElement;
  expect(firstStepContentEl.getAttribute('aria-expanded')).toBe('true');

  stepperComponent.selectedIndex = 1;
  fixture.detectChanges();

  expect(firstStepContentEl.getAttribute('aria-expanded')).toBe('false');
  let secondStepContentEl = stepContents[1].nativeElement;
  expect(secondStepContentEl.getAttribute('aria-expanded')).toBe('true');
}

/** Asserts that step has correct label. */
function assertCorrectStepLabel(fixture: ComponentFixture<any>) {
  let stepperComponent = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;
  let selectedLabel = fixture.nativeElement.querySelector('[aria-selected="true"]');
  expect(selectedLabel.textContent).toMatch('Step 1');

  stepperComponent.selectedIndex = 2;
  fixture.detectChanges();

  selectedLabel = fixture.nativeElement.querySelector('[aria-selected="true"]');
  expect(selectedLabel.textContent).toMatch('Step 3');

  fixture.componentInstance.inputLabel = 'New Label';
  fixture.detectChanges();

  selectedLabel = fixture.nativeElement.querySelector('[aria-selected="true"]');
  expect(selectedLabel.textContent).toMatch('New Label');
}

/** Asserts that clicking on MatStepperNext button updates `selectedIndex` correctly. */
function assertNextStepperButtonClick(fixture: ComponentFixture<any>) {
  let stepperComponent = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;

  expect(stepperComponent.selectedIndex).toBe(0);

  let nextButtonNativeEl = fixture.debugElement
      .queryAll(By.directive(MatStepperNext))[0].nativeElement;
  nextButtonNativeEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(1);

  nextButtonNativeEl = fixture.debugElement
      .queryAll(By.directive(MatStepperNext))[1].nativeElement;
  nextButtonNativeEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(2);

  nextButtonNativeEl = fixture.debugElement
      .queryAll(By.directive(MatStepperNext))[2].nativeElement;
  nextButtonNativeEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(2);
}

/** Asserts that clicking on MatStepperPrevious button updates `selectedIndex` correctly. */
function assertPreviousStepperButtonClick(fixture: ComponentFixture<any>) {
  let stepperComponent = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;

  expect(stepperComponent.selectedIndex).toBe(0);

  stepperComponent.selectedIndex = 2;
  let previousButtonNativeEl = fixture.debugElement
      .queryAll(By.directive(MatStepperPrevious))[2].nativeElement;
  previousButtonNativeEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(1);

  previousButtonNativeEl = fixture.debugElement
      .queryAll(By.directive(MatStepperPrevious))[1].nativeElement;
  previousButtonNativeEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(0);

  previousButtonNativeEl = fixture.debugElement
      .queryAll(By.directive(MatStepperPrevious))[0].nativeElement;
  previousButtonNativeEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(0);
}

/** Asserts that step position is correct for animation. */
function assertCorrectStepAnimationDirection(fixture: ComponentFixture<any>, rtl?: 'rtl') {
  let stepperComponent = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;

  expect(stepperComponent._getAnimationDirection(0)).toBe('current');
  if (rtl === 'rtl') {
    expect(stepperComponent._getAnimationDirection(1)).toBe('previous');
    expect(stepperComponent._getAnimationDirection(2)).toBe('previous');
  } else {
    expect(stepperComponent._getAnimationDirection(1)).toBe('next');
    expect(stepperComponent._getAnimationDirection(2)).toBe('next');
  }

  stepperComponent.selectedIndex = 1;
  fixture.detectChanges();

  if (rtl === 'rtl') {
    expect(stepperComponent._getAnimationDirection(0)).toBe('next');
    expect(stepperComponent._getAnimationDirection(2)).toBe('previous');
  } else {
    expect(stepperComponent._getAnimationDirection(0)).toBe('previous');
    expect(stepperComponent._getAnimationDirection(2)).toBe('next');
  }
  expect(stepperComponent._getAnimationDirection(1)).toBe('current');

  stepperComponent.selectedIndex = 2;
  fixture.detectChanges();

  if (rtl === 'rtl') {
    expect(stepperComponent._getAnimationDirection(0)).toBe('next');
    expect(stepperComponent._getAnimationDirection(1)).toBe('next');
  } else {
    expect(stepperComponent._getAnimationDirection(0)).toBe('previous');
    expect(stepperComponent._getAnimationDirection(1)).toBe('previous');
  }
  expect(stepperComponent._getAnimationDirection(2)).toBe('current');
}

/** Asserts that keyboard interaction works correctly. */
function assertCorrectKeyboardInteraction(fixture: ComponentFixture<any>,
                                          stepHeaders: DebugElement[]) {
  let stepperComponent = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;

  expect(stepperComponent._focusIndex).toBe(0);
  expect(stepperComponent.selectedIndex).toBe(0);

  let stepHeaderEl = stepHeaders[0].nativeElement;
  dispatchKeyboardEvent(stepHeaderEl, 'keydown', RIGHT_ARROW);
  fixture.detectChanges();

  expect(stepperComponent._focusIndex)
      .toBe(1, 'Expected index of focused step to increase by 1 after RIGHT_ARROW event.');
  expect(stepperComponent.selectedIndex)
      .toBe(0, 'Expected index of selected step to remain unchanged after RIGHT_ARROW event.');

  stepHeaderEl = stepHeaders[1].nativeElement;
  dispatchKeyboardEvent(stepHeaderEl, 'keydown', ENTER);
  fixture.detectChanges();

  expect(stepperComponent._focusIndex)
      .toBe(1, 'Expected index of focused step to remain unchanged after ENTER event.');
  expect(stepperComponent.selectedIndex)
      .toBe(1,
          'Expected index of selected step to change to index of focused step after ENTER event.');

  stepHeaderEl = stepHeaders[1].nativeElement;
  dispatchKeyboardEvent(stepHeaderEl, 'keydown', LEFT_ARROW);
  fixture.detectChanges();

  expect(stepperComponent._focusIndex)
      .toBe(0, 'Expected index of focused step to decrease by 1 after LEFT_ARROW event.');
  expect(stepperComponent.selectedIndex)
      .toBe(1, 'Expected index of selected step to remain unchanged after LEFT_ARROW event.');

  // When the focus is on the last step and right arrow key is pressed, the focus should cycle
  // through to the first step.
  stepperComponent._focusIndex = 2;
  stepHeaderEl = stepHeaders[2].nativeElement;
  dispatchKeyboardEvent(stepHeaderEl, 'keydown', RIGHT_ARROW);
  fixture.detectChanges();

  expect(stepperComponent._focusIndex)
      .toBe(0,
          'Expected index of focused step to cycle through to index 0 after RIGHT_ARROW event.');
  expect(stepperComponent.selectedIndex)
      .toBe(1, 'Expected index of selected step to remain unchanged after RIGHT_ARROW event.');

  stepHeaderEl = stepHeaders[0].nativeElement;
  dispatchKeyboardEvent(stepHeaderEl, 'keydown', SPACE);
  fixture.detectChanges();

  expect(stepperComponent._focusIndex)
      .toBe(0, 'Expected index of focused to remain unchanged after SPACE event.');
  expect(stepperComponent.selectedIndex)
      .toBe(0,
          'Expected index of selected step to change to index of focused step after SPACE event.');
}

/** Asserts that step selection change using stepper buttons does not focus step header. */
function assertStepHeaderFocusNotCalled(fixture: ComponentFixture<any>) {
  let stepperComponent = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;
  let stepHeaderEl = fixture.debugElement.queryAll(By.css('mat-step-header'))[1].nativeElement;
  let nextButtonNativeEl = fixture.debugElement
      .queryAll(By.directive(MatStepperNext))[0].nativeElement;
  spyOn(stepHeaderEl, 'focus');
  nextButtonNativeEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(1);
  expect(stepHeaderEl.focus).not.toHaveBeenCalled();
}

/** Asserts that arrow key direction works correctly in RTL mode. */
function assertArrowKeyInteractionInRtl(fixture: ComponentFixture<any>,
                                        stepHeaders: DebugElement[]) {
  let stepperComponent = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;

  expect(stepperComponent._focusIndex).toBe(0);

  let stepHeaderEl = stepHeaders[0].nativeElement;
  dispatchKeyboardEvent(stepHeaderEl, 'keydown', LEFT_ARROW);
  fixture.detectChanges();

  expect(stepperComponent._focusIndex).toBe(1);

  stepHeaderEl = stepHeaders[1].nativeElement;
  dispatchKeyboardEvent(stepHeaderEl, 'keydown', RIGHT_ARROW);
  fixture.detectChanges();

  expect(stepperComponent._focusIndex).toBe(0);
}

/**
 * Asserts that linear stepper does not allow step selection change if current step is not valid.
 */
function assertLinearStepperValidity(stepHeaderEl: HTMLElement,
                                     testComponent:
                                         LinearMatHorizontalStepperApp |
                                         LinearMatVerticalStepperApp,
                                     fixture: ComponentFixture<any>) {
  let stepperComponent = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;

  stepHeaderEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(0);

  let nextButtonNativeEl = fixture.debugElement
      .queryAll(By.directive(MatStepperNext))[0].nativeElement;
  nextButtonNativeEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(0);

  testComponent.oneGroup.get('oneCtrl')!.setValue('answer');
  stepHeaderEl.click();
  fixture.detectChanges();

  expect(testComponent.oneGroup.valid).toBe(true);
  expect(stepperComponent.selectedIndex).toBe(1);
}

/** Asserts that step header focus is blurred if the step cannot be selected upon header click. */
function assertStepHeaderBlurred(fixture: ComponentFixture<any>) {
  let stepHeaderEl = fixture.debugElement
      .queryAll(By.css('mat-step-header'))[1].nativeElement;
  spyOn(stepHeaderEl, 'blur');
  stepHeaderEl.click();
  fixture.detectChanges();

  expect(stepHeaderEl.blur).toHaveBeenCalled();
}

/** Asserts that it is only possible to go back to a previous step if the step is editable. */
function assertEditableStepChange(fixture: ComponentFixture<any>) {
  let stepperComponent = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;

  stepperComponent.selectedIndex = 1;
  stepperComponent._steps.toArray()[0].editable = false;
  let previousButtonNativeEl = fixture.debugElement
      .queryAll(By.directive(MatStepperPrevious))[1].nativeElement;
  previousButtonNativeEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(1);

  stepperComponent._steps.toArray()[0].editable = true;
  previousButtonNativeEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(0);
}

/**
 * Asserts that it is possible to skip an optional step in linear stepper if there is no input
 * or the input is valid.
 */
function assertOptionalStepValidity(testComponent:
                                        LinearMatHorizontalStepperApp | LinearMatVerticalStepperApp,
                                    fixture: ComponentFixture<any>) {
  let stepperComponent = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;

  testComponent.oneGroup.get('oneCtrl')!.setValue('input');
  testComponent.twoGroup.get('twoCtrl')!.setValue('input');
  stepperComponent.selectedIndex = 2;
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(2);
  expect(testComponent.threeGroup.get('threeCtrl')!.valid).toBe(true);

  let nextButtonNativeEl = fixture.debugElement
      .queryAll(By.directive(MatStepperNext))[2].nativeElement;
  nextButtonNativeEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex)
      .toBe(3, 'Expected selectedIndex to change when optional step input is empty.');

  stepperComponent.selectedIndex = 2;
  testComponent.threeGroup.get('threeCtrl')!.setValue('input');
  nextButtonNativeEl.click();
  fixture.detectChanges();

  expect(testComponent.threeGroup.get('threeCtrl')!.valid).toBe(false);
  expect(stepperComponent.selectedIndex)
      .toBe(2, 'Expected selectedIndex to remain unchanged when optional step input is invalid.');

  testComponent.threeGroup.get('threeCtrl')!.setValue('valid');
  nextButtonNativeEl.click();
  fixture.detectChanges();

  expect(testComponent.threeGroup.get('threeCtrl')!.valid).toBe(true);
  expect(stepperComponent.selectedIndex)
      .toBe(3, 'Expected selectedIndex to change when optional step input is valid.');
}

/** Asserts that step header set the correct icon depending on the state of step. */
function assertCorrectStepIcon(fixture: ComponentFixture<any>,
                               isEditable: boolean,
                               icon: String) {
  let stepperComponent = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;
  let nextButtonNativeEl = fixture.debugElement
      .queryAll(By.directive(MatStepperNext))[0].nativeElement;
  expect(stepperComponent._getIndicatorType(0)).toBe('number');
  stepperComponent._steps.toArray()[0].editable = isEditable;
  nextButtonNativeEl.click();
  fixture.detectChanges();

  expect(stepperComponent._getIndicatorType(0)).toBe(icon);
}

@Component({
  template: `
    <mat-horizontal-stepper>
      <mat-step>
        <ng-template matStepLabel>Step 1</ng-template>
        Content 1
        <div>
          <button mat-button matStepperPrevious>Back</button>
          <button mat-button matStepperNext>Next</button>
        </div>
      </mat-step>
      <mat-step>
        <ng-template matStepLabel>Step 2</ng-template>
        Content 2
        <div>
          <button mat-button matStepperPrevious>Back</button>
          <button mat-button matStepperNext>Next</button>
        </div>
      </mat-step>
      <mat-step [label]="inputLabel">
        Content 3
        <div>
          <button mat-button matStepperPrevious>Back</button>
          <button mat-button matStepperNext>Next</button>
        </div>
      </mat-step>
    </mat-horizontal-stepper>
  `
})
class SimpleMatHorizontalStepperApp {
  inputLabel = 'Step 3';
}

@Component({
  template: `
    <mat-horizontal-stepper linear>
      <mat-step [stepControl]="oneGroup">
        <form [formGroup]="oneGroup">
          <ng-template matStepLabel>Step one</ng-template>
          <mat-form-field>
            <input matInput formControlName="oneCtrl" required>
          </mat-form-field>
          <div>
            <button mat-button matStepperPrevious>Back</button>
            <button mat-button matStepperNext>Next</button>
          </div>
        </form>
      </mat-step>
      <mat-step [stepControl]="twoGroup">
        <form [formGroup]="twoGroup">
          <ng-template matStepLabel>Step two</ng-template>
          <mat-form-field>
            <input matInput formControlName="twoCtrl" required>
          </mat-form-field>
          <div>
            <button mat-button matStepperPrevious>Back</button>
            <button mat-button matStepperNext>Next</button>
          </div>
        </form>
      </mat-step>
      <mat-step [stepControl]="threeGroup" optional>
        <form [formGroup]="threeGroup">
          <ng-template matStepLabel>Step two</ng-template>
          <mat-form-field>
            <input matInput formControlName="threeCtrl">
          </mat-form-field>
          <div>
            <button mat-button matStepperPrevious>Back</button>
            <button mat-button matStepperNext>Next</button>
          </div>
        </form>
      </mat-step>
      <mat-step>
        Done
      </mat-step>
    </mat-horizontal-stepper>
  `
})
class LinearMatHorizontalStepperApp {
  oneGroup: FormGroup;
  twoGroup: FormGroup;
  threeGroup: FormGroup;

  ngOnInit() {
    this.oneGroup = new FormGroup({
      oneCtrl: new FormControl('', Validators.required)
    });
    this.twoGroup = new FormGroup({
      twoCtrl: new FormControl('', Validators.required)
    });
    this.threeGroup = new FormGroup({
      threeCtrl: new FormControl('', Validators.pattern(VALID_REGEX))
    });
  }
}

@Component({
  template: `
    <mat-vertical-stepper>
      <mat-step>
        <ng-template matStepLabel>Step 1</ng-template>
        Content 1
        <div>
          <button mat-button matStepperPrevious>Back</button>
          <button mat-button matStepperNext>Next</button>
        </div>
      </mat-step>
      <mat-step>
        <ng-template matStepLabel>Step 2</ng-template>
        Content 2
        <div>
          <button mat-button matStepperPrevious>Back</button>
          <button mat-button matStepperNext>Next</button>
        </div>
      </mat-step>
      <mat-step [label]="inputLabel">
        Content 3
        <div>
          <button mat-button matStepperPrevious>Back</button>
          <button mat-button matStepperNext>Next</button>
        </div>
      </mat-step>
    </mat-vertical-stepper>
  `
})
class SimpleMatVerticalStepperApp {
  inputLabel = 'Step 3';
}

@Component({
  template: `
    <mat-vertical-stepper linear>
      <mat-step [stepControl]="oneGroup">
        <form [formGroup]="oneGroup">
          <ng-template matStepLabel>Step one</ng-template>
          <mat-form-field>
            <input matInput formControlName="oneCtrl" required>
          </mat-form-field>
          <div>
            <button mat-button matStepperPrevious>Back</button>
            <button mat-button matStepperNext>Next</button>
          </div>
        </form>
      </mat-step>
      <mat-step [stepControl]="twoGroup">
        <form [formGroup]="twoGroup">
          <ng-template matStepLabel>Step two</ng-template>
          <mat-form-field>
            <input matInput formControlName="twoCtrl" required>
          </mat-form-field>
          <div>
            <button mat-button matStepperPrevious>Back</button>
            <button mat-button matStepperNext>Next</button>
          </div>
        </form>
      </mat-step>
      <mat-step [stepControl]="threeGroup" optional>
        <form [formGroup]="threeGroup">
          <ng-template matStepLabel>Step two</ng-template>
          <mat-form-field>
            <input matInput formControlName="threeCtrl">
          </mat-form-field>
          <div>
            <button mat-button matStepperPrevious>Back</button>
            <button mat-button matStepperNext>Next</button>
          </div>
        </form>
      </mat-step>
      <mat-step>
        Done
      </mat-step>
    </mat-vertical-stepper>
  `
})
class LinearMatVerticalStepperApp {
  oneGroup: FormGroup;
  twoGroup: FormGroup;
  threeGroup: FormGroup;

  ngOnInit() {
    this.oneGroup = new FormGroup({
      oneCtrl: new FormControl('', Validators.required)
    });
    this.twoGroup = new FormGroup({
      twoCtrl: new FormControl('', Validators.required)
    });
    this.threeGroup = new FormGroup({
      threeCtrl: new FormControl('', Validators.pattern(VALID_REGEX))
    });
  }
}
