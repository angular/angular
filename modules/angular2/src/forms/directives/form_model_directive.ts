import {CONST_EXPR} from 'angular2/src/facade/lang';
import {List, ListWrapper} from 'angular2/src/facade/collection';
import {ObservableWrapper, EventEmitter} from 'angular2/src/facade/async';

import {Directive, onChange} from 'angular2/angular2';
import {FORWARD_REF, Binding} from 'angular2/di';
import {ControlDirective} from './control_directive';
import {ControlGroupDirective} from './control_group_directive';
import {ControlContainerDirective} from './control_container_directive';
import {FormDirective} from './form_directive';
import {Control, ControlGroup} from '../model';
import {setUpControl} from './shared';

const formDirectiveBinding = CONST_EXPR(
    new Binding(ControlContainerDirective, {toAlias: FORWARD_REF(() => FormModelDirective)}));

/**
 * Binds a control group to a DOM element.
 *
 * # Example
 *
 * In this example, we bind the control group to the form element, and we bind the login and
 * password controls to the
 * login and password elements.
 *
 * Here we use {@link formDirectives}, rather than importing each form directive individually, e.g.
 * `ControlDirective`, `ControlGroupDirective`. This is just a shorthand for the same end result.
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
 * @exportedAs angular2/forms
 */
@Directive({
  selector: '[ng-form-model]',
  hostInjector: [formDirectiveBinding],
  properties: ['form: ng-form-model'],
  lifecycle: [onChange],
  hostListeners: {
    'submit': 'onSubmit()',
  },
  events: ['ngSubmit']
})
export class FormModelDirective extends ControlContainerDirective implements FormDirective {
  form: ControlGroup = null;
  directives: List<ControlDirective>;
  ngSubmit = new EventEmitter();

  constructor() {
    super();
    this.directives = [];
  }

  onChange(_) { this._updateDomValue(); }

  get formDirective(): FormDirective { return this; }

  get path(): List<string> { return []; }

  addControl(dir: ControlDirective): void {
    var c: any = this.form.find(dir.path);
    setUpControl(c, dir);
    c.updateValidity();
    ListWrapper.push(this.directives, dir);
  }

  getControl(dir: ControlDirective): Control { return <Control>this.form.find(dir.path); }

  removeControl(dir: ControlDirective): void { ListWrapper.remove(this.directives, dir); }

  addControlGroup(dir: ControlGroupDirective) {}

  removeControlGroup(dir: ControlGroupDirective) {}

  updateModel(dir: ControlDirective, value: any): void {
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