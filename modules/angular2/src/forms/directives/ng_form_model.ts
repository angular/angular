import {CONST_EXPR} from 'angular2/src/facade/lang';
import {List, ListWrapper} from 'angular2/src/facade/collection';
import {ObservableWrapper, EventEmitter} from 'angular2/src/facade/async';

import {Directive, onChange} from 'angular2/angular2';
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
 *      directives: [formDirectives],
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
 *      directives: [formDirectives],
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
 *
 * @exportedAs angular2/forms
 */
@Directive({
  selector: '[ng-form-model]',
  hostInjector: [formDirectiveBinding],
  properties: ['form: ng-form-model'],
  lifecycle: [onChange],
  host: {
    '(submit)': 'onSubmit()',
  },
  events: ['ngSubmit'],
  exportAs: 'form'
})
export class NgFormModel extends ControlContainer implements Form {
  form: ControlGroup = null;
  directives: List<NgControl>;
  ngSubmit = new EventEmitter();

  constructor() {
    super();
    this.directives = [];
  }

  onChange(_) { this._updateDomValue(); }

  get formDirective(): Form { return this; }

  get path(): List<string> { return []; }

  addControl(dir: NgControl): void {
    var c: any = this.form.find(dir.path);
    setUpControl(c, dir);
    c.updateValidity();
    ListWrapper.push(this.directives, dir);
  }

  getControl(dir: NgControl): Control { return <Control>this.form.find(dir.path); }

  removeControl(dir: NgControl): void { ListWrapper.remove(this.directives, dir); }

  addControlGroup(dir: NgControlGroup) {}

  removeControlGroup(dir: NgControlGroup) {}

  updateModel(dir: NgControl, value: any): void {
    var c  = <Control>this.form.find(dir.path);
    c.updateValue(value);
  }

  onSubmit() {
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
