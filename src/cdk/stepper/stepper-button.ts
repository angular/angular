/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Input} from '@angular/core';
import {CdkStepper} from './stepper';

/** Button that moves to the next step in a stepper workflow. */
@Directive({
  selector: 'button[cdkStepperNext]',
  host: {
    '(click)': '_stepper.next()',
    '[type]': 'type',
  }
})
export class CdkStepperNext {
  /** Type of the next button. Defaults to "submit" if not specified. */
  @Input() type: string = 'submit';

  constructor(public _stepper: CdkStepper) {}
}

/** Button that moves to the previous step in a stepper workflow. */
@Directive({
  selector: 'button[cdkStepperPrevious]',
  host: {
    '(click)': '_stepper.previous()',
    '[type]': 'type',
  }
})
export class CdkStepperPrevious {
  /** Type of the previous button. Defaults to "button" if not specified. */
  @Input() type: string = 'button';

  constructor(public _stepper: CdkStepper) {}
}
