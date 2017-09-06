/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CdkStep, CdkStepper} from '@angular/cdk/stepper';
import {
  Component,
  ContentChild,
  ContentChildren, Directive,
  // This import is only used to define a generic type. The current TypeScript version incorrectly
  // considers such imports as unused (https://github.com/Microsoft/TypeScript/issues/14953)
  // tslint:disable-next-line:no-unused-variable
  ElementRef,
  forwardRef,
  Inject,
  Optional,
  QueryList,
  SkipSelf,
  ViewChildren,
  ViewEncapsulation
} from '@angular/core';
import {MdStepLabel} from './step-label';
import {
  defaultErrorStateMatcher,
  ErrorOptions,
  MD_ERROR_GLOBAL_OPTIONS,
  ErrorStateMatcher
} from '../core/error/error-options';
import {FormControl, FormGroupDirective, NgForm} from '@angular/forms';
import {MdStepHeader} from './step-header';
import {state, style, transition, trigger, animate} from '@angular/animations';

/** Workaround for https://github.com/angular/angular/issues/17849 */
export const _MdStep = CdkStep;
export const _MdStepper = CdkStepper;

@Component({
  moduleId: module.id,
  selector: 'md-step, mat-step',
  templateUrl: 'step.html',
  providers: [{provide: MD_ERROR_GLOBAL_OPTIONS, useExisting: MdStep}],
  encapsulation: ViewEncapsulation.None
})
export class MdStep extends _MdStep implements ErrorOptions {
  /** Content for step label given by <ng-template matStepLabel> or <ng-template mdStepLabel>. */
  @ContentChild(MdStepLabel) stepLabel: MdStepLabel;

  /** Original ErrorStateMatcher that checks the validity of form control. */
  private _originalErrorStateMatcher: ErrorStateMatcher;

  constructor(@Inject(forwardRef(() => MdStepper)) mdStepper: MdStepper,
              @Optional() @SkipSelf() @Inject(MD_ERROR_GLOBAL_OPTIONS) errorOptions: ErrorOptions) {
    super(mdStepper);
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
  selector: '[mdStepper]'
})
export class MdStepper extends _MdStepper {
  /** The list of step headers of the steps in the stepper. */
  @ViewChildren(MdStepHeader, {read: ElementRef}) _stepHeader: QueryList<ElementRef>;

  /** Steps that the stepper holds. */
  @ContentChildren(MdStep) _steps: QueryList<MdStep>;
}

@Component({
  moduleId: module.id,
  selector: 'md-horizontal-stepper, mat-horizontal-stepper',
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
      state('current', style({transform: 'translate3d(0%, 0, 0)', visibility: 'visible'})),
      state('next', style({transform: 'translate3d(100%, 0, 0)', visibility: 'hidden'})),
      transition('* => *',
          animate('500ms cubic-bezier(0.35, 0, 0.25, 1)'))
    ])
  ],
  providers: [{provide: MdStepper, useExisting: MdHorizontalStepper}],
  encapsulation: ViewEncapsulation.None
})
export class MdHorizontalStepper extends MdStepper { }

@Component({
  moduleId: module.id,
  selector: 'md-vertical-stepper, mat-vertical-stepper',
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
  providers: [{provide: MdStepper, useExisting: MdVerticalStepper}],
  encapsulation: ViewEncapsulation.None
})
export class MdVerticalStepper extends MdStepper { }
