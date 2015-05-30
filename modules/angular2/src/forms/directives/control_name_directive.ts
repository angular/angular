import {CONST_EXPR} from 'angular2/src/facade/lang';
import {List} from 'angular2/src/facade/collection';
import {Directive, Ancestor, onDestroy, onInit} from 'angular2/angular2';
import {FORWARD_REF, Binding, Inject} from 'angular2/di';

import {ControlContainerDirective} from './control_container_directive';
import {ControlDirective} from './control_directive';
import {controlPath} from './shared';

const controlNameBinding =
    CONST_EXPR(new Binding(ControlDirective, {toAlias: FORWARD_REF(() => ControlNameDirective)}));

/**
 * Binds a control to a DOM element.
 *
 * # Example
 *
 * In this example, we bind the control to an input element. When the value of the input element
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
 *      template: "<input type='text' [control]='loginControl'>"
 *      })
 * class LoginComp {
 *  loginControl:Control;
 *
 *  constructor() {
 *    this.loginControl = new Control('');
 *  }
 * }
 *
 *  ```
 *
 * @exportedAs angular2/forms
 */
@Directive({
  selector: '[control]',
  hostInjector: [controlNameBinding],
  properties: ['name: control'],
  lifecycle: [onDestroy, onInit]
})
export class ControlNameDirective extends ControlDirective {
  _parent: ControlContainerDirective;
  constructor(@Ancestor() _parent: ControlContainerDirective) {
    super();
    this._parent = _parent;
  }

  onInit() { this.formDirective.addControl(this); }

  onDestroy() { this.formDirective.removeControl(this); }

  get path(): List<string> { return controlPath(this.name, this._parent); }

  get formDirective(): any { return this._parent.formDirective; }
}