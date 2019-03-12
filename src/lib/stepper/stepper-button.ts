/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CdkStepperNext, CdkStepperPrevious} from '@angular/cdk/stepper';
import {Directive} from '@angular/core';

/** Button that moves to the next step in a stepper workflow. */
@Directive({
  selector: 'button[matStepperNext]',
  host: {
    '[type]': 'type',
  },
  inputs: ['type']
})
export class MatStepperNext extends CdkStepperNext {
}

/** Button that moves to the previous step in a stepper workflow. */
@Directive({
  selector: 'button[matStepperPrevious]',
  host: {
    '[type]': 'type',
  },
  inputs: ['type']
})
export class MatStepperPrevious extends CdkStepperPrevious {
}
