/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Self} from '@angular/core';

import {AbstractControlDirective} from './abstract_control_directive';
import {ControlContainer} from './control_container';
import {NgControl} from './ng_control';

export class AbstractControlStatus {
  private _cd: AbstractControlDirective;

  constructor(cd: AbstractControlDirective) { this._cd = cd; }

  get ngClassUntouched(): boolean { return this._cd.control ? this._cd.control.untouched : false; }
  get ngClassTouched(): boolean { return this._cd.control ? this._cd.control.touched : false; }
  get ngClassPristine(): boolean { return this._cd.control ? this._cd.control.pristine : false; }
  get ngClassDirty(): boolean { return this._cd.control ? this._cd.control.dirty : false; }
  get ngClassValid(): boolean { return this._cd.control ? this._cd.control.valid : false; }
  get ngClassInvalid(): boolean { return this._cd.control ? this._cd.control.invalid : false; }
  get ngClassPending(): boolean { return this._cd.control ? this._cd.control.pending : false; }
}

export const ngControlStatusHost = {
  '[class.ng-untouched]': 'ngClassUntouched',
  '[class.ng-touched]': 'ngClassTouched',
  '[class.ng-pristine]': 'ngClassPristine',
  '[class.ng-dirty]': 'ngClassDirty',
  '[class.ng-valid]': 'ngClassValid',
  '[class.ng-invalid]': 'ngClassInvalid',
  '[class.ng-pending]': 'ngClassPending',
};

/**
 * Directive automatically applied to Angular form controls that sets CSS classes
 * based on control status. The following classes are applied as the properties
 * become true:
 *
 * * ng-valid
 * * ng-invalid
 * * ng-pending
 * * ng-pristine
 * * ng-dirty
 * * ng-untouched
 * * ng-touched
 *
 * @ngModule FormsModule
 * @ngModule ReactiveFormsModule
 * @publicApi
 */
@Directive({selector: '[formControlName],[ngModel],[formControl]', host: ngControlStatusHost})
export class NgControlStatus extends AbstractControlStatus {
  constructor(@Self() cd: NgControl) { super(cd); }
}

/**
 * Directive automatically applied to Angular form groups that sets CSS classes
 * based on control status (valid/invalid/dirty/etc).
 *
 * @ngModule FormsModule
 * @ngModule ReactiveFormsModule
 * @publicApi
 */
@Directive({
  selector:
      '[formGroupName],[formArrayName],[ngModelGroup],[formGroup],form:not([ngNoForm]),[ngForm]',
  host: ngControlStatusHost
})
export class NgControlStatusGroup extends AbstractControlStatus {
  constructor(@Self() cd: ControlContainer) { super(cd); }
}
