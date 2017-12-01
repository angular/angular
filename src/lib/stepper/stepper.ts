/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {animate, state, style, transition, trigger} from '@angular/animations';
import {CdkStep, CdkStepper} from '@angular/cdk/stepper';
import {
  AfterContentInit,
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  forwardRef,
  Inject,
  QueryList,
  SkipSelf,
  ViewChildren,
  ViewEncapsulation,
  ChangeDetectionStrategy,
} from '@angular/core';
import {FormControl, FormGroupDirective, NgForm} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {MatStepHeader} from './step-header';
import {MatStepLabel} from './step-label';
import {takeUntil} from 'rxjs/operators/takeUntil';

@Component({
  moduleId: module.id,
  selector: 'mat-step',
  templateUrl: 'step.html',
  providers: [{provide: ErrorStateMatcher, useExisting: MatStep}],
  encapsulation: ViewEncapsulation.None,
  exportAs: 'matStep',
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatStep extends CdkStep implements ErrorStateMatcher {
  /** Content for step label given by <ng-template matStepLabel>. */
  @ContentChild(MatStepLabel) stepLabel: MatStepLabel;

  constructor(@Inject(forwardRef(() => MatStepper)) stepper: MatStepper,
              @SkipSelf() private _errorStateMatcher: ErrorStateMatcher) {
    super(stepper);
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

@Directive({
  selector: '[matStepper]'
})
export class MatStepper extends CdkStepper implements AfterContentInit {
  /** The list of step headers of the steps in the stepper. */
  @ViewChildren(MatStepHeader, {read: ElementRef}) _stepHeader: QueryList<ElementRef>;

  /** Steps that the stepper holds. */
  @ContentChildren(MatStep) _steps: QueryList<MatStep>;

  ngAfterContentInit() {
    // Mark the component for change detection whenever the content children query changes
    this._steps.changes.pipe(takeUntil(this._destroyed)).subscribe(() => this._stateChanged());
  }
}

@Component({
  moduleId: module.id,
  selector: 'mat-horizontal-stepper',
  exportAs: 'matHorizontalStepper',
  templateUrl: 'stepper-horizontal.html',
  styleUrls: ['stepper.css'],
  inputs: ['selectedIndex'],
  host: {
    'class': 'mat-stepper-horizontal',
    'aria-orientation': 'horizontal',
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatHorizontalStepper extends MatStepper { }

@Component({
  moduleId: module.id,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatVerticalStepper extends MatStepper { }
