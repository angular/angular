import {Directive, Ancestor, onDestroy, onInit} from 'angular2/angular2';
import {Inject, FORWARD_REF, Binding} from 'angular2/di';
import {List, ListWrapper} from 'angular2/src/facade/collection';
import {CONST_EXPR} from 'angular2/src/facade/lang';

import {ControlContainerDirective} from './control_container_directive';
import {controlPath} from './shared';

const controlGroupBinding = CONST_EXPR(
    new Binding(ControlContainerDirective, {toAlias: FORWARD_REF(() => ControlGroupDirective)}));

/**
 * Binds a control group to a DOM element.
 *
 * # Example
 *
 * In this example, we create a control group, and we bind the login and
 * password controls to the login and password elements.
 *
 * Here we use {@link formDirectives}, rather than importing each form directive individually, e.g.
 * `ControlDirective`, `ControlGroupDirective`. This is just a shorthand for the same end result.
 *
 *  ```
 * @Component({selector: "login-comp"})
 * @View({
 *      directives: [formDirectives],
 *      template:
 *              "<form [form-model]='loginForm'>" +
 *              "<div control-group="credentials">
 *              "Login <input type='text' control='login'>" +
 *              "Password <input type='password' control='password'>" +
 *              "<button (click)="onLogin()">Login</button>" +
 *              "</div>"
 *              "</form>"
 *      })
 * class LoginComp {
 *  loginForm:ControlGroup;
 *
 *  constructor() {
 *    this.loginForm = new ControlGroup({
 *      credentials: new ControlGroup({
 *        login: new Control(""),
 *        password: new Control("")
 *      })
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
  selector: '[control-group]',
  hostInjector: [controlGroupBinding],
  properties: ['name: control-group'],
  lifecycle: [onInit, onDestroy]
})
export class ControlGroupDirective extends ControlContainerDirective {
  _parent: ControlContainerDirective;
  constructor(@Ancestor() _parent: ControlContainerDirective) {
    super();
    this._parent = _parent;
  }

  onInit() { this.formDirective.addControlGroup(this); }

  onDestroy() { this.formDirective.removeControlGroup(this); }

  get path(): List<string> { return controlPath(this.name, this._parent); }

  get formDirective(): any { return this._parent.formDirective; }
}