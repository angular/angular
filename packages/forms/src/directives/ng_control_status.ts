/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Optional, Self} from '@angular/core';

import {AbstractControlDirective} from './abstract_control_directive';
import {ControlContainer} from './control_container';
import {NgControl} from './ng_control';
import {NgForm} from './ng_form';
import {FormGroupDirective} from './reactive_directives/form_group_directive';

export class AbstractControlStatus {
  private _cd: AbstractControlDirective;
  private _controlContainer: ControlContainer|undefined;

  constructor(cd: AbstractControlDirective, controlContainer?: ControlContainer) {
    this._cd = cd;
    this._controlContainer = controlContainer;
  }

  get ngClassUntouched(): boolean { return this._cd.control ? this._cd.control.untouched : false; }
  get ngClassTouched(): boolean { return this._cd.control ? this._cd.control.touched : false; }
  get ngClassPristine(): boolean { return this._cd.control ? this._cd.control.pristine : false; }
  get ngClassDirty(): boolean { return this._cd.control ? this._cd.control.dirty : false; }
  get ngClassValid(): boolean { return this._cd.control ? this._cd.control.valid : false; }
  get ngClassInvalid(): boolean { return this._cd.control ? this._cd.control.invalid : false; }
  get ngClassPending(): boolean { return this._cd.control ? this._cd.control.pending : false; }
  get ngClassSubmitted(): boolean {
    return this._controlContainer && this._controlContainer.formDirective ?
        (this._controlContainer.formDirective as NgForm | FormGroupDirective).submitted :
        false;
  }
}

export const ngControlStatusHost = {
  '[class.ng-untouched]': 'ngClassUntouched',
  '[class.ng-touched]': 'ngClassTouched',
  '[class.ng-pristine]': 'ngClassPristine',
  '[class.ng-dirty]': 'ngClassDirty',
  '[class.ng-valid]': 'ngClassValid',
  '[class.ng-invalid]': 'ngClassInvalid',
  '[class.ng-pending]': 'ngClassPending',
  '[class.ng-submitted]': 'ngClassSubmitted',
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
  constructor(@Self() cd: NgControl, @Optional() controlContainer?: ControlContainer) {
    super(cd, controlContainer);
  }
}

/**
 * @description
 * Directive automatically applied to Angular form groups that sets CSS classes
 * based on control status (valid/invalid/dirty/etc).
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
  host: ngControlStatusHost
})
export class NgControlStatusGroup extends AbstractControlStatus {
  constructor(@Self() cd: ControlContainer) { super(cd, cd); }
}
