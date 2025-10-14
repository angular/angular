/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { EventEmitter } from '@angular/core';
import { FormGroup } from '../../model/form_group';
import { AbstractFormDirective } from './abstract_form.directive';
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
export declare class FormGroupDirective extends AbstractFormDirective {
    /**
     * @description
     * Tracks the `FormGroup` bound to this directive.
     */
    form: FormGroup;
    /**
     * @description
     * Emits an event when the form submission has been triggered.
     */
    ngSubmit: EventEmitter<any>;
    /**
     * @description
     * Returns the `FormGroup` bound to this directive.
     */
    get control(): FormGroup;
}
