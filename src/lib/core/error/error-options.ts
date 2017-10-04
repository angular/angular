/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';
import {FormGroupDirective, NgForm, NgControl} from '@angular/forms';

/** Error state matcher that matches when a control is invalid and dirty. */
@Injectable()
export class ShowOnDirtyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: NgControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.invalid && (control.dirty || (form && form.submitted)));
  }
}

/** Provider that defines how form controls behave with regards to displaying error messages. */
@Injectable()
export class ErrorStateMatcher {
  isErrorState(control: NgControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.invalid && (control.touched || (form && form.submitted)));
  }
}
