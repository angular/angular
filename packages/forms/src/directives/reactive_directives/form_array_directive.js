/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {__decorate} from 'tslib';
import {Directive, EventEmitter, forwardRef, Input, Output} from '@angular/core';
import {ControlContainer} from '../control_container';
import {AbstractFormDirective} from './abstract_form.directive';
const formDirectiveProvider = {
  provide: ControlContainer,
  useExisting: forwardRef(() => FormArrayDirective),
};
/**
 * @description
 *
 * Binds an existing `FormArray` to a DOM element.
 *
 * This directive accepts an existing `FormArray` instance. It will then use this
 * `FormArray` instance to match any child `FormControl`, `FormGroup`/`FormRecord`,
 * and `FormArray` instances to child `FormControlName`, `FormGroupName`,
 * and `FormArrayName` directives.
 *
 * @see [Reactive Forms Guide](guide/reactive-forms)
 * @see {@link AbstractControl}
 *
 * @usageNotes
 * ### Register Form Array
 *
 * The following example registers a `FormArray` with first name and last name controls,
 * and listens for the *ngSubmit* event when the button is clicked.
 *
 * @ngModule ReactiveFormsModule
 * @publicApi
 */
let FormArrayDirective = class FormArrayDirective extends AbstractFormDirective {
  constructor() {
    super(...arguments);
    /**
     * @description
     * Tracks the `FormArray` bound to this directive.
     */
    this.form = null;
    /**
     * @description
     * Emits an event when the form submission has been triggered.
     */
    this.ngSubmit = new EventEmitter();
  }
  /**
   * @description
   * Returns the `FormArray` bound to this directive.
   */
  get control() {
    return this.form;
  }
};
__decorate([Input('formArray')], FormArrayDirective.prototype, 'form', void 0);
__decorate([Output()], FormArrayDirective.prototype, 'ngSubmit', void 0);
FormArrayDirective = __decorate(
  [
    Directive({
      selector: '[formArray]',
      providers: [formDirectiveProvider],
      host: {'(submit)': 'onSubmit($event)', '(reset)': 'onReset()'},
      exportAs: 'ngForm',
      standalone: false,
    }),
  ],
  FormArrayDirective,
);
export {FormArrayDirective};
//# sourceMappingURL=form_array_directive.js.map
