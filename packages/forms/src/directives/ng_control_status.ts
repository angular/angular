/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, Optional, Self, ɵWritable as Writable} from '@angular/core';

import {AbstractControlDirective} from './abstract_control_directive';
import {ControlContainer} from './control_container';
import {NgControl} from './ng_control';
import {type NgForm} from './ng_form';
import {type FormGroupDirective} from './reactive_directives/form_group_directive';

// DO NOT REFACTOR!
// Each status is represented by a separate function to make sure that
// advanced Closure Compiler optimizations related to property renaming
// can work correctly.
export class AbstractControlStatus {
  private _cd: AbstractControlDirective | null;

  constructor(cd: AbstractControlDirective | null) {
    this._cd = cd;
  }

  protected get isTouched() {
    // track the touched signal
    this._cd?.control?._touched?.();
    return !!this._cd?.control?.touched;
  }

  protected get isUntouched() {
    return !!this._cd?.control?.untouched;
  }

  protected get isPristine() {
    // track the pristine signal
    this._cd?.control?._pristine?.();
    return !!this._cd?.control?.pristine;
  }

  protected get isDirty() {
    // pristine signal already tracked above
    return !!this._cd?.control?.dirty;
  }

  protected get isValid() {
    // track the status signal
    this._cd?.control?._status?.();
    return !!this._cd?.control?.valid;
  }

  protected get isInvalid() {
    // status signal already tracked above
    return !!this._cd?.control?.invalid;
  }

  protected get isPending() {
    // status signal already tracked above
    return !!this._cd?.control?.pending;
  }

  protected get isSubmitted() {
    // track the submitted signal
    (this._cd as Writable<NgForm | FormGroupDirective> | null)?._submitted?.();
    // We check for the `submitted` field from `NgForm` and `FormGroupDirective` classes, but
    // we avoid instanceof checks to prevent non-tree-shakable references to those types.
    return !!(this._cd as Writable<NgForm | FormGroupDirective> | null)?.submitted;
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
@Directive({
  selector: '[formControlName],[ngModel],[formControl]',
  host: ngControlStatusHost,
  standalone: false,
})
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
 * @see {@link NgControlStatus}
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
@Directive({
  selector:
    '[formGroupName],[formArrayName],[ngModelGroup],[formGroup],[formArray],form:not([ngNoForm]),[ngForm]',
  host: ngGroupStatusHost,
  standalone: false,
})
export class NgControlStatusGroup extends AbstractControlStatus {
  constructor(@Optional() @Self() cd: ControlContainer) {
    super(cd);
  }
}
