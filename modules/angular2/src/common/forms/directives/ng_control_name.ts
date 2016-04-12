import {CONST_EXPR} from 'angular2/src/facade/lang';
import {EventEmitter, ObservableWrapper} from 'angular2/src/facade/async';

import {
  OnChanges,
  OnDestroy,
  SimpleChange,
  Query,
  Directive,
  forwardRef,
  Host,
  SkipSelf,
  Provider,
  Inject,
  Optional,
  Self
} from 'angular2/core';

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
import {NG_VALIDATORS, NG_ASYNC_VALIDATORS} from '../validators';
import {ValidatorFn, AsyncValidatorFn} from './validators';


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
 *        <form #f="ngForm" (submit)='onLogIn(f.value)'>
 *          Login <input type='text' ngControl='login' #l="form">
 *          <div *ngIf="!l.valid">Login is invalid</div>
 *
 *          Password <input type='password' ngControl='password'>
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
 * We can also use ngModel to bind a domain model to the form.
 *
 *  ```
 * @Component({
 *      selector: "login-comp",
 *      directives: [FORM_DIRECTIVES],
 *      template: `
 *        <form (submit)='onLogIn()'>
 *          Login <input type='text' ngControl='login' [(ngModel)]="credentials.login">
 *          Password <input type='password' ngControl='password'
 *                          [(ngModel)]="credentials.password">
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
  selector: '[ngControl]',
  bindings: [controlNameBinding],
  inputs: ['name: ngControl', 'model: ngModel'],
  outputs: ['update: ngModelChange'],
  exportAs: 'ngForm'
})
export class NgControlName extends NgControl implements OnChanges,
    OnDestroy {
  /** @internal */
  update = new EventEmitter();
  model: any;
  viewModel: any;
  private _added = false;

  constructor(@Host() @SkipSelf() private _parent: ControlContainer,
              @Optional() @Self() @Inject(NG_VALIDATORS) private _validators:
                  /* Array<Validator|Function> */ any[],
              @Optional() @Self() @Inject(NG_ASYNC_VALIDATORS) private _asyncValidators:
                  /* Array<Validator|Function> */ any[],
              @Optional() @Self() @Inject(NG_VALUE_ACCESSOR)
              valueAccessors: ControlValueAccessor[]) {
    super();
    this.valueAccessor = selectValueAccessor(this, valueAccessors);
  }

  ngOnChanges(changes: {[key: string]: SimpleChange}) {
    if (!this._added) {
      this.formDirective.addControl(this);
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
    ObservableWrapper.callEmit(this.update, newValue);
  }

  get path(): string[] { return controlPath(this.name, this._parent); }

  get formDirective(): any { return this._parent.formDirective; }

  get validator(): ValidatorFn { return composeValidators(this._validators); }

  get asyncValidator(): AsyncValidatorFn { return composeAsyncValidators(this._asyncValidators); }

  get control(): Control { return this.formDirective.getControl(this); }
}
