/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, HostListener, Input} from '@angular/core';

import {CdkStepper} from './stepper';

/** Button that moves to the next step in a stepper workflow. */
@Directive({
  selector: 'button[cdkStepperNext]',
  host: {
    '[type]': 'type',
  }
})
export class CdkStepperNext {
  /** Type of the next button. Defaults to "submit" if not specified. */
  @Input() type: string = 'submit';

  constructor(public _stepper: CdkStepper) {}

  // We have to use a `HostListener` here in order to support both Ivy and ViewEngine.
  // In Ivy the `host` bindings will be merged when this class is extended, whereas in
  // ViewEngine they're overwritte.
  // TODO(crisbeto): we move this back into `host` once Ivy is turned on by default.
  // tslint:disable-next-line:no-host-decorator-in-concrete
  @HostListener('click')
  _handleClick() {
    this._stepper.next();
  }
}

/** Button that moves to the previous step in a stepper workflow. */
@Directive({
  selector: 'button[cdkStepperPrevious]',
  host: {
    '[type]': 'type',
  }
})
export class CdkStepperPrevious {
  /** Type of the previous button. Defaults to "button" if not specified. */
  @Input() type: string = 'button';

  constructor(public _stepper: CdkStepper) {}

  // We have to use a `HostListener` here in order to support both Ivy and ViewEngine.
  // In Ivy the `host` bindings will be merged when this class is extended, whereas in
  // ViewEngine they're overwritte.
  // TODO(crisbeto): we move this back into `host` once Ivy is turned on by default.
  // tslint:disable-next-line:no-host-decorator-in-concrete
  @HostListener('click')
  _handleClick() {
    this._stepper.previous();
  }
}
