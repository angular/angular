/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Inject, Input, OnChanges, Optional, Output, Self, SimpleChanges, forwardRef} from '@angular/core';

import {EventEmitter} from '../../facade/async';
import {StringMapWrapper} from '../../facade/collection';
import {FormControl} from '../../model';
import {NG_ASYNC_VALIDATORS, NG_VALIDATORS} from '../../validators';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '../control_value_accessor';
import {NgControl} from '../ng_control';
import {ReactiveErrors} from '../reactive_errors';
import {composeAsyncValidators, composeValidators, isPropertyUpdated, selectValueAccessor, setUpControl} from '../shared';
import {AsyncValidatorFn, Validator, ValidatorFn} from '../validators';

export const formControlBinding: any = {
  provide: NgControl,
  useExisting: forwardRef(() => FormControlDirective)
};

/**
 * Binds an existing {@link FormControl} to a DOM element. It requires importing the {@link
 * ReactiveFormsModule}.
 *
 * In this example, we bind the control to an input element. When the value of the input element
 * changes, the value of the control will reflect that change. Likewise, if the value of the
 * control changes, the input element reflects that change.
 *
 *  ```typescript
 * @Component({
 *   selector: 'my-app',
 *   template: `
 *     <div>
 *       <h2>Bind existing control example</h2>
 *       <form>
 *         <p>Element with existing control: <input type="text"
 * [formControl]="loginControl"></p>
 *         <p>Value of existing control: {{loginControl.value}}</p>
 *       </form>
 *     </div>
 *   `,
 * })
 * export class App {
 *   loginControl: FormControl = new FormControl('');
 * }
 *  ```
 *
 * ### ngModel
 *
 * We can also set the value of the form programmatically with setValue().
 **
 *  ```typescript
 * @Component({
 *      selector: "login-comp",

 *      template: "<input type='text' [formControl]='loginControl'>"
 *      })
 * class LoginComp {
 *  loginControl: FormControl = new FormControl('');
 *
 *  populate() {
 *    this.loginControl.setValue('some login');
 *  }
 *
 * }
 *  ```
 *
 *  @stable
 */
@Directive({selector: '[formControl]', providers: [formControlBinding], exportAs: 'ngForm'})

export class FormControlDirective extends NgControl implements OnChanges {
  viewModel: any;

  @Input('formControl') form: FormControl;
  @Input('ngModel') model: any;
  @Output('ngModelChange') update = new EventEmitter();

  @Input('disabled')
  set isDisabled(isDisabled: boolean) { ReactiveErrors.disabledAttrWarning(); }

  constructor(@Optional() @Self() @Inject(NG_VALIDATORS) validators: Array<Validator|ValidatorFn>,
              @Optional() @Self() @Inject(NG_ASYNC_VALIDATORS) asyncValidators: Array<Validator|AsyncValidatorFn>,
              @Optional() @Self() @Inject(NG_VALUE_ACCESSOR)
              valueAccessors: ControlValueAccessor[]) {
                super();
                this._rawValidators = validators || [];
                this._rawAsyncValidators = asyncValidators || [];
                this.valueAccessor = selectValueAccessor(this, valueAccessors);
              }

              ngOnChanges(changes: SimpleChanges): void {
                if (this._isControlChanged(changes)) {
                  setUpControl(this.form, this);
                  if (this.control.disabled) this.valueAccessor.setDisabledState(true);
                  this.form.updateValueAndValidity({emitEvent: false});
                }
                if (isPropertyUpdated(changes, this.viewModel)) {
                  this.form.setValue(this.model);
                  this.viewModel = this.model;
                }
              }

              get path(): string[] { return []; }

              get validator(): ValidatorFn { return composeValidators(this._rawValidators); }

              get asyncValidator(): AsyncValidatorFn {
                return composeAsyncValidators(this._rawAsyncValidators);
              }

              get control(): FormControl { return this.form; }

              viewToModelUpdate(newValue: any): void {
                this.viewModel = newValue;
                this.update.emit(newValue);
              }

              private _isControlChanged(changes: {[key: string]: any}): boolean {
                return StringMapWrapper.contains(changes, 'form');
              }
}
