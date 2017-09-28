/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '@angular/core';
import {FormControl, FormGroupDirective, NgForm} from '@angular/forms';

/** Injection token that can be used to specify the global error options. */
export const MAT_ERROR_GLOBAL_OPTIONS =
    new InjectionToken<ErrorOptions>('mat-error-global-options');

export type ErrorStateMatcher =
    (control: FormControl, form: FormGroupDirective | NgForm) => boolean;

export interface ErrorOptions {
  errorStateMatcher?: ErrorStateMatcher;
}

/** Returns whether control is invalid and is either touched or is a part of a submitted form. */
export function defaultErrorStateMatcher(control: FormControl, form: FormGroupDirective | NgForm) {
  const isSubmitted = form && form.submitted;
  return !!(control.invalid && (control.touched || isSubmitted));
}

/** Returns whether control is invalid and is either dirty or is a part of a submitted form. */
export function showOnDirtyErrorStateMatcher(control: FormControl,
    form: FormGroupDirective | NgForm) {
  const isSubmitted = form && form.submitted;
  return !!(control.invalid && (control.dirty || isSubmitted));
}
