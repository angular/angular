/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive} from '@angular/core';
import {CdkStepper, CdkStepperNext, CdkStepperPrevious} from '@angular/cdk/stepper';
import {MatStepper} from './stepper';

/** Workaround for https://github.com/angular/angular/issues/17849 */
export const _MatStepperNext = CdkStepperNext;
export const _MatStepperPrevious = CdkStepperPrevious;

/** Button that moves to the next step in a stepper workflow. */
@Directive({
  selector: 'button[matStepperNext]',
  host: {'(click)': '_stepper.next()'},
  providers: [{provide: CdkStepper, useExisting: MatStepper}]
})
export class MatStepperNext extends _MatStepperNext { }

/** Button that moves to the previous step in a stepper workflow. */
@Directive({
  selector: 'button[matStepperPrevious]',
  host: {'(click)': '_stepper.previous()'},
  providers: [{provide: CdkStepper, useExisting: MatStepper}]
})
export class MatStepperPrevious extends _MatStepperPrevious { }
