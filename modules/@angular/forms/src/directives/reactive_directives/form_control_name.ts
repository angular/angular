/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Host, Inject, Input, OnChanges, OnDestroy, Optional, Output, Self, SimpleChanges, SkipSelf, forwardRef} from '@angular/core';

import {EventEmitter} from '../../facade/async';
import {FormControl} from '../../model';
import {NG_ASYNC_VALIDATORS, NG_VALIDATORS} from '../../validators';
import {AbstractFormGroupDirective} from '../abstract_form_group_directive';
import {ControlContainer} from '../control_container';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '../control_value_accessor';
import {NgControl} from '../ng_control';
import {ReactiveErrors} from '../reactive_errors';
import {composeAsyncValidators, composeValidators, controlPath, isPropertyUpdated, selectValueAccessor} from '../shared';
import {AsyncValidatorFn, ValidatorFn} from '../validators';

import {FormGroupDirective} from './form_group_directive';
import {FormArrayName, FormGroupName} from './form_group_name';

export const controlNameBinding: any = {
  provide: NgControl,
  useExisting: forwardRef(() => FormControlName)
};

/**
 * Syncs an existing form control with the specified name to a DOM element.
 *
 * This directive can only be used as a child of {@link FormGroupDirective}.  It also requires
 * importing the {@link ReactiveFormsModule}.

 * ### Example
 *
 * In this example, we create the login and password controls.
 * We can work with each control separately: check its validity, get its value, listen to its
 * changes.
 *
 *  ```
 * @Component({
 *      selector: "login-comp",
 *      template: `
 *        <form [formGroup]="myForm" (submit)="onLogIn()">
 *          Login <input type="text" formControlName="login">
 *          <div *ngIf="!loginCtrl.valid">Login is invalid</div>
 *          Password <input type="password" formControlName="password">
 *          <button type="submit">Log in!</button>
 *        </form>
 *      `})
 * class LoginComp {
 *  loginCtrl = new FormControl();
 *  passwordCtrl = new FormControl();
 *  myForm = new FormGroup({
 *     login: loginCtrl,
 *     password: passwordCtrl
 *  });
 *  onLogIn(): void {
 *    // value === {login: 'some login', password: 'some password'}
 *  }
 * }
 *  ```
 *
 * We can also set the value of the form programmatically using setValue().
 *
 *  ```
 * @Component({
 *      selector: "login-comp",
 *      template: `
 *        <form [formGroup]="myForm" (submit)='onLogIn()'>
 *          Login <input type='text' formControlName='login'>
 *          Password <input type='password' formControlName='password'>
 *          <button type='submit'>Log in!</button>
 *        </form>
 *      `})
 * class LoginComp {
 *  myForm = new FormGroup({
 *    login: new FormControl(),
 *    password: new FormControl()
 *  });
 *
 *  populate() {
 *     this.myForm.setValue({login: 'some login', password: 'some password'});
 *  }
 *
 *  onLogIn(): void {
 *    // this.credentials.login === "some login"
 *    // this.credentials.password === "some password"
 *  }
 * }
 *  ```
 *
 *  @stable
 */
@Directive({selector: '[formControlName]', providers: [controlNameBinding]})
export class FormControlName extends NgControl implements OnChanges, OnDestroy {
  /** @internal */
  viewModel: any;
  private _added = false;

  @Input('formControlName') name: string;

  // TODO(kara):  Replace ngModel with reactive API
  @Input('ngModel') model: any;
  @Output('ngModelChange') update = new EventEmitter();

  @Input('disabled')
  set disabled(isDisabled: boolean) { ReactiveErrors.disabledAttrWarning(); }

  constructor(
      @Optional() @Host() @SkipSelf() private _parent: ControlContainer,
      @Optional() @Self() @Inject(NG_VALIDATORS) private _validators:
          /* Array<Validator|Function> */ any[],
      @Optional() @Self() @Inject(NG_ASYNC_VALIDATORS) private _asyncValidators:
          /* Array<Validator|Function> */ any[],
      @Optional() @Self() @Inject(NG_VALUE_ACCESSOR) valueAccessors: ControlValueAccessor[]) {
    super();
    this.valueAccessor = selectValueAccessor(this, valueAccessors);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this._added) {
      this._checkParentType();
      this.formDirective.addControl(this);
      if (this.control.disabled) this.valueAccessor.setDisabledState(true);
      this._added = true;
    }
    if (isPropertyUpdated(changes, this.viewModel)) {
      this.viewModel = this.model;
      this.formDirective.updateModel(this, this.model);
    }
  }

  ngOnDestroy(): void { this.formDirective.removeControl(this); }

  viewToModelUpdate(newValue: any): void {
    this.viewModel = newValue;
    this.update.emit(newValue);
  }

  get path(): string[] { return controlPath(this.name, this._parent); }

  get formDirective(): any { return this._parent.formDirective; }

  get validator(): ValidatorFn { return composeValidators(this._validators); }

  get asyncValidator(): AsyncValidatorFn { return composeAsyncValidators(this._asyncValidators); }

  get control(): FormControl { return this.formDirective.getControl(this); }

  private _checkParentType(): void {
    if (!(this._parent instanceof FormGroupName) &&
        this._parent instanceof AbstractFormGroupDirective) {
      ReactiveErrors.ngModelGroupException();
    } else if (
        !(this._parent instanceof FormGroupName) && !(this._parent instanceof FormGroupDirective) &&
        !(this._parent instanceof FormArrayName)) {
      ReactiveErrors.controlParentException();
    }
  }
}
