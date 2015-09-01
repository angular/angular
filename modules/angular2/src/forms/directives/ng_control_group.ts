import {Directive, LifecycleEvent} from 'angular2/metadata';
import {Inject, Host, SkipSelf, forwardRef, Binding} from 'angular2/di';
import {ListWrapper} from 'angular2/src/core/facade/collection';
import {CONST_EXPR} from 'angular2/src/core/facade/lang';

import {ControlContainer} from './control_container';
import {controlPath} from './shared';
import {ControlGroup} from '../model';
import {Form} from './form_interface';

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
 *      directives: [FORM_DIRECTIVES],
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
 */
@Directive({
  selector: '[ng-control-group]',
  bindings: [controlGroupBinding],
  properties: ['name: ng-control-group'],
  lifecycle: [LifecycleEvent.OnInit, LifecycleEvent.OnDestroy],
  exportAs: 'form'
})
export class NgControlGroup extends ControlContainer {
  _parent: ControlContainer;
  constructor(@Host() @SkipSelf() _parent: ControlContainer) {
    super();
    this._parent = _parent;
  }

  onInit() { this.formDirective.addControlGroup(this); }

  onDestroy() { this.formDirective.removeControlGroup(this); }

  get control(): ControlGroup { return this.formDirective.getControlGroup(this); }

  get path(): string[] { return controlPath(this.name, this._parent); }

  get formDirective(): Form { return this._parent.formDirective; }
}
