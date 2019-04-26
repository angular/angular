/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive} from '@angular/core';

import {
  CdkEditControl,
  CdkEditRevert,
  CdkEditClose,
  EditRef,
} from '@angular/cdk-experimental/popover-edit';

/**
 * A component that attaches to a form within the edit.
 * It coordinates the form state with the table-wide edit system and handles
 * closing the edit when the form is submitted or the user clicks
 * out.
 */
@Directive({
  selector: 'form[matEditLens]',
  host: {
    '(ngSubmit)': 'handleFormSubmit()',
    '(keydown.enter)': 'editRef.trackEnterPressForClose(true)',
    '(keyup.enter)': 'editRef.trackEnterPressForClose(false)',
    '(keyup.escape)': 'close()',
    '(document:click)': 'handlePossibleClickOut($event)',
    'class': 'mat-edit-lens',
  },
  inputs: [
    'clickOutBehavior: matEditLensClickOutBehavior',
    'preservedFormValue: matEditLensPreservedFormValue',
    'ignoreSubmitUnlessValid: matEditLensIgnoreSubmitUnlessValid',
  ],
  outputs: ['preservedFormValueChange: matEditLensPreservedFormValueChange'],
  providers: [EditRef],
})
export class MatEditLens<FormValue> extends CdkEditControl<FormValue> {
}

/** Reverts the form to its initial or previously submitted state on click. */
@Directive({
  selector: 'button[matEditRevert]',
  host: {
    '(click)': 'revertEdit()',
    'type': 'button', // Prevents accidental form submits.
  }
})
export class MatEditRevert<FormValue> extends CdkEditRevert<FormValue> {
}

/** Closes the lens on click. */
@Directive({
  selector: 'button[matEditClose]',
  host: {
    '(click)': 'closeEdit()',
    'type': 'button', // Prevents accidental form submits.
  }
})
export class MatEditClose<FormValue> extends CdkEditClose<FormValue> {
}
