/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, EventEmitter, forwardRef, Input, Output, Provider} from '@angular/core';

import {FormGroup} from '../../model/form_group';
import {ControlContainer} from '../control_container';

import {AbstractFormDirective} from './abstract_form.directive';
import {AbstractControl} from '../../forms';

const formDirectiveProvider: Provider = {
  provide: ControlContainer,
  useExisting: forwardRef(() => FormGroupDirective),
};

/**
 * @description
 *
 * Binds an existing `FormGroup` or `FormRecord` to a DOM element.
 *
 * This directive accepts an existing `FormGroup` instance. It will then use this
 * `FormGroup` instance to match any child `FormControl`, `FormGroup`/`FormRecord`,
 * and `FormArray` instances to child `FormControlName`, `FormGroupName`,
 * and `FormArrayName` directives.
 *
 * @see [Reactive Forms Guide](guide/forms/reactive-forms)
 * @see {@link AbstractControl}
 *
 * @usageNotes
 * ### Register Form Group
 *
 * The following example registers a `FormGroup` with first name and last name controls,
 * and listens for the *ngSubmit* event when the button is clicked.
 *
 * {@example forms/ts/simpleFormGroup/simple_form_group_example.ts region='Component'}
 *
 * @ngModule ReactiveFormsModule
 * @publicApi
 */
@Directive({
  selector: '[formGroup]',
  providers: [formDirectiveProvider],
  host: {'(submit)': 'onSubmit($event)', '(reset)': 'onReset()'},
  exportAs: 'ngForm',
  standalone: false,
})
export class FormGroupDirective extends AbstractFormDirective {
  /**
   * @description
   * Tracks the `FormGroup` bound to this directive.
   */
  @Input('formGroup') override form: FormGroup = null!;

  /**
   * @description
   * Emits an event when the form submission has been triggered.
   */
  @Output() override ngSubmit = new EventEmitter();

  /**
   * @description
   * Returns the `FormGroup` bound to this directive.
   */
  override get control(): FormGroup {
    return this.form;
  }
}
