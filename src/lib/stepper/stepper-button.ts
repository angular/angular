/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive} from '@angular/core';
import {CdkStepper, CdkStepperNext, CdkStepperPrevious} from '@angular/cdk/stepper';
import {MatStepper} from './stepper';

// TODO(devversion): workaround for https://github.com/angular/material2/issues/12760
export const _CdkStepperNext = CdkStepperNext;
export const _CdkStepperPrevious = CdkStepperPrevious;

/** Button that moves to the next step in a stepper workflow. */
@Directive({
  selector: 'button[matStepperNext]',
  host: {
    '(click)': '_stepper.next()',
    '[type]': 'type',
  },
  inputs: ['type'],
  providers: [{provide: CdkStepper, useExisting: MatStepper}]
})
export class MatStepperNext extends _CdkStepperNext {}

/** Button that moves to the previous step in a stepper workflow. */
@Directive({
  selector: 'button[matStepperPrevious]',
  host: {
    '(click)': '_stepper.previous()',
    '[type]': 'type',
  },
  inputs: ['type'],
  providers: [{provide: CdkStepper, useExisting: MatStepper}]
})
export class MatStepperPrevious extends _CdkStepperPrevious {}
