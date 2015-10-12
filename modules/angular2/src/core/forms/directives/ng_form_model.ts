import {CONST_EXPR} from 'angular2/src/core/facade/lang';
import {ListWrapper} from 'angular2/src/core/facade/collection';
import {ObservableWrapper, EventEmitter} from 'angular2/src/core/facade/async';

import {OnChanges} from 'angular2/lifecycle_hooks';
import {Directive} from 'angular2/src/core/metadata';
import {forwardRef, Provider} from 'angular2/src/core/di';
import {NgControl} from './ng_control';
import {NgControlGroup} from './ng_control_group';
import {ControlContainer} from './control_container';
import {Form} from './form_interface';
import {Control, ControlGroup} from '../model';
import {setUpControl} from './shared';

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
 *       <form [ng-form-model]="loginForm">
 *         <p>Login: <input type="text" ng-control="login"></p>
 *         <p>Password: <input type="password" ng-control="password"></p>
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
 * We can also use ng-model to bind a domain model to the form.
 *
 *  ```typescript
 * @Component({
 *      selector: "login-comp",
 *      directives: [FORM_DIRECTIVES],
 *      template: `
 *        <form [ng-form-model]='loginForm'>
 *          Login <input type='text' ng-control='login' [(ng-model)]='credentials.login'>
 *          Password <input type='password' ng-control='password'
 *                          [(ng-model)]='credentials.password'>
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
  selector: '[ng-form-model]',
  bindings: [formDirectiveProvider],
  inputs: ['form: ng-form-model'],
  host: {'(submit)': 'onSubmit()'},
  outputs: ['ngSubmit'],
  exportAs: 'form'
})
export class NgFormModel extends ControlContainer implements Form,
    OnChanges {
  form: ControlGroup = null;
  directives: NgControl[] = [];
  ngSubmit = new EventEmitter();

  onChanges(_): void { this._updateDomValue(); }

  get formDirective(): Form { return this; }

  get control(): ControlGroup { return this.form; }

  get path(): string[] { return []; }

  addControl(dir: NgControl): void {
    var ctrl: any = this.form.find(dir.path);
    setUpControl(ctrl, dir);
    ctrl.updateValidity();
    this.directives.push(dir);
  }

  getControl(dir: NgControl): Control { return <Control>this.form.find(dir.path); }

  removeControl(dir: NgControl): void { ListWrapper.remove(this.directives, dir); }

  addControlGroup(dir: NgControlGroup) {}

  removeControlGroup(dir: NgControlGroup) {}

  getControlGroup(dir: NgControlGroup): ControlGroup {
    return <ControlGroup>this.form.find(dir.path);
  }

  updateModel(dir: NgControl, value: any): void {
    var ctrl  = <Control>this.form.find(dir.path);
    ctrl.updateValue(value);
  }

  onSubmit(): boolean {
    ObservableWrapper.callNext(this.ngSubmit, null);
    return false;
  }

  /** @internal */
  _updateDomValue() {
    this.directives.forEach(dir => {
      var ctrl: any = this.form.find(dir.path);
      dir.valueAccessor.writeValue(ctrl.value);
    });
  }
}
