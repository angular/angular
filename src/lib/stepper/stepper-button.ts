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
import {_inheritCtorParametersMetadata} from '@angular/material/core';

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
export class MatStepperNext extends CdkStepperNext {}

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
export class MatStepperPrevious extends CdkStepperPrevious {}

// TODO(devversion): workaround for https://github.com/angular/material2/issues/12760
_inheritCtorParametersMetadata(MatStepperNext, CdkStepperNext);
_inheritCtorParametersMetadata(MatStepperPrevious, CdkStepperPrevious);
