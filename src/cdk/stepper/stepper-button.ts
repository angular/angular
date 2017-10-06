/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive} from '@angular/core';
import {CdkStepper} from './stepper';

/** Button that moves to the next step in a stepper workflow. */
@Directive({
  selector: 'button[cdkStepperNext]',
  host: {'(click)': '_stepper.next()'}
})
export class CdkStepperNext {
  constructor(public _stepper: CdkStepper) { }
}

/** Button that moves to the previous step in a stepper workflow. */
@Directive({
  selector: 'button[cdkStepperPrevious]',
  host: {'(click)': '_stepper.previous()'}
})
export class CdkStepperPrevious {
  constructor(public _stepper: CdkStepper) { }
}
