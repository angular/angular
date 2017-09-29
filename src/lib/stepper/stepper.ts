/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {animate, state, style, transition, trigger} from '@angular/animations';
import {CdkStep, CdkStepper} from '@angular/cdk/stepper';
import {
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  forwardRef,
  Inject,
  Optional,
  QueryList,
  SkipSelf,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import {FormControl, FormGroupDirective, NgForm} from '@angular/forms';
import {
  defaultErrorStateMatcher,
  ErrorOptions,
  ErrorStateMatcher,
  MAT_ERROR_GLOBAL_OPTIONS,
} from '@angular/material/core';
import {MatStepHeader} from './step-header';
import {MatStepLabel} from './step-label';

/** Workaround for https://github.com/angular/angular/issues/17849 */
export const _MatStep = CdkStep;
export const _MatStepper = CdkStepper;

@Component({
  moduleId: module.id,
  selector: 'mat-step',
  templateUrl: 'step.html',
  providers: [{provide: MAT_ERROR_GLOBAL_OPTIONS, useExisting: MatStep}],
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class MatStep extends _MatStep implements ErrorOptions {
  /** Content for step label given by <ng-template matStepLabel>. */
  @ContentChild(MatStepLabel) stepLabel: MatStepLabel;

  /** Original ErrorStateMatcher that checks the validity of form control. */
  private _originalErrorStateMatcher: ErrorStateMatcher;

  constructor(@Inject(forwardRef(() => MatStepper)) stepper: MatStepper,
              @Optional() @SkipSelf() @Inject(MAT_ERROR_GLOBAL_OPTIONS)
                  errorOptions: ErrorOptions) {
    super(stepper);
    if (errorOptions && errorOptions.errorStateMatcher) {
      this._originalErrorStateMatcher = errorOptions.errorStateMatcher;
    } else {
      this._originalErrorStateMatcher = defaultErrorStateMatcher;
    }
  }

  /** Custom error state matcher that additionally checks for validity of interacted form. */
  errorStateMatcher = (control: FormControl, form: FormGroupDirective | NgForm) => {
    let originalErrorState = this._originalErrorStateMatcher(control, form);

    // Custom error state checks for the validity of form that is not submitted or touched
    // since user can trigger a form change by calling for another step without directly
    // interacting with the current form.
    let customErrorState =  control.invalid && this.interacted;

    return originalErrorState || customErrorState;
  }
}

@Directive({
  selector: '[matStepper]'
})
export class MatStepper extends _MatStepper {
  /** The list of step headers of the steps in the stepper. */
  @ViewChildren(MatStepHeader, {read: ElementRef}) _stepHeader: QueryList<ElementRef>;

  /** Steps that the stepper holds. */
  @ContentChildren(MatStep) _steps: QueryList<MatStep>;
}

@Component({
  moduleId: module.id,
  selector: 'mat-horizontal-stepper',
  templateUrl: 'stepper-horizontal.html',
  styleUrls: ['stepper.css'],
  inputs: ['selectedIndex'],
  host: {
    'class': 'mat-stepper-horizontal',
    'role': 'tablist',
  },
  animations: [
    trigger('stepTransition', [
      state('previous', style({transform: 'translate3d(-100%, 0, 0)', visibility: 'hidden'})),
      state('current', style({transform: 'none', visibility: 'visible'})),
      state('next', style({transform: 'translate3d(100%, 0, 0)', visibility: 'hidden'})),
      transition('* => *', animate('500ms cubic-bezier(0.35, 0, 0.25, 1)'))
    ])
  ],
  providers: [{provide: MatStepper, useExisting: MatHorizontalStepper}],
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class MatHorizontalStepper extends MatStepper { }

@Component({
  moduleId: module.id,
  selector: 'mat-vertical-stepper',
  templateUrl: 'stepper-vertical.html',
  styleUrls: ['stepper.css'],
  inputs: ['selectedIndex'],
  host: {
    'class': 'mat-stepper-vertical',
    'role': 'tablist',
  },
  animations: [
    trigger('stepTransition', [
      state('previous', style({height: '0px', visibility: 'hidden'})),
      state('next', style({height: '0px', visibility: 'hidden'})),
      state('current', style({height: '*', visibility: 'visible'})),
      transition('* <=> current', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ],
  providers: [{provide: MatStepper, useExisting: MatVerticalStepper}],
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class MatVerticalStepper extends MatStepper { }
