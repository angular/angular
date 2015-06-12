import {Directive, Ancestor, onDestroy, onInit} from 'angular2/angular2';
import {Inject, forwardRef, Binding} from 'angular2/di';
import {List, ListWrapper} from 'angular2/src/facade/collection';
import {CONST_EXPR} from 'angular2/src/facade/lang';

import {ControlContainer} from './control_container';
import {controlPath} from './shared';

const controlGroupBinding =
    CONST_EXPR(new Binding(ControlContainer, {toAlias: forwardRef(() => NgControlGroup)}));

/**
 * Creates and binds a control group to a DOM element.
 *
 * This directive can only be used as a child of {@link NgForm} or {@link NgFormModel}.
 *
 * # Example
 *
 * In this example, we create the credentials and personal control groups.
 * We can work with each group separately: check its validity, get its value, listen to its changes.
 *
 *  ```
 * @Component({selector: "signup-comp"})
 * @View({
 *      directives: [formDirectives],
 *      template: `
 *              <form #f="form" (submit)='onSignUp(f.value)'>
 *                <div ng-control-group='credentials' #credentials="form">
 *                  Login <input type='text' ng-control='login'>
 *                  Password <input type='password' ng-control='password'>
 *                </div>
 *                <div *ng-if="!credentials.valid">Credentials are invalid</div>
 *
 *                <div ng-control-group='personal'>
 *                  Name <input type='text' ng-control='name'>
 *                </div>
 *                <button type='submit'>Sign Up!</button>
 *              </form>
 *      `})
 * class SignupComp {
 *  onSignUp(value) {
 *    // value === {personal: {name: 'some name'},
 *    //  credentials: {login: 'some login', password: 'some password'}}
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