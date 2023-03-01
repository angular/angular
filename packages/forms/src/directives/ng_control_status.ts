/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Optional, Self} from '@angular/core';

import {AbstractControlDirective} from './abstract_control_directive';
import {ControlContainer} from './control_container';
import {NgControl} from './ng_control';

// DO NOT REFACTOR!
// Each status is represented by a separate function to make sure that
// advanced Closure Compiler optimizations related to property renaming
// can work correctly.
export class AbstractControlStatus {
  private _cd: AbstractControlDirective|null;

  constructor(cd: AbstractControlDirective|null) {
    this._cd = cd;
  }

  protected get isTouched() {
    return !!this._cd?.control?.touched;
  }

  protected get isUntouched() {
    return !!this._cd?.control?.untouched;
  }

  protected get isPristine() {
    return !!this._cd?.control?.pristine;
  }

  protected get isDirty() {
    return !!this._cd?.control?.dirty;
  }

  protected get isValid() {
    return !!this._cd?.control?.valid;
  }

  protected get isInvalid() {
    return !!this._cd?.control?.invalid;
  }

  protected get isPending() {
    return !!this._cd?.control?.pending;
  }

  protected get isSubmitted() {
    // We check for the `submitted` field from `NgForm` and `FormGroupDirective` classes, but
    // we avoid instanceof checks to prevent non-tree-shakable references to those types.
    return !!(this._cd as unknown as {submitted: boolean} | null)?.submitted;
  }
}

export const ngControlStatusHost = {
  '[class.ng-untouched]': 'isUntouched',
  '[class.ng-touched]': 'isTouched',
  '[class.ng-pristine]': 'isPristine',
  '[class.ng-dirty]': 'isDirty',
  '[class.ng-valid]': 'isValid',
  '[class.ng-invalid]': 'isInvalid',
  '[class.ng-pending]': 'isPending',
};

export const ngGroupStatusHost = {
  ...ngControlStatusHost,
  '[class.ng-submitted]': 'isSubmitted',
};

/**
 * @description
 * Directive automatically applied to Angular form controls that sets CSS classes
 * based on control status.
 *
 * @usageNotes
 *
 * ### CSS classes applied
 *
 * The following classes are applied as the properties become true:
 *
 * * ng-valid
 * * ng-invalid
 * * ng-pending
 * * ng-pristine
 * * ng-dirty
 * * ng-untouched
 * * ng-touched
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
@Directive({selector: '[formControlName],[ngModel],[formControl]', host: ngControlStatusHost})
export class NgControlStatus extends AbstractControlStatus {
  constructor(@Self() cd: NgControl) {
    super(cd);
  }
}

/**
 * @description
 * Directive automatically applied to Angular form groups that sets CSS classes
 * based on control status (valid/invalid/dirty/etc). On groups, this includes the additional
 * class ng-submitted.
 *
 * @see `NgControlStatus`
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
@Directive({
  selector:
      '[formGroupName],[formArrayName],[ngModelGroup],[formGroup],form:not([ngNoForm]),[ngForm]',
  host: ngGroupStatusHost
})
export class NgControlStatusGroup extends AbstractControlStatus {
  constructor(@Optional() @Self() cd: ControlContainer) {
    super(cd);
  }
}
