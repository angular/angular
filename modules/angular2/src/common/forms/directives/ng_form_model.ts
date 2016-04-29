import {CONST_EXPR, isBlank} from 'angular2/src/facade/lang';
import {ListWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {BaseException} from 'angular2/src/facade/exceptions';
import {ObservableWrapper, EventEmitter} from 'angular2/src/facade/async';
import {
  SimpleChange,
  OnChanges,
  Directive,
  forwardRef,
  Provider,
  Inject,
  Optional,
  Self
} from 'angular2/core';
import {NgControl} from './ng_control';
import {NgControlGroup} from './ng_control_group';
import {ControlContainer} from './control_container';
import {Form} from './form_interface';
import {Control, ControlGroup} from '../model';
import {setUpControl, setUpControlGroup, composeValidators, composeAsyncValidators} from './shared';
import {Validators, NG_VALIDATORS, NG_ASYNC_VALIDATORS} from '../validators';

const formDirectiveProvider =
    CONST_EXPR(new Provider(ControlContainer, {useExisting: forwardRef(() => NgFormModel)}));

/**
 * Binds an existing control group to a DOM element.
 *
 * ### Example ([live demo](http://plnkr.co/edit/jqrVirudY8anJxTMUjTP?p=preview))
 *
 * In this example, we bind the control group to the form element, and we bind the login and
 * password controls to the login and password elements.
 *
 *  ```typescript
 * @Component({
 *   selector: 'my-app',
 *   template: `
 *     <div>
 *       <h2>NgFormModel Example</h2>
 *       <form [ngFormModel]="loginForm">
 *         <p>Login: <input type="text" ngControl="login"></p>
 *         <p>Password: <input type="password" ngControl="password"></p>
 *       </form>
 *       <p>Value:</p>
 *       <pre>{{value}}</pre>
 *     </div>
 *   `,
 *   directives: [FORM_DIRECTIVES]
 * })
 * export class App {
 *   loginForm: ControlGroup;
 *
 *   constructor() {
 *     this.loginForm = new ControlGroup({
 *       login: new Control(""),
 *       password: new Control("")
 *     });
 *   }
 *
 *   get value(): string {
 *     return JSON.stringify(this.loginForm.value, null, 2);
 *   }
 * }
 *  ```
 *
 * We can also use ngModel to bind a domain model to the form.
 *
 *  ```typescript
 * @Component({
 *      selector: "login-comp",
 *      directives: [FORM_DIRECTIVES],
 *      template: `
 *        <form [ngFormModel]='loginForm'>
 *          Login <input type='text' ngControl='login' [(ngModel)]='credentials.login'>
 *          Password <input type='password' ngControl='password'
 *                          [(ngModel)]='credentials.password'>
 *          <button (click)="onLogin()">Login</button>
 *        </form>`
 *      })
 * class LoginComp {
 *  credentials: {login: string, password: string};
 *  loginForm: ControlGroup;
 *
 *  constructor() {
 *    this.loginForm = new ControlGroup({
 *      login: new Control(""),
 *      password: new Control("")
 *    });
 *  }
 *
 *  onLogin(): void {
 *    // this.credentials.login === 'some login'
 *    // this.credentials.password === 'some password'
 *  }
 * }
 *  ```
 */
@Directive({
  selector: '[ngFormModel]',
  bindings: [formDirectiveProvider],
  inputs: ['form: ngFormModel'],
  host: {'(submit)': 'onSubmit()'},
  outputs: ['ngSubmit'],
  exportAs: 'ngForm'
})
export class NgFormModel extends ControlContainer implements Form,
    OnChanges {
  form: ControlGroup = null;
  directives: NgControl[] = [];
  ngSubmit = new EventEmitter();

  constructor(@Optional() @Self() @Inject(NG_VALIDATORS) private _validators: any[],
              @Optional() @Self() @Inject(NG_ASYNC_VALIDATORS) private _asyncValidators: any[]) {
    super();
  }

  ngOnChanges(changes: {[key: string]: SimpleChange}): void {
    this._checkFormPresent();
    if (StringMapWrapper.contains(changes, "form")) {
      var sync = composeValidators(this._validators);
      this.form.validator = Validators.compose([this.form.validator, sync]);

      var async = composeAsyncValidators(this._asyncValidators);
      this.form.asyncValidator = Validators.composeAsync([this.form.asyncValidator, async]);

      this.form.updateValueAndValidity({onlySelf: true, emitEvent: false});
    }

    this._updateDomValue();
  }

  get formDirective(): Form { return this; }

  get control(): ControlGroup { return this.form; }

  get path(): string[] { return []; }

  addControl(dir: NgControl): void {
    var ctrl: any = this.form.find(dir.path);
    setUpControl(ctrl, dir);
    ctrl.updateValueAndValidity({emitEvent: false});
    this.directives.push(dir);
  }

  getControl(dir: NgControl): Control { return <Control>this.form.find(dir.path); }

  removeControl(dir: NgControl): void { ListWrapper.remove(this.directives, dir); }

  addControlGroup(dir: NgControlGroup) {
    var ctrl: any = this.form.find(dir.path);
    setUpControlGroup(ctrl, dir);
    ctrl.updateValueAndValidity({emitEvent: false});
  }

  removeControlGroup(dir: NgControlGroup) {}

  getControlGroup(dir: NgControlGroup): ControlGroup {
    return <ControlGroup>this.form.find(dir.path);
  }

  updateModel(dir: NgControl, value: any): void {
    var ctrl  = <Control>this.form.find(dir.path);
    ctrl.updateValue(value);
  }

  onSubmit(): boolean {
    ObservableWrapper.callEmit(this.ngSubmit, null);
    return false;
  }

  /** @internal */
  _updateDomValue() {
    this.directives.forEach(dir => {
      var ctrl: any = this.form.find(dir.path);
      dir.valueAccessor.writeValue(ctrl.value);
    });
  }

  private _checkFormPresent() {
    if (isBlank(this.form)) {
      throw new BaseException(
          `ngFormModel expects a form. Please pass one in. Example: <form [ngFormModel]="myCoolForm">`);
    }
  }
}
