import {CONST_EXPR} from 'angular2/src/core/facade/lang';
import {ListWrapper} from 'angular2/src/core/facade/collection';
import {ObservableWrapper, EventEmitter} from 'angular2/src/core/facade/async';

import {Directive, LifecycleEvent} from 'angular2/metadata';
import {forwardRef, Binding} from 'angular2/di';
import {NgControl} from './ng_control';
import {NgControlGroup} from './ng_control_group';
import {ControlContainer} from './control_container';
import {Form} from './form_interface';
import {Control, ControlGroup} from '../model';
import {setUpControl} from './shared';

const formDirectiveBinding =
    CONST_EXPR(new Binding(ControlContainer, {toAlias: forwardRef(() => NgFormModel)}));

/**
 * Binds an existing control group to a DOM element.
 *
 * # Example
 *
 * In this example, we bind the control group to the form element, and we bind the login and
 * password controls to the
 * login and password elements.
 *
 *  ```
 * @Component({selector: "login-comp"})
 * @View({
 *      directives: [FORM_DIRECTIVES],
 *      template: "<form [ng-form-model]='loginForm'>" +
 *              "Login <input type='text' ng-control='login'>" +
 *              "Password <input type='password' ng-control='password'>" +
 *              "<button (click)="onLogin()">Login</button>" +
 *              "</form>"
 *      })
 * class LoginComp {
 *  loginForm:ControlGroup;
 *
 *  constructor() {
 *    this.loginForm = new ControlGroup({
 *      login: new Control(""),
 *      password: new Control("")
 *    });
 *  }
 *
 *  onLogin() {
 *    // this.loginForm.value
 *  }
 * }
 *
 *  ```
 *
 * We can also use ng-model to bind a domain model to the form.
 *
 *  ```
 * @Component({selector: "login-comp"})
 * @View({
 *      directives: [FORM_DIRECTIVES],
 *      template: "<form [ng-form-model]='loginForm'>" +
 *              "Login <input type='text' ng-control='login' [(ng-model)]='login'>" +
 *              "Password <input type='password' ng-control='password' [(ng-model)]='password'>" +
 *              "<button (click)="onLogin()">Login</button>" +
 *              "</form>"
 *      })
 * class LoginComp {
 *  credentials:{login:string, password:string}
 *  loginForm:ControlGroup;
 *
 *  constructor() {
 *    this.loginForm = new ControlGroup({
 *      login: new Control(""),
 *      password: new Control("")
 *    });
 *  }
 *
 *  onLogin() {
 *    // this.credentials.login === 'some login'
 *    // this.credentials.password === 'some password'
 *  }
 * }
 *  ```
 */
@Directive({
  selector: '[ng-form-model]',
  bindings: [formDirectiveBinding],
  properties: ['form: ng-form-model'],
  lifecycle: [LifecycleEvent.OnChanges],
  host: {
    '(submit)': 'onSubmit()',
  },
  events: ['ngSubmit'],
  exportAs: 'form'
})
export class NgFormModel extends ControlContainer implements Form {
  form: ControlGroup = null;
  directives: NgControl[] = [];
  ngSubmit = new EventEmitter();

  onChanges(_) { this._updateDomValue(); }

  get formDirective(): Form { return this; }

  get control(): ControlGroup { return this.form; }

  get path(): string[] { return []; }

  addControl(dir: NgControl): void {
    var c: any = this.form.find(dir.path);
    setUpControl(c, dir);
    c.updateValidity();
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
    var c  = <Control>this.form.find(dir.path);
    c.updateValue(value);
  }

  onSubmit(): boolean {
    ObservableWrapper.callNext(this.ngSubmit, null);
    return false;
  }

  _updateDomValue() {
    ListWrapper.forEach(this.directives, dir => {
      var c: any = this.form.find(dir.path);
      dir.valueAccessor.writeValue(c.value);
    });
  }
}
