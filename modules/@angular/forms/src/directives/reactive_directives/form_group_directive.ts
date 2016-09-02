/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Inject, Input, OnChanges, Optional, Output, Self, SimpleChanges, forwardRef} from '@angular/core';

import {EventEmitter} from '../../facade/async';
import {ListWrapper, StringMapWrapper} from '../../facade/collection';
import {isBlank} from '../../facade/lang';
import {FormArray, FormControl, FormGroup} from '../../model';
import {NG_ASYNC_VALIDATORS, NG_VALIDATORS, Validators} from '../../validators';
import {ControlContainer} from '../control_container';
import {Form} from '../form_interface';
import {ReactiveErrors} from '../reactive_errors';
import {cleanUpControl, composeAsyncValidators, composeValidators, setUpControl, setUpFormContainer} from '../shared';

import {FormControlName} from './form_control_name';
import {FormArrayName, FormGroupName} from './form_group_name';

export const formDirectiveProvider: any = {
  provide: ControlContainer,
  useExisting: forwardRef(() => FormGroupDirective)
};

/**
 * Binds an existing form group to a DOM element.  It requires importing the {@link
 * ReactiveFormsModule}.
 *
 * In this example, we bind the form group to the form element, and we bind the login and
 * password controls to the login and password elements.
 *
 *  ```typescript
 * @Component({
 *   selector: 'my-app',
 *   template: `
 *     <div>
 *       <h2>Binding an existing form group</h2>
 *       <form [formGroup]="loginForm">
 *         <p>Login: <input type="text" formControlName="login"></p>
 *         <p>Password: <input type="password" formControlName="password"></p>
 *       </form>
 *       <p>Value:</p>
 *       <pre>{{ loginForm.value | json}}</pre>
 *     </div>
 *   `
 * })
 * export class App {
 *   loginForm: FormGroup;
 *
 *   constructor() {
 *     this.loginForm = new FormGroup({
 *       login: new FormControl(""),
 *       password: new FormControl("")
 *     });
 *   }
 *
 * }
 *  ```
 *
 * We can also use setValue() to populate the form programmatically.
 *
 *  ```typescript
 * @Component({
 *      selector: "login-comp",
 *      template: `
 *        <form [formGroup]='loginForm'>
 *          Login <input type='text' formControlName='login'>
 *          Password <input type='password' formControlName='password'>
 *          <button (click)="onLogin()">Login</button>
 *        </form>`
 *      })
 * class LoginComp {
 *  loginForm: FormGroup;
 *
 *  constructor() {
 *    this.loginForm = new FormGroup({
 *      login: new FormControl(''),
 *      password: new FormControl('')
 *    });
 *  }
 *
 *  populate() {
 *    this.loginForm.setValue({ login: 'some login', password: 'some password'});
 *  }
 *
 *  onLogin(): void {
 *    // this.credentials.login === 'some login'
 *    // this.credentials.password === 'some password'
 *  }
 * }
 *  ```
 *
 *  @stable
 */
@Directive({
  selector: '[formGroup]',
  providers: [formDirectiveProvider],
  host: {'(submit)': 'onSubmit()', '(reset)': 'onReset()'},
  exportAs: 'ngForm'
})
export class FormGroupDirective extends ControlContainer implements Form,
    OnChanges {
  private _submitted: boolean = false;
  private _oldForm: FormGroup;
  directives: FormControlName[] = [];

  @Input('formGroup') form: FormGroup = null;
  @Output() ngSubmit = new EventEmitter();

  constructor(
      @Optional() @Self() @Inject(NG_VALIDATORS) private _validators: any[],
      @Optional() @Self() @Inject(NG_ASYNC_VALIDATORS) private _asyncValidators: any[]) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this._checkFormPresent();
    if (StringMapWrapper.contains(changes, 'form')) {
      this._updateValidators();
      this._updateDomValue();
      this._updateRegistrations();
    }
  }

  get submitted(): boolean { return this._submitted; }

  get formDirective(): Form { return this; }

  get control(): FormGroup { return this.form; }

  get path(): string[] { return []; }

  addControl(dir: FormControlName): FormControl {
    const ctrl: any = this.form.get(dir.path);
    setUpControl(ctrl, dir);
    ctrl.updateValueAndValidity({emitEvent: false});
    this.directives.push(dir);
    return ctrl;
  }

  getControl(dir: FormControlName): FormControl { return <FormControl>this.form.get(dir.path); }

  removeControl(dir: FormControlName): void { ListWrapper.remove(this.directives, dir); }

  addFormGroup(dir: FormGroupName): void {
    var ctrl: any = this.form.get(dir.path);
    setUpFormContainer(ctrl, dir);
    ctrl.updateValueAndValidity({emitEvent: false});
  }

  removeFormGroup(dir: FormGroupName): void {}

  getFormGroup(dir: FormGroupName): FormGroup { return <FormGroup>this.form.get(dir.path); }

  addFormArray(dir: FormArrayName): void {
    var ctrl: any = this.form.get(dir.path);
    setUpFormContainer(ctrl, dir);
    ctrl.updateValueAndValidity({emitEvent: false});
  }

  removeFormArray(dir: FormArrayName): void {}

  getFormArray(dir: FormArrayName): FormArray { return <FormArray>this.form.get(dir.path); }

  updateModel(dir: FormControlName, value: any): void {
    var ctrl  = <FormControl>this.form.get(dir.path);
    ctrl.setValue(value);
  }

  onSubmit(): boolean {
    this._submitted = true;
    this.ngSubmit.emit(null);
    return false;
  }

  onReset(): void { this.resetForm(); }

  resetForm(value: any = undefined): void {
    this.form.reset(value);
    this._submitted = false;
  }

  /** @internal */
  _updateDomValue() {
    this.directives.forEach(dir => {
      const newCtrl: any = this.form.get(dir.path);
      if (dir._control !== newCtrl) {
        cleanUpControl(dir._control, dir);
        if (newCtrl) setUpControl(newCtrl, dir);
        dir._control = newCtrl;
      }
    });

    this.form._updateTreeValidity({emitEvent: false});
  }

  private _updateRegistrations() {
    this.form._registerOnCollectionChange(() => this._updateDomValue());
    if (this._oldForm) this._oldForm._registerOnCollectionChange(() => {});
    this._oldForm = this.form;
  }

  private _updateValidators() {
    const sync = composeValidators(this._validators);
    this.form.validator = Validators.compose([this.form.validator, sync]);

    const async = composeAsyncValidators(this._asyncValidators);
    this.form.asyncValidator = Validators.composeAsync([this.form.asyncValidator, async]);
  }

  private _checkFormPresent() {
    if (isBlank(this.form)) {
      ReactiveErrors.missingFormException();
    }
  }
}
