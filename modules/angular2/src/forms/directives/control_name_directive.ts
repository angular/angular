import {CONST_EXPR} from 'angular2/src/facade/lang';
import {EventEmitter, ObservableWrapper} from 'angular2/src/facade/async';
import {List, StringMapWrapper, StringMap} from 'angular2/src/facade/collection';
import {Directive, Ancestor, onDestroy, onChange} from 'angular2/angular2';
import {FORWARD_REF, Binding, Inject} from 'angular2/di';

import {ControlContainerDirective} from './control_container_directive';
import {ControlDirective} from './control_directive';
import {controlPath} from './shared';
import {Control} from '../model';

const controlNameBinding =
    CONST_EXPR(new Binding(ControlDirective, {toAlias: FORWARD_REF(() => ControlNameDirective)}));

/**
 * Binds a control with the specified name to a DOM element.
 *
 * # Example
 *
 * In this example, we bind the login control to an input element. When the value of the input
 * element
 * changes, the value of
 * the control will reflect that change. Likewise, if the value of the control changes, the input
 * element reflects that
 * change.
 *
 * Here we use {@link formDirectives}, rather than importing each form directive individually, e.g.
 * `ControlDirective`, `ControlGroupDirective`. This is just a shorthand for the same end result.
 *
 *  ```
 * @Component({selector: "login-comp"})
 * @View({
 *      directives: [formDirectives],
 *      template:
 *              "<form [ng-form-model]='loginForm'>" +
 *              "Login <input type='text' ng-control='login'>" +
 *              "<button (click)="onLogin()">Login</button>" +
 *              "</form>"
 *      })
 * class LoginComp {
 *  loginForm:ControlGroup;
 *
 *  constructor() {
 *    this.loginForm = new ControlGroup({
 *      login: new Control(""),
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
  selector: '[ng-control]',
  hostInjector: [controlNameBinding],
  properties: ['name: ng-control', 'model: ng-model'],
  events: ['ngModel'],
  lifecycle: [onDestroy, onChange],
  exportAs: 'form'
})
export class ControlNameDirective extends ControlDirective {
  _parent: ControlContainerDirective;
  ngModel: EventEmitter;
  model: any;
  _added: boolean;

  constructor(@Ancestor() _parent: ControlContainerDirective) {
    super();
    this._parent = _parent;
    this.ngModel = new EventEmitter();
    this._added = false;
  }

  onChange(c: StringMap<string, any>) {
    if (!this._added) {
      this.formDirective.addControl(this);
      this._added = true;
    }
    if (StringMapWrapper.contains(c, "model")) {
      this.formDirective.updateModel(this, this.model);
    }
  }


  onDestroy() { this.formDirective.removeControl(this); }

  viewToModelUpdate(newValue: any): void { ObservableWrapper.callNext(this.ngModel, newValue); }

  get path(): List<string> { return controlPath(this.name, this._parent); }

  get formDirective(): any { return this._parent.formDirective; }

  get control(): Control { return this.formDirective.getControl(this); }
}