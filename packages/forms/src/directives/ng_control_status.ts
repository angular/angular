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

type AnyControlStatus =
    'untouched'|'touched'|'pristine'|'dirty'|'valid'|'invalid'|'pending'|'submitted';

export class AbstractControlStatus {
  private _cd: AbstractControlDirective|null;

  constructor(cd: AbstractControlDirective|null) {
    this._cd = cd;
  }

  is(status: AnyControlStatus): boolean {
    // Currently with ViewEngine (in AOT mode) it's not possible to use private methods in host
    // bindings.
    // TODO: once ViewEngine is removed, this function should be refactored:
    //  - make the `is` method `protected`, so it's not accessible publicly
    //  - move the `submitted` status logic to the `NgControlStatusGroup` class
    //    and make it `private` or `protected` too.
    if (status === 'submitted') {
      // We check for the `submitted` field from `NgForm` and `FormGroupDirective` classes, but
      // we avoid instanceof checks to prevent non-tree-shakable references to those types.
      return !!(this._cd as unknown as {submitted: boolean} | null)?.submitted;
    }
    return !!this._cd?.control?.[status];
  }
}

export const ngControlStatusHost = {
  '[class.ng-untouched]': 'is("untouched")',
  '[class.ng-touched]': 'is("touched")',
  '[class.ng-pristine]': 'is("pristine")',
  '[class.ng-dirty]': 'is("dirty")',
  '[class.ng-valid]': 'is("valid")',
  '[class.ng-invalid]': 'is("invalid")',
  '[class.ng-pending]': 'is("pending")',
};

export const ngGroupStatusHost = {
  '[class.ng-untouched]': 'is("untouched")',
  '[class.ng-touched]': 'is("touched")',
  '[class.ng-pristine]': 'is("pristine")',
  '[class.ng-dirty]': 'is("dirty")',
  '[class.ng-valid]': 'is("valid")',
  '[class.ng-invalid]': 'is("invalid")',
  '[class.ng-pending]': 'is("pending")',
  '[class.ng-submitted]': 'is("submitted")',
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
