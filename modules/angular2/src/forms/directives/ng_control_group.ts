import {Directive, Ancestor, onDestroy, onInit} from 'angular2/angular2';
import {Inject, FORWARD_REF, Binding} from 'angular2/di';
import {List, ListWrapper} from 'angular2/src/facade/collection';
import {CONST_EXPR} from 'angular2/src/facade/lang';

import {ControlContainer} from './control_container';
import {controlPath} from './shared';

const controlGroupBinding =
    CONST_EXPR(new Binding(ControlContainer, {toAlias: FORWARD_REF(() => NgControlGroup)}));

/**
 * Binds a ng-control group to a DOM element.
 *
 * # Example
 *
 * In this example, we create a ng-control group, and we bind the login and
 * password controls to the login and password elements.
 *
 * Here we use {@link formDirectives}, rather than importing each form directive individually, e.g.
 * `NgControl`, `ControlGroupDirective`. This is just a shorthand for the same end result.
 *
 *  ```
 * @Component({selector: "login-comp"})
 * @View({
 *      directives: [formDirectives],
 *      template:
 *              "<form [ng-form-model]='loginForm'>" +
 *              "<div ng-control-group="credentials">
 *              "Login <input type='text' ng-control='login'>" +
 *              "Password <input type='password' ng-control='password'>" +
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
 *        login: new Cntrol(""),
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
  selector: '[ng-control-group]',
  hostInjector: [controlGroupBinding],
  properties: ['name: ng-control-group'],
  lifecycle: [onInit, onDestroy],
  exportAs: 'form'
})
export class NgControlGroup extends ControlContainer {
  _parent: ControlContainer;
  constructor(@Ancestor() _parent: ControlContainer) {
    super();
    this._parent = _parent;
  }

  onInit() { this.formDirective.addControlGroup(this); }

  onDestroy() { this.formDirective.removeControlGroup(this); }

  get path(): List<string> { return controlPath(this.name, this._parent); }

  get formDirective(): any { return this._parent.formDirective; }
}