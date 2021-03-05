/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {BooleanInput} from '@angular/cdk/coercion';
import {
  CdkStep,
  CdkStepper,
  StepContentPositionState,
  STEPPER_GLOBAL_OPTIONS,
  StepperOptions
} from '@angular/cdk/stepper';
import {AnimationEvent} from '@angular/animations';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  forwardRef,
  Inject,
  Input,
  OnDestroy,
  Optional,
  Output,
  QueryList,
  SkipSelf,
  TemplateRef,
  ViewChildren,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import {FormControl, FormGroupDirective, NgForm} from '@angular/forms';
import {DOCUMENT} from '@angular/common';
import {ErrorStateMatcher, ThemePalette} from '@angular/material/core';
import {TemplatePortal} from '@angular/cdk/portal';
import {Subject, Subscription} from 'rxjs';
import {takeUntil, distinctUntilChanged, map, startWith, switchMap} from 'rxjs/operators';

import {MatStepHeader} from './step-header';
import {MatStepLabel} from './step-label';
import {matStepperAnimations} from './stepper-animations';
import {MatStepperIcon, MatStepperIconContext} from './stepper-icon';
import {MatStepContent} from './step-content';

@Component({
  selector: 'mat-step',
  templateUrl: 'step.html',
  providers: [
    {provide: ErrorStateMatcher, useExisting: MatStep},
    {provide: CdkStep, useExisting: MatStep},
  ],
  encapsulation: ViewEncapsulation.None,
  exportAs: 'matStep',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatStep extends CdkStep implements ErrorStateMatcher, AfterContentInit, OnDestroy {
  private _isSelected = Subscription.EMPTY;

  /** Content for step label given by `<ng-template matStepLabel>`. */
  @ContentChild(MatStepLabel) stepLabel: MatStepLabel;

  /** Theme color for the particular step. */
  @Input() color: ThemePalette;

  /** Content that will be rendered lazily. */
  @ContentChild(MatStepContent, {static: false}) _lazyContent: MatStepContent;

  /** Currently-attached portal containing the lazy content. */
  _portal: TemplatePortal;

  constructor(@Inject(forwardRef(() => MatStepper)) stepper: MatStepper,
              @SkipSelf() private _errorStateMatcher: ErrorStateMatcher,
              private _viewContainerRef: ViewContainerRef,
              @Optional() @Inject(STEPPER_GLOBAL_OPTIONS) stepperOptions?: StepperOptions) {
    super(stepper, stepperOptions);
  }

  ngAfterContentInit() {
    this._isSelected = this._stepper.steps.changes.pipe(switchMap(() => {
      return this._stepper.selectionChange.pipe(
        map(event => event.selectedStep === this),
        startWith(this._stepper.selected === this)
      );
    })).subscribe(isSelected => {
      if (isSelected && this._lazyContent && !this._portal) {
        this._portal = new TemplatePortal(this._lazyContent._template, this._viewContainerRef!);
      }
    });
  }

  ngOnDestroy() {
    this._isSelected.unsubscribe();
  }

  /** Custom error state matcher that additionally checks for validity of interacted form. */
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const originalErrorState = this._errorStateMatcher.isErrorState(control, form);

    // Custom error state checks for the validity of form that is not submitted or touched
    // since user can trigger a form change by calling for another step without directly
    // interacting with the current form.
    const customErrorState = !!(control && control.invalid && this.interacted);

    return originalErrorState || customErrorState;
  }
}


@Directive({selector: '[matStepper]', providers: [{provide: CdkStepper, useExisting: MatStepper}]})
export class MatStepper extends CdkStepper implements AfterContentInit {
  /** The list of step headers of the steps in the stepper. */
  @ViewChildren(MatStepHeader) _stepHeader: QueryList<MatStepHeader>;

  /** Full list of steps inside the stepper, including inside nested steppers. */
  @ContentChildren(MatStep, {descendants: true}) _steps: QueryList<MatStep>;

  /** Steps that belong to the current stepper, excluding ones from nested steppers. */
  readonly steps: QueryList<MatStep> = new QueryList<MatStep>();

  /** Custom icon overrides passed in by the consumer. */
  @ContentChildren(MatStepperIcon, {descendants: true}) _icons: QueryList<MatStepperIcon>;

  /** Event emitted when the current step is done transitioning in. */
  @Output() readonly animationDone: EventEmitter<void> = new EventEmitter<void>();

  /** Whether ripples should be disabled for the step headers. */
  @Input() disableRipple: boolean;

  /** Theme color for all of the steps in stepper. */
  @Input() color: ThemePalette;

  /** Consumer-specified template-refs to be used to override the header icons. */
  _iconOverrides: {[key: string]: TemplateRef<MatStepperIconContext>} = {};

  /** Stream of animation `done` events when the body expands/collapses. */
  _animationDone = new Subject<AnimationEvent>();

  ngAfterContentInit() {
    super.ngAfterContentInit();
    this._icons.forEach(({name, templateRef}) => this._iconOverrides[name] = templateRef);

    // Mark the component for change detection whenever the content children query changes
    this.steps.changes.pipe(takeUntil(this._destroyed)).subscribe(() => {
      this._stateChanged();
    });

    this._animationDone.pipe(
      // This needs a `distinctUntilChanged` in order to avoid emitting the same event twice due
      // to a bug in animations where the `.done` callback gets invoked twice on some browsers.
      // See https://github.com/angular/angular/issues/24084
      distinctUntilChanged((x, y) => x.fromState === y.fromState && x.toState === y.toState),
      takeUntil(this._destroyed)
    ).subscribe(event => {
      if ((event.toState as StepContentPositionState) === 'current') {
        this.animationDone.emit();
      }
    });
  }

  protected _updateOrientation() {
    if ((typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw Error('Updating the orientation of a Material stepper is not supported.');
    }
  }

  static ngAcceptInputType_editable: BooleanInput;
  static ngAcceptInputType_optional: BooleanInput;
  static ngAcceptInputType_completed: BooleanInput;
  static ngAcceptInputType_hasError: BooleanInput;
}

@Component({
  selector: 'mat-horizontal-stepper',
  exportAs: 'matHorizontalStepper',
  templateUrl: 'stepper-horizontal.html',
  styleUrls: ['stepper.css'],
  inputs: ['selectedIndex'],
  host: {
    'class': 'mat-stepper-horizontal',
    '[class.mat-stepper-label-position-end]': 'labelPosition == "end"',
    '[class.mat-stepper-label-position-bottom]': 'labelPosition == "bottom"',
    'aria-orientation': 'horizontal',
    'role': 'tablist',
  },
  animations: [matStepperAnimations.horizontalStepTransition],
  providers: [
    {provide: MatStepper, useExisting: MatHorizontalStepper},
    {provide: CdkStepper, useExisting: MatHorizontalStepper}
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatHorizontalStepper extends MatStepper {
  /** Whether the label should display in bottom or end position. */
  @Input()
  labelPosition: 'bottom' | 'end' = 'end';

  static ngAcceptInputType_editable: BooleanInput;
  static ngAcceptInputType_optional: BooleanInput;
  static ngAcceptInputType_completed: BooleanInput;
  static ngAcceptInputType_hasError: BooleanInput;
}

@Component({
  selector: 'mat-vertical-stepper',
  exportAs: 'matVerticalStepper',
  templateUrl: 'stepper-vertical.html',
  styleUrls: ['stepper.css'],
  inputs: ['selectedIndex'],
  host: {
    'class': 'mat-stepper-vertical',
    'aria-orientation': 'vertical',
    'role': 'tablist',
  },
  animations: [matStepperAnimations.verticalStepTransition],
  providers: [
    {provide: MatStepper, useExisting: MatVerticalStepper},
    {provide: CdkStepper, useExisting: MatVerticalStepper}
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatVerticalStepper extends MatStepper {
  constructor(
    @Optional() dir: Directionality,
    changeDetectorRef: ChangeDetectorRef,
    elementRef: ElementRef<HTMLElement>,
    @Inject(DOCUMENT) _document: any) {
    super(dir, changeDetectorRef, elementRef, _document);
    this._orientation = 'vertical';
  }

  static ngAcceptInputType_editable: BooleanInput;
  static ngAcceptInputType_optional: BooleanInput;
  static ngAcceptInputType_completed: BooleanInput;
  static ngAcceptInputType_hasError: BooleanInput;
}
