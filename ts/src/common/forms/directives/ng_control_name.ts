import {CONST_EXPR} from 'angular2/src/facade/lang';
import {EventEmitter, ObservableWrapper} from 'angular2/src/facade/async';
import {OnChanges, OnDestroy} from 'angular2/lifecycle_hooks';
import {SimpleChange} from 'angular2/src/core/change_detection';
import {Query, Directive} from 'angular2/src/core/metadata';
import {forwardRef, Host, SkipSelf, Provider, Inject, Optional} from 'angular2/src/core/di';

import {ControlContainer} from './control_container';
import {NgControl} from './ng_control';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from './control_value_accessor';
import {
  controlPath,
  composeValidators,
  composeAsyncValidators,
  isPropertyUpdated,
  selectValueAccessor
} from './shared';
import {Control} from '../model';
import {Validators, NG_VALIDATORS, NG_ASYNC_VALIDATORS} from '../validators';


const controlNameBinding =
    CONST_EXPR(new Provider(NgControl, {useExisting: forwardRef(() => NgControlName)}));

/**
 * Creates and binds a control with a specified name to a DOM element.
 *
 * This directive can only be used as a child of {@link NgForm} or {@link NgFormModel}.

 * ### Example
 *
 * In this example, we create the login and password controls.
 * We can work with each control separately: check its validity, get its value, listen to its
 * changes.
 *
 *  ```
 * @Component({
 *      selector: "login-comp",
 *      directives: [FORM_DIRECTIVES],
 *      template: `
 *        <form #f="form" (submit)='onLogIn(f.value)'>
 *          Login <input type='text' ng-control='login' #l="form">
 *          <div *ng-if="!l.valid">Login is invalid</div>
 *
 *          Password <input type='password' ng-control='password'>
 *          <button type='submit'>Log in!</button>
 *        </form>
 *      `})
 * class LoginComp {
 *  onLogIn(value): void {
 *    // value === {login: 'some login', password: 'some password'}
 *  }
 * }
 *  ```
 *
 * We can also use ng-model to bind a domain model to the form.
 *
 *  ```
 * @Component({
 *      selector: "login-comp",
 *      directives: [FORM_DIRECTIVES],
 *      template: `
 *        <form (submit)='onLogIn()'>
 *          Login <input type='text' ng-control='login' [(ng-model)]="credentials.login">
 *          Password <input type='password' ng-control='password'
 *                          [(ng-model)]="credentials.password">
 *          <button type='submit'>Log in!</button>
 *        </form>
 *      `})
 * class LoginComp {
 *  credentials: {login:string, password:string};
 *
 *  onLogIn(): void {
 *    // this.credentials.login === "some login"
 *    // this.credentials.password === "some password"
 *  }
 * }
 *  ```
 */
@Directive({
  selector: '[ng-control]',
  bindings: [controlNameBinding],
  inputs: ['name: ngControl', 'model: ngModel'],
  outputs: ['update: ngModelChange'],
  exportAs: 'form'
})
export class NgControlName extends NgControl implements OnChanges,
    OnDestroy {
  /** @internal */
  update = new EventEmitter();
  model: any;
  viewModel: any;
  private _added = false;

  constructor(@Host() @SkipSelf() private _parent: ControlContainer,
              @Optional() @Inject(NG_VALIDATORS) private _validators:
                  /* Array<Validator|Function> */ any[],
              @Optional() @Inject(NG_ASYNC_VALIDATORS) private _asyncValidators:
                  /* Array<Validator|Function> */ any[],
              @Optional() @Inject(NG_VALUE_ACCESSOR) valueAccessors: ControlValueAccessor[]) {
    super();
    this.valueAccessor = selectValueAccessor(this, valueAccessors);
  }

  onChanges(changes: {[key: string]: SimpleChange}) {
    if (!this._added) {
      this.formDirective.addControl(this);
      this._added = true;
    }
    if (isPropertyUpdated(changes, this.viewModel)) {
      this.viewModel = this.model;
      this.formDirective.updateModel(this, this.model);
    }
  }

  onDestroy(): void { this.formDirective.removeControl(this); }

  viewToModelUpdate(newValue: any): void {
    this.viewModel = newValue;
    ObservableWrapper.callNext(this.update, newValue);
  }

  get path(): string[] { return controlPath(this.name, this._parent); }

  get formDirective(): any { return this._parent.formDirective; }

  get validator(): Function { return composeValidators(this._validators); }

  get asyncValidator(): Function { return composeAsyncValidators(this._asyncValidators); }

  get control(): Control { return this.formDirective.getControl(this); }
}
